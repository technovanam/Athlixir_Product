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
  private readonly fastapiUrl =
    process.env.FASTAPI_URL || 'http://127.0.0.1:8000/api/analyze';
  private readonly internalApiSecret = process.env.INTERNAL_API_SECRET;
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

  private validateVideoCodec(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const validCodecs = ['h264', 'hevc', 'mpeg4', 'h.264', 'h265'];
      const bufferStr = buffer.toString('utf8', 0, Math.min(1000, buffer.length));

      // Simple codec detection from file signature
      if (bufferStr.includes('ftyp')) {
        const type = bufferStr.substring(
          bufferStr.indexOf('ftyp') + 4,
          bufferStr.indexOf('ftyp') + 8,
        );
        if (
          type.includes('isom') ||
          type.includes('iso2') ||
          type.includes('iso4') ||
          type.includes('iso5') ||
          type.includes('iso6') ||
          type.includes('avc1') ||
          type.includes('hev1') ||
          type.includes('hvc1') ||
          type.includes('mp41') ||
          type.includes('mp42') ||
          type.includes('mmp4') ||
          type.includes('M4V ') ||
          type.includes('M4A ') ||
          type.includes('f4v ')
        ) {
          resolve('MP4 (H.264/HEVC)');
        } else {
          reject(new Error(`Unrecognized MP4 variant: ${type}`));
        }
      } else if (bufferStr.includes('mdat') || bufferStr.includes('moov')) {
        resolve('MOV (QuickTime)');
      } else if (buffer[0] === 0x00 && buffer[1] === 0x00) {
        resolve('AVI');
      } else {
        reject(new Error('Video file format not recognized'));
      }
    });
  }

  /**
   * Production flow: validate → store Firebase → create record → trigger AI.
   * Frontend never touches Firebase; playback uses GET /analysis/:id/video/:type.
   */
  async uploadAndAnalyze(
    userId: string,
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
  ) {
    this.logger.log(`Upload request for user ${userId}`);

    if (file.size > 100 * 1024 * 1024) {
      throw new BadRequestException(
        'Video size exceeds the 100MB enterprise limit.',
      );
    }

    const allowedMimeTypes = [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Unsupported video format. Please upload MP4, MOV, or AVI.',
      );
    }

    // Validate actual video codec (not just MIME type)
    try {
      const codecInfo = await this.validateVideoCodec(file.buffer);
      this.logger.log(`Video codec validation passed: ${codecInfo}`);
    } catch (err: any) {
      this.logger.error(`Video codec validation failed: ${err.message}`);
      throw new BadRequestException(
        `Invalid video codec: ${err.message}. Use H.264, HEVC, or MPEG-4 codec.`,
      );
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
        errorMessage: 'Could not upload video files.',
      });
      throw new BadRequestException(
        'Could not store uploaded video. Please check your file and try again.',
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
    delete copy.originalVideoPath;
    delete copy.skeletonOverlayPath;
    delete copy.storageBucket;

    let progressData: any = null;
    if (copy.progress && typeof copy.progress === 'object') {
      progressData = copy.progress;
    }

    return {
      ...copy,
      progressData: progressData || copy.progressData || null,
      progress: typeof copy.progress === 'number' ? copy.progress : 100,
      videoReady: Boolean(copy.videoReady ?? data.originalVideoPath),
      hasOverlay: Boolean(
        copy.skeletonOverlayReady ?? data.skeletonOverlayPath,
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
        this.sanitizeForClient({ id: doc.id, ...doc.data() }),
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

      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const completed = all
        .filter((a: any) => a.status === 'COMPLETED' && a.metrics)
        .sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

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

      // 1. Check if we have a valid fully cached evolution result
      try {
        const cachedDoc = await this.firebaseService.firestore
          .collection('athlete_evolution')
          .doc(userId)
          .get();

        if (cachedDoc.exists) {
          const cachedData = cachedDoc.data();
          if (
            cachedData &&
            cachedData.lastAnalysisId === latestAnalysisId &&
            cachedData.intelligenceData
          ) {
            this.logger.log(
              `Using cached full evolution intelligence for user: ${userId}`,
            );
            return cachedData.intelligenceData;
          }
        }
      } catch (cacheErr: any) {
        this.logger.warn(`Failed to read evolution cache: ${cacheErr.message}`);
      }

      // 2. Cache miss or stale: Call the helper
      const intelligenceData = await this.calculateAndCacheEvolution(
        userId,
        all,
        completed,
      );
      if (intelligenceData) {
        return intelligenceData;
      }

      // Return empty format if AI engine fails
      return {
        evolution: { hasHistory: false },
        consistency: {},
        adaptation: {},
        advanced_injury: [],
        forecast: {},
        talent: [],
        timeline: [],
      };
    } catch (err) {
      this.logger.error(`Error computing evolution for ${userId}`, err);
      return { hasHistory: false, sessionCount: 0, error: true };
    }
  }

  private async calculateAndCacheEvolution(
    userId: string,
    all: any[],
    completed: any[],
  ) {
    if (!this.internalApiSecret) {
      this.logger.error('CRITICAL: INTERNAL_API_SECRET is not configured!');
      return null;
    }
    const latestAnalysisId = completed[completed.length - 1].id;
    try {
      const fastapiIntelUrl =
        process.env.FASTAPI_INTEL_URL ||
        'http://127.0.0.1:8000/api/analyze/intelligence';
      const response = await fetch(fastapiIntelUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.internalApiSecret}`,
        },
        body: JSON.stringify({ analyses: all }),
      });

      if (response.ok) {
        const intelligenceData = await response.json();
        if (intelligenceData.evolution) {
          try {
            this.logger.log(
              `Generating fresh evolution insights for user: ${userId}`,
            );
            const aiInsights =
              await this.aiInsightsService.generateEvolutionInsights(
                userId,
                intelligenceData.evolution,
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
            this.logger.error(
              `Failed to retrieve/generate AI evolution insights: ${aiErr.message}`,
            );
          }
        }
        return intelligenceData;
      } else {
        this.logger.warn(
          `AI engine returned ${response.status} for intelligence calculation.`,
        );
      }
    } catch (err: any) {
      this.logger.error(
        `Failed to reach AI engine for intelligence: ${err.message}`,
      );
    }
    return null;
  }

  private async refreshEvolutionInsightsCache(userId: string) {
    try {
      const snapshot = await this.firebaseService.firestore
        .collection(this.collectionName)
        .where('userId', '==', userId)
        .get();

      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const completed = all
        .filter((a: any) => a.status === 'COMPLETED' && a.metrics)
        .sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

      if (completed.length === 0) return;

      await this.calculateAndCacheEvolution(userId, all, completed);
      this.logger.log(
        `Successfully pre-generated and cached full evolution intelligence for user: ${userId}`,
      );
    } catch (err: any) {
      this.logger.error(
        `Failed to refresh evolution insights cache for user ${userId}: ${err.message}`,
      );
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
    });
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
      // Prevent Firestore from crashing due to undefined properties added by DTO validation
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      Object.assign(updateData, cleanData);
    }

    // Also strip any deeply nested undefined values or NaN just in case
    const sanitizedUpdateData = JSON.parse(JSON.stringify(updateData, (k, v) => (v === undefined || Number.isNaN(v)) ? null : v));

    try {
      await this.firebaseService.firestore
        .collection(this.collectionName)
        .doc(analysisId)
        .set(sanitizedUpdateData, { merge: true });

      if (status === 'COMPLETED' && data) {
        const doc = await this.firebaseService.firestore
          .collection(this.collectionName)
          .doc(analysisId)
          .get();
        const userId = (doc.data() as { userId?: string })?.userId;
        if (userId) {
          await this.persistIntelligenceArtifacts(analysisId, userId, data);

          // Trigger asynchronous background LLM sports science insights generation
          this.aiInsightsService
            .generateIntelligence(analysisId, userId, data)
            .then(async (enrichedData) => {
              this.logger.log(
                `Background LLM enrichment successfully completed for ${analysisId}`,
              );

              // Broadcast fully enriched client payload via WS to dynamically update dashboard
              this.analysisGateway.broadcastStatus(
                analysisId,
                'COMPLETED',
                100,
                this.sanitizeForClient({ ...data, ...enrichedData }),
              );

              // Pre-generate and cache evolution insights in the background
              try {
                this.logger.log(
                  `Pre-generating and caching evolution insights for user: ${userId}`,
                );
                await this.refreshEvolutionInsightsCache(userId);
              } catch (cacheErr: any) {
                this.logger.error(
                  `Failed to pre-generate evolution insights cache: ${cacheErr.message}`,
                );
              }
            })
            .catch((err) => {
              this.logger.error(
                `Background LLM enrichment failed for ${analysisId}: ${err.message}`,
              );
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
      await db
        .collection('metrics')
        .doc(analysisId)
        .set({
          analysisId,
          userId,
          ...(data.metrics as Record<string, unknown>),
          createdAt: ts,
        });
    }
    if (data.scores) {
      await db
        .collection('scores')
        .doc(analysisId)
        .set({
          analysisId,
          userId,
          ...(data.scores as Record<string, unknown>),
          createdAt: ts,
        });
    }
    if (data.benchmarks) {
      await db
        .collection('benchmark_results')
        .doc(analysisId)
        .set({
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
    await this.uploadToFirebaseStorage(
      file.buffer,
      storagePath,
      file.mimetype || 'text/html',
    );

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
      .set(
        { reportReady: true, updatedAt: new Date().toISOString() },
        { merge: true },
      );

    return { success: true };
  }

  async streamReport(
    analysisId: string,
    requestUser: { uid?: string; sub?: string },
  ) {
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

    if (
      storagePath.startsWith('http://') ||
      storagePath.startsWith('https://')
    ) {
      this.logger.log(`Streaming ${type} from URL: ${storagePath}`);
      try {
        const response = await fetch(storagePath);
        if (!response.ok) {
          throw new NotFoundException(
            `Video URL is not accessible: status ${response.status}`,
          );
        }
        return {
          stream: Readable.fromWeb(response.body as any),
          contentType: response.headers.get('content-type') || 'video/mp4',
        };
      } catch (err: any) {
        this.logger.error(
          `Error streaming from URL ${storagePath}: ${err.message}`,
        );
        throw new NotFoundException(
          `Video URL streaming failed: ${err.message}`,
        );
      }
    }

    const buckets = analysis.storageBucket
      ? [analysis.storageBucket as string, ...this.getStorageBucketNames()]
      : this.getStorageBucketNames();

    for (const bucketName of Array.from(new Set(buckets))) {
      try {
        const bucket = this.firebaseService.storage.bucket(bucketName);
        const storageFile = bucket.file(storagePath);
        const [exists] = await storageFile.exists();
        if (!exists) continue;

        const [metadata] = await storageFile.getMetadata();
        this.logger.log(
          `Streaming ${type} from gs://${bucketName}/${storagePath}`,
        );
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
    this.logger.log(`Triggering analysis directly via HTTP for ${analysisId}`);

    const athleteContext = await this.getAthleteContext(userId);
    const previousMetrics = await this.getPreviousMetrics(userId, analysisId);

    try {
      const response = await fetch(this.fastapiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.internalApiSecret}`,
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
        throw new Error(
          `FastAPI responded with ${response.status}: ${errText}`,
        );
      }

      this.logger.log(
        `Successfully triggered analysis directly via HTTP for ${analysisId}`,
      );
      await this.updateStatus(analysisId, 'PROCESSING_POSE', 15);
    } catch (httpErr: any) {
      this.logger.error(
        `Direct HTTP trigger failed: ${httpErr.message}`,
      );
      await this.updateStatus(analysisId, 'FAILED', 0, {
        errorMessage: `Failed to trigger analysis pipeline: ${httpErr.message}`,
      });
    }
  }


  /**
   * Delegates contextual chat to the AI Sports Intelligence handler.
   */
  async chatWithAthleteAssistant(
    analysisId: string,
    userId: string,
    message: string,
  ): Promise<{ success: boolean; reply: string }> {
    const reply = await this.aiInsightsService.handleAthleteChat(
      analysisId,
      userId,
      message,
    );
    return { success: true, reply };
  }
}
