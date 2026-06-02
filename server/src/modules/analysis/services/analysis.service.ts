import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../../../firebase/firebase.service';
import { AnalysisGateway } from '../gateways/analysis.gateway';
import { AiInsightsService } from '../../ai-insights/ai-insights.service';
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { Readable } from 'stream';
import * as crypto from 'crypto';
import { QueueService } from './queue.service';

type PendingVideo = { buffer: Buffer; mimetype: string; expiresAt: number };

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
  private readonly collectionName = 'analyses';
  private readonly athleteProfilesCollection = 'athlete_profiles';
  private readonly fastapiUrl = process.env.FASTAPI_URL || 'http://127.0.0.1:8000/api/analyze';
  private readonly internalApiSecret = process.env.INTERNAL_API_SECRET || 'a-very-secret-and-long-key-for-internal-service-auth';
  private readonly localVideoDir = join(tmpdir(), 'athlixir-videos');
  private readonly pendingVideos = new Map<string, PendingVideo>();

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly analysisGateway: AnalysisGateway,
    private readonly aiInsightsService: AiInsightsService,
    private readonly queueService: QueueService,
  ) {
    mkdirSync(this.localVideoDir, { recursive: true });
  }

  /**
   * Production flow: validate → store Firebase → create record → trigger AI.
   * Frontend never touches Firebase; playback uses GET /analysis/:id/video/:type.
   */
  async uploadAndAnalyze(
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  ) {
    this.logger.log(`Upload request for user ${userId}`);

    if (file.size > 100 * 1024 * 1024) {
      throw new BadRequestException('Video size exceeds the 100MB enterprise limit.');
    }

    const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported video format. Please upload MP4, MOV, or AVI.');
    }

    const analysisId = crypto.randomUUID();
    const fileExtension = file.originalname.split('.').pop() || 'mp4';
    const storagePath = `running-videos/${userId}/original/${analysisId}.${fileExtension}`;

    await this.firebaseService.firestore
      .collection(this.collectionName)
      .doc(analysisId)
      .set({
        analysisId,
        userId,
        athleteId: userId,
        originalVideoPath: storagePath,
        status: 'UPLOADING',
        progress: 0,
        videoReady: false,
        videoUrl: '',
        skeletonOverlayPath: '',
        skeletonOverlayReady: false,
        metrics: null,
        scores: null,
        benchmarks: null,
        injuryRisk: null,
        injuryRisks: null,
        insights: null,
        recommendations: null,
        progressData: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    let signedUrl: string;
    let storageBucket: string;
    try {
      const uploaded = await this.uploadToFirebaseStorage(
        file.buffer,
        storagePath,
        file.mimetype,
      );
      signedUrl = uploaded.signedUrl;
      storageBucket = uploaded.bucketName;
    } catch (err: any) {
      this.logger.error(`Firebase upload failed for ${analysisId}`, err);
      await this.updateStatus(analysisId, 'FAILED', 0, {
        errorMessage: `Storage upload failed: ${err.message}`,
      });
      throw new BadRequestException(
        `Could not store video. Check Firebase Storage configuration. ${err.message}`,
      );
    }

    this.saveLocalVideoCopy(analysisId, file.buffer);
    this.cachePendingVideo(analysisId, file);

    await this.firebaseService.firestore
      .collection(this.collectionName)
      .doc(analysisId)
      .set(
        {
          videoUrl: signedUrl,
          storageBucket,
          videoReady: true,
          status: 'QUEUED',
          progress: 5,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

    this.triggerPythonEngine(analysisId, signedUrl, userId).catch((err) => {
      this.logger.error(`AI dispatch failed for ${analysisId}`, err);
    });

    return {
      success: true,
      analysisId,
      status: 'QUEUED',
      progress: 5,
      videoReady: true,
    };
  }

  private async uploadToFirebaseStorage(
    buffer: Buffer,
    storagePath: string,
    mimetype: string,
  ): Promise<{ signedUrl: string; bucketName: string }> {
    let lastError: Error | null = null;

    for (const bucketName of this.getStorageBucketNames()) {
      try {
        const bucket = this.firebaseService.storage.bucket(bucketName);
        const storageFile = bucket.file(storagePath);
        await storageFile.save(buffer, {
          contentType: mimetype,
          metadata: { firebaseStorageDownloadTokens: crypto.randomUUID() },
        });
        const [signedUrl] = await storageFile.getSignedUrl({
          action: 'read',
          expires: '03-09-2491',
        });
        this.logger.log(`Uploaded to gs://${bucketName}/${storagePath}`);
        return { signedUrl, bucketName };
      } catch (err: any) {
        lastError = err;
        this.logger.warn(`Upload failed on ${bucketName}: ${err.message}`);
      }
    }

    throw lastError ?? new Error('All storage buckets failed');
  }

  private saveLocalVideoCopy(analysisId: string, buffer: Buffer) {
    try {
      writeFileSync(join(this.localVideoDir, `${analysisId}.mp4`), buffer);
    } catch (err: any) {
      this.logger.warn(`Local video cache failed: ${err.message}`);
    }
  }

  private getLocalVideoPath(analysisId: string): string {
    return join(this.localVideoDir, `${analysisId}.mp4`);
  }

  private streamFromLocalDisk(
    analysisId: string,
  ): { stream: Readable; contentType: string } | null {
    const filePath = this.getLocalVideoPath(analysisId);
    if (!existsSync(filePath)) return null;
    return {
      stream: createReadStream(filePath),
      contentType: 'video/mp4',
    };
  }

  private cachePendingVideo(
    analysisId: string,
    file: { buffer: Buffer; mimetype: string },
  ) {
    this.pendingVideos.set(analysisId, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      expiresAt: Date.now() + 60 * 60 * 1000,
    });
  }

  private streamFromPending(
    analysisId: string,
  ): { stream: Readable; contentType: string } | null {
    const entry = this.pendingVideos.get(analysisId);
    if (!entry || Date.now() > entry.expiresAt) {
      this.pendingVideos.delete(analysisId);
      return null;
    }
    return {
      stream: Readable.from(entry.buffer),
      contentType: entry.mimetype || 'video/mp4',
    };
  }

  private getStorageBucketNames(): string[] {
    const defaultBucketName = this.firebaseService.storage.bucket().name;
    return Array.from(
      new Set(
        [
          defaultBucketName,
          'athlixir-sport.appspot.com',
          'athlixir-sport.firebasestorage.app',
        ].filter(Boolean),
      ),
    );
  }

  private resolveUserId(decoded: { uid?: string; sub?: string }): string {
    return decoded.uid ?? decoded.sub ?? '';
  }

  private sanitizeForClient(data: Record<string, unknown>) {
    const copy = { ...data };
    delete copy.videoUrl;
    delete copy.overlayVideoUrl;

    let progressData: any = null;
    if (copy.progress && typeof copy.progress === 'object') {
      progressData = copy.progress;
    }

    return {
      ...copy,
      progressData: progressData || copy.progressData || null,
      progress: typeof copy.progress === 'number' ? copy.progress : 100,
      videoReady: Boolean(copy.videoReady ?? copy.originalVideoPath),
      hasOverlay: Boolean(
        copy.skeletonOverlayReady ?? copy.skeletonOverlayPath,
      ),
    };
  }

  async listAnalyses(userId: string) {
    try {
      const snapshot = await this.firebaseService.firestore
        .collection(this.collectionName)
        .where('userId', '==', userId)
        .get();

      const analyses = snapshot.docs.map((doc) =>
        this.sanitizeForClient({ id: doc.id, ...doc.data() } as Record<string, unknown>),
      );

      return analyses.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (err) {
      this.logger.error(`Error listing analyses for ${userId}`, err);
      return [];
    }
  }

  async getAthleteEvolution(userId: string) {
    try {
      const snapshot = await this.firebaseService.firestore
        .collection(this.collectionName)
        .where('userId', '==', userId)
        .get();

      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Record<string, unknown>));

      const completed = all
        .filter((a: any) => a.status === 'COMPLETED' && a.metrics)
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      if (completed.length === 0) {
        return {
          hasHistory: false,
          sessionCount: 0,
          trend: 'stable',
          bestPerformanceScore: null,
          latestPerformanceScore: null,
          consistencyIndex: null,
          cadenceTrend: 'stable',
          gctTrend: 'stable',
          symmetryTrend: 'stable',
          firstScan: null,
          latestScan: null,
          overallProgress: null,
          cadenceSeries: [],
          gctSeries: [],
          symmetrySeries: [],
          performanceSeries: [],
        };
      }

      const latestAnalysisId = completed[completed.length - 1].id;

      // 1. Check if we have a valid fully cached evolution result to bypass the python server + LLM completely
      try {
        const cachedDoc = await this.firebaseService.firestore
          .collection('athlete_evolution')
          .doc(userId)
          .get();

        if (cachedDoc.exists) {
          const cachedData = cachedDoc.data();
          if (cachedData && cachedData.lastAnalysisId === latestAnalysisId && cachedData.intelligenceData) {
            this.logger.log(`Using cached full evolution intelligence for user: ${userId}`);
            return cachedData.intelligenceData;
          }
        }
      } catch (cacheErr: any) {
        this.logger.warn(`Failed to read evolution cache: ${cacheErr.message}`);
      }

      // 2. Cache miss or stale: Call the AI Engine for full intelligence processing
      try {
        const fastapiIntelUrl = process.env.FASTAPI_INTEL_URL || 'http://127.0.0.1:8000/api/analyze/intelligence';
        const response = await fetch(fastapiIntelUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.internalApiSecret}`,
          },
          body: JSON.stringify({ analyses: all })
        });
        
        if (response.ok) {
          const intelligenceData = await response.json();
          if (intelligenceData.evolution) {
            try {
              this.logger.log(`Cache miss or stale for user: ${userId}. Generating fresh evolution insights.`);
              const aiInsights = await this.aiInsightsService.generateEvolutionInsights(
                userId,
                intelligenceData.evolution
              );
              intelligenceData.evolution.aiInsights = aiInsights;

              // Write the fully calculated intelligenceData to cache
              await this.firebaseService.firestore
                .collection('athlete_evolution')
                .doc(userId)
                .set({
                  userId,
                  intelligenceData,
                  lastAnalysisId: latestAnalysisId,
                  updatedAt: new Date().toISOString(),
                });
            } catch (aiErr: any) {
              this.logger.error(`Failed to retrieve/generate AI evolution insights: ${aiErr.message}`);
            }
          }
          return intelligenceData;
        } else {
          this.logger.warn(`AI engine returned ${response.status} for intelligence calculation. Fallback to empty.`);
        }
      } catch (err) {
        this.logger.error(`Failed to reach AI engine for intelligence: ${err.message}`);
      }

      // Return empty format if AI engine fails
      return {
        evolution: { hasHistory: false },
        consistency: {},
        adaptation: {},
        advanced_injury: [],
        forecast: {},
        talent: [],
        timeline: []
      };
    } catch (err) {
      this.logger.error(`Error computing evolution for ${userId}`, err);
      return { hasHistory: false, sessionCount: 0, error: true };
    }
  }

  private async refreshEvolutionInsightsCache(userId: string) {
    try {
      const snapshot = await this.firebaseService.firestore
        .collection(this.collectionName)
        .where('userId', '==', userId)
        .get();

      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Record<string, unknown>));

      const completed = all
        .filter((a: any) => a.status === 'COMPLETED' && a.metrics)
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      if (completed.length === 0) return;

      const latestAnalysisId = completed[completed.length - 1].id;

      const fastapiIntelUrl = process.env.FASTAPI_INTEL_URL || 'http://127.0.0.1:8000/api/analyze/intelligence';
      const response = await fetch(fastapiIntelUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.internalApiSecret}`,
        },
        body: JSON.stringify({ analyses: all })
      });
      
      if (response.ok) {
        const intelligenceData = await response.json();
        if (intelligenceData.evolution) {
          const aiInsights = await this.aiInsightsService.generateEvolutionInsights(
            userId,
            intelligenceData.evolution
          );
          intelligenceData.evolution.aiInsights = aiInsights;
          
          await this.firebaseService.firestore
            .collection('athlete_evolution')
            .doc(userId)
            .set({
              userId,
              intelligenceData,
              lastAnalysisId: latestAnalysisId,
              updatedAt: new Date().toISOString(),
            });
            
          this.logger.log(`Successfully pre-generated and cached full evolution intelligence for user: ${userId}`);
        }
      }
    } catch (err: any) {
      this.logger.error(`Failed to refresh evolution insights cache for user ${userId}: ${err.message}`);
    }
  }

  async getAnalysis(analysisId: string) {
    const doc = await this.firebaseService.firestore
      .collection(this.collectionName)
      .doc(analysisId)
      .get();

    if (!doc.exists) {
      throw new NotFoundException('Analysis record not found.');
    }

    return this.sanitizeForClient({
      id: doc.id,
      ...doc.data(),
    } as Record<string, unknown>);
  }

  async updateStatus(
    analysisId: string,
    status: string,
    progress: number,
    data?: Record<string, unknown>,
  ) {
    this.logger.log(`Updating ${analysisId}: ${status} (${progress}%)`);

    const updateData: Record<string, unknown> = {
      status,
      progress,
      updatedAt: new Date().toISOString(),
    };

    if (data) {
      Object.assign(updateData, data);
    }

    try {
      await this.firebaseService.firestore
        .collection(this.collectionName)
        .doc(analysisId)
        .set(updateData, { merge: true });

      if (status === 'COMPLETED' && data) {
        const doc = await this.firebaseService.firestore
          .collection(this.collectionName)
          .doc(analysisId)
          .get();
        const userId = (doc.data() as { userId?: string })?.userId;
        if (userId) {
          await this.persistIntelligenceArtifacts(analysisId, userId, data);
          
          // Trigger asynchronous background LLM sports science insights generation
          this.aiInsightsService.generateIntelligence(analysisId, userId, data)
            .then(async (enrichedData) => {
              this.logger.log(`Background LLM enrichment successfully completed for ${analysisId}`);
              
              // Broadcast fully enriched client payload via WS to dynamically update dashboard
              this.analysisGateway.broadcastStatus(
                analysisId,
                'COMPLETED',
                100,
                this.sanitizeForClient({ ...data, ...enrichedData })
              );

              // Pre-generate and cache evolution insights in the background
              try {
                this.logger.log(`Pre-generating and caching evolution insights for user: ${userId}`);
                await this.refreshEvolutionInsightsCache(userId);
              } catch (cacheErr: any) {
                this.logger.error(`Failed to pre-generate evolution insights cache: ${cacheErr.message}`);
              }
            })
            .catch((err) => {
              this.logger.error(`Background LLM enrichment failed for ${analysisId}: ${err.message}`);
            });
        }
      }

      const clientPayload = data ? this.sanitizeForClient(data) : undefined;
      this.analysisGateway.broadcastStatus(
        analysisId,
        status,
        progress,
        clientPayload,
      );
    } catch (err) {
      this.logger.error(`Failed to update analysis ${analysisId}`, err);
    }
  }

  private deriveAgeGroup(dob?: string): string {
    if (!dob) return 'open';
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return 'open';
    const ageMs = Date.now() - birth.getTime();
    const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
    return ageYears < 18 ? 'u18' : 'open';
  }

  private async getAthleteContext(userId: string) {
    const doc = await this.firebaseService.firestore
      .collection(this.athleteProfilesCollection)
      .doc(userId)
      .get();

    if (!doc.exists) {
      return { ageGroup: 'u18', gender: 'male', event: '100m' };
    }

    const d = doc.data() as Record<string, unknown>;
    const genderRaw = String(d.gender || 'male').toLowerCase();
    const gender = genderRaw.startsWith('f') ? 'female' : 'male';
    const event = String(d.primary_event || '100m')
      .toLowerCase()
      .replace(/\s/g, '');

    return {
      ageGroup: this.deriveAgeGroup(d.dob as string),
      gender,
      event,
      heightCm: d.height_cm as number | undefined,
    };
  }

  private async getPreviousMetrics(userId: string, excludeAnalysisId: string) {
    const list = (await this.listAnalyses(userId)) as Array<{
      id?: string;
      status?: string;
      metrics?: Record<string, unknown>;
    }>;
    const previous = list.find(
      (a) =>
        a.id !== excludeAnalysisId && a.status === 'COMPLETED' && a.metrics,
    );
    return (previous?.metrics as Record<string, unknown>) ?? null;
  }

  private async persistIntelligenceArtifacts(
    analysisId: string,
    userId: string,
    data: Record<string, unknown>,
  ) {
    const ts = new Date().toISOString();
    const db = this.firebaseService.firestore;

    if (data.metrics) {
      await db.collection('metrics').doc(analysisId).set({
        analysisId,
        userId,
        ...(data.metrics as Record<string, unknown>),
        createdAt: ts,
      });
    }
    if (data.scores) {
      await db.collection('scores').doc(analysisId).set({
        analysisId,
        userId,
        ...(data.scores as Record<string, unknown>),
        createdAt: ts,
      });
    }
    if (data.benchmarks) {
      await db.collection('benchmark_results').doc(analysisId).set({
        analysisId,
        userId,
        ...(data.benchmarks as Record<string, unknown>),
        createdAt: ts,
      });
    }
    if (data.injuryRisks || data.injuryRisk) {
      await db.collection('injury_risks').doc(analysisId).set({
        analysisId,
        userId,
        injuryRisk: data.injuryRisk,
        injuryRisks: data.injuryRisks,
        createdAt: ts,
      });
    }
    if (data.recommendations) {
      await db.collection('recommendations').doc(analysisId).set({
        analysisId,
        userId,
        items: data.recommendations,
        createdAt: ts,
      });
    }
    await db
      .collection('athlete_progress')
      .doc(`${userId}_${analysisId}`)
      .set({
        userId,
        analysisId,
        metrics: data.metrics || null,
        scores: data.scores || null,
        benchmarks: data.benchmarks || null,
        progress: data.progressData || data.progress || null,
        classification: data.classification || null,
        createdAt: ts,
      });
  }

  async uploadReport(
    analysisId: string,
    userId: string,
    file: { buffer: Buffer; mimetype: string },
  ) {
    const storagePath = `running-videos/${userId}/reports/${analysisId}.html`;
    await this.uploadToFirebaseStorage(file.buffer, storagePath, file.mimetype || 'text/html');

    await this.firebaseService.firestore
      .collection('reports')
      .doc(analysisId)
      .set({
        analysisId,
        userId,
        reportPath: storagePath,
        createdAt: new Date().toISOString(),
      });

    await this.firebaseService.firestore
      .collection(this.collectionName)
      .doc(analysisId)
      .set({ reportReady: true, updatedAt: new Date().toISOString() }, { merge: true });

    return { success: true };
  }

  async streamReport(analysisId: string, requestUser: { uid?: string; sub?: string }) {
    const userId = this.resolveUserId(requestUser);
    const doc = await this.firebaseService.firestore
      .collection(this.collectionName)
      .doc(analysisId)
      .get();
    if (!doc.exists || (doc.data() as { userId?: string }).userId !== userId) {
      throw new NotFoundException('Report not found.');
    }
    const storagePath = `running-videos/${userId}/reports/${analysisId}.html`;
    for (const bucketName of this.getStorageBucketNames()) {
      const bucket = this.firebaseService.storage.bucket(bucketName);
      const file = bucket.file(storagePath);
      const [exists] = await file.exists();
      if (!exists) continue;
      const [metadata] = await file.getMetadata();
      return {
        stream: file.createReadStream(),
        contentType: metadata.contentType || 'text/html',
      };
    }
    throw new NotFoundException('Report not ready yet.');
  }

  async uploadSkeletonOverlay(
    analysisId: string,
    userId: string,
    file: { buffer: Buffer; mimetype: string },
  ) {
    const storagePath = `running-videos/${userId}/overlay/${analysisId}.mp4`;
    const { bucketName } = await this.uploadToFirebaseStorage(
      file.buffer,
      storagePath,
      file.mimetype || 'video/mp4',
    );

    await this.updateStatus(analysisId, 'COMPLETED', 100, {
      skeletonOverlayPath: storagePath,
      storageBucket: bucketName,
      skeletonOverlayReady: true,
    });

    return { success: true };
  }

  async streamVideo(
    analysisId: string,
    requestUser: { uid?: string; sub?: string },
    type: 'original' | 'overlay',
  ): Promise<{ stream: NodeJS.ReadableStream; contentType: string }> {
    const userId = this.resolveUserId(requestUser);
    if (!userId) {
      throw new NotFoundException('Analysis not found.');
    }

    const doc = await this.firebaseService.firestore
      .collection(this.collectionName)
      .doc(analysisId)
      .get();

    if (!doc.exists) {
      throw new NotFoundException('Analysis not found.');
    }

    const analysis = doc.data() as Record<string, unknown>;
    if (analysis.userId !== userId) {
      this.logger.warn(
        `streamVideo user mismatch: record=${analysis.userId} token=${userId}`,
      );
      throw new NotFoundException('Analysis not found.');
    }

    if (type === 'original') {
      const local = this.streamFromLocalDisk(analysisId);
      if (local) return local;

      const pending = this.streamFromPending(analysisId);
      if (pending) return pending;
    }

    const storagePath =
      type === 'overlay'
        ? (analysis.skeletonOverlayPath as string) ||
          `running-videos/${userId}/overlay/${analysisId}.mp4`
        : (analysis.originalVideoPath as string);

    if (!storagePath) {
      throw new NotFoundException('Video not available.');
    }

    if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
      this.logger.log(`Streaming ${type} from URL: ${storagePath}`);
      try {
        const response = await fetch(storagePath);
        if (!response.ok) {
          throw new NotFoundException(`Video URL is not accessible: status ${response.status}`);
        }
        return {
          stream: Readable.fromWeb(response.body as any),
          contentType: response.headers.get('content-type') || 'video/mp4',
        };
      } catch (err: any) {
        this.logger.error(`Error streaming from URL ${storagePath}: ${err.message}`);
        throw new NotFoundException(`Video URL streaming failed: ${err.message}`);
      }
    }


    const buckets = analysis.storageBucket
      ? [
          analysis.storageBucket as string,
          ...this.getStorageBucketNames(),
        ]
      : this.getStorageBucketNames();

    for (const bucketName of Array.from(new Set(buckets))) {
      try {
        const bucket = this.firebaseService.storage.bucket(bucketName);
        const storageFile = bucket.file(storagePath);
        const [exists] = await storageFile.exists();
        if (!exists) continue;

        const [metadata] = await storageFile.getMetadata();
        this.logger.log(`Streaming ${type} from gs://${bucketName}/${storagePath}`);
        return {
          stream: storageFile.createReadStream(),
          contentType: metadata.contentType || 'video/mp4',
        };
      } catch (err: any) {
        this.logger.warn(`streamVideo ${bucketName}: ${err.message}`);
      }
    }

    throw new NotFoundException(
      type === 'overlay'
        ? 'Skeleton overlay not ready yet.'
        : 'Original video not found. Upload a new video.',
    );
  }

  private async triggerPythonEngine(
    analysisId: string,
    videoUrl: string,
    userId: string,
  ) {
    this.logger.log(`Adding analysis job to queue for ${analysisId}`);

    const athleteContext = await this.getAthleteContext(userId);
    const previousMetrics = await this.getPreviousMetrics(userId, analysisId);

    try {
      if (!this.queueService.isReady()) {
        throw new Error('Redis connection is offline');
      }

      // Add a 3-second timeout for the Queue addJob operation to prevent hanging if Redis becomes unresponsive
      await Promise.race([
        this.queueService.addJob('process-video', {
          analysisId,
          videoUrl,
          userId,
          athleteContext,
          previousMetrics,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Queue add job timed out')), 3000)
        ),
      ]);

      this.logger.log(`Job for ${analysisId} successfully added to the queue`);
      await this.updateStatus(analysisId, 'PROCESSING_POSE', 15);
    } catch (err: any) {
      this.logger.warn(
        `Failed to add job to Redis queue: ${err.message}. Falling back to direct HTTP trigger on ${this.fastapiUrl}`,
      );
      try {
        const response = await fetch(this.fastapiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.internalApiSecret}`,
          },
          body: JSON.stringify({
            analysisId,
            videoUrl,
            userId,
            athleteContext,
            previousMetrics,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`FastAPI responded with ${response.status}: ${errText}`);
        }

        this.logger.log(`Successfully triggered analysis directly via HTTP for ${analysisId}`);
        await this.updateStatus(analysisId, 'PROCESSING_POSE', 15);
      } catch (httpErr: any) {
        this.logger.error(`Direct HTTP fallback also failed: ${httpErr.message}`);
        await this.updateStatus(analysisId, 'FAILED', 0, {
          errorMessage: `Failed to trigger analysis pipeline: ${httpErr.message}`,
        });
      }
    }
  }

  private simulateAnalysisPipeline(analysisId: string) {
    const stages = [
      { status: 'QUEUED', progress: 5 },
      { status: 'PROCESSING_POSE', progress: 20 },
      { status: 'TRACKING_LANDMARKS', progress: 40 },
      { status: 'DETECTING_FOOT_STRIKES', progress: 55 },
      { status: 'CALCULATING_METRICS', progress: 70 },
      { status: 'GENERATING_OVERLAY', progress: 85 },
      {
        status: 'COMPLETED',
        progress: 100,
        data: {
          metrics: {
            cadence: 178,
            gct: 198,
            strideLength: 2.05,
            asymmetryIndex: 3.2,
            symmetry: 87.2,
            oscillation: 7.4,
            overstrideAngle: 5.1,
            postureAngle: 7.8,
          },
          benchmarks: {
            profileKey: 'u18_male_100m',
            profileLabel: 'U18 Male 100m Sprint',
            cadenceLevel: 'State',
            gctLevel: 'State',
            strideLevel: 'National',
            levels: {
              cadence: 'State',
              gct: 'State',
              strideLength: 'National',
            },
          },
          scores: {
            performanceScore: 84,
            efficiencyScore: 81,
            biomechanicsScore: 86,
            injuryRiskScore: 18,
            athleteLevel: 'State Potential',
            classification: 'State Potential',
          },
          classification: {
            athleteLevel: 'State Potential',
            classification: 'State Potential',
          },
          injuryRisk: {
            level: 'Low',
            riskArea: 'None',
            score: 18,
          },
          injuryRisks: [
            {
              category: 'Movement Quality',
              detected: false,
              severity: 'none',
              riskArea: 'None',
              detail: 'No significant biomechanical risk flags detected',
            },
          ],
          insights: {
            strengths: [
              'Cadence at 178 SPM — State benchmark level',
              'Ground contact time shows efficient elastic response',
            ],
            weaknesses: ['No major mechanical red flags in this analysis window'],
            observations: [
              'Movement profile is consistent across cadence, contact time, and stride metrics',
            ],
          },
          recommendations: [
            'Maintain current mechanics with periodic sprint-stride video checks.',
            'Continue structured sprint training with weekly biomechanics check-ins.',
          ],
          progress: {
            hasPrevious: false,
            cadenceProgress: null,
            gctProgress: null,
          },
          reportReady: false,
          skeletonOverlayReady: true,
          skeletonOverlayPath: `${process.env.FASTAPI_PUBLIC_URL || 'http://127.0.0.1:8000'}/outputs/${analysisId}_overlay.mp4`,
        },
      },
    ];

    // Play simulation steps
    let currentStageIndex = 0;
    const interval = setInterval(() => {
      const stage = stages[currentStageIndex];
      if (!stage) {
        clearInterval(interval);
        return;
      }
      this.updateStatus(analysisId, stage.status, stage.progress, (stage as any).data);
      currentStageIndex++;
    }, 1500);
  }

  /**
   * Delegates contextual chat to the AI Sports Intelligence handler.
   */
  async chatWithAthleteAssistant(analysisId: string, userId: string, message: string): Promise<{ success: boolean; reply: string }> {
    const reply = await this.aiInsightsService.handleAthleteChat(analysisId, userId, message);
    return { success: true, reply };
  }
}
