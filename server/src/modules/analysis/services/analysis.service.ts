import {
  Injectable,
  Logger,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
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
import {
  getFastApiIntelUrl,
  getFastApiPublicUrl,
  getFastApiUrl,
} from '../../../core/config/service-urls.config';

type PendingVideo = { buffer: Buffer; mimetype: string; expiresAt: number };

const TERMINAL_ANALYSIS_STATUSES = new Set(['COMPLETED', 'FAILED', 'CANCELLED']);

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
  private readonly collectionName = 'analyses';
  private readonly cancelledAnalyses = new Set<string>();
  private aiEnginePrewarmPromise: Promise<boolean> | null = null;
  private readonly athleteProfilesCollection = 'athlete_profiles';
  private readonly fastapiUrl = getFastApiUrl();
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

  private isActiveAnalysisStatus(status?: string): boolean {
    return Boolean(status && !TERMINAL_ANALYSIS_STATUSES.has(status));
  }

  private async getActiveAnalysisForUser(
    userId: string,
  ): Promise<{ analysisId: string; status: string } | null> {
    const snapshot = await this.firebaseService.firestore
      .collection(this.collectionName)
      .where('userId', '==', userId)
      .get();

    const active = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          analysisId: (data.analysisId as string) || doc.id,
          status: data.status as string,
          updatedAt: (data.updatedAt as string) || (data.createdAt as string),
        };
      })
      .filter((item) => this.isActiveAnalysisStatus(item.status))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

    return active[0] ?? null;
  }

  private async failStaleActiveAnalysis(userId: string): Promise<void> {
    const snapshot = await this.firebaseService.firestore
      .collection(this.collectionName)
      .where('userId', '==', userId)
      .get();

    const staleStatuses = new Set(['WAKING_AI_ENGINE', 'QUEUED', 'UPLOADING']);
    const staleMs = 3 * 60 * 1000;
    const now = Date.now();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const status = data.status as string | undefined;
      if (!status || !staleStatuses.has(status)) continue;

      const updatedAt = new Date(
        (data.updatedAt as string) || (data.createdAt as string),
      ).getTime();
      if (Number.isNaN(updatedAt) || now - updatedAt < staleMs) continue;

      const analysisId = (data.analysisId as string) || doc.id;
      this.logger.warn(
        `Marking stale analysis ${analysisId} as FAILED (status=${status})`,
      );
      await this.updateStatus(analysisId, 'FAILED', 0, {
        errorMessage:
          'Analysis timed out while connecting to the AI engine. Please upload again.',
      });
    }
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

    this.startAiEnginePrewarm();

    await this.failStaleActiveAnalysis(userId);

    const activeAnalysis = await this.getActiveAnalysisForUser(userId);
    if (activeAnalysis) {
      throw new ConflictException(
        `An analysis is already running (${activeAnalysis.analysisId.slice(0, 8)}…). ` +
          'Only one running video can be processed at a time. Wait for it to finish before uploading another.',
      );
    }

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
      const fastapiIntelUrl = getFastApiIntelUrl();
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

  private async isAnalysisCancelled(analysisId: string): Promise<boolean> {
    if (this.cancelledAnalyses.has(analysisId)) {
      return true;
    }
    const doc = await this.firebaseService.firestore
      .collection(this.collectionName)
      .doc(analysisId)
      .get();
    return doc.data()?.status === 'CANCELLED';
  }

  private async requestAiEngineCancel(analysisId: string): Promise<void> {
    const cancelUrl = `${getFastApiPublicUrl()}/api/analyze/cancel`;
    try {
      const response = await fetch(cancelUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.internalApiSecret}`,
        },
        body: JSON.stringify({ analysisId }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        const errText = await response.text();
        this.logger.warn(
          `AI engine cancel for ${analysisId} returned ${response.status}: ${errText}`,
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`AI engine cancel request failed for ${analysisId}: ${message}`);
    }
  }

  async cancelAnalysis(analysisId: string, userId: string) {
    const docRef = this.firebaseService.firestore
      .collection(this.collectionName)
      .doc(analysisId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Analysis record not found.');
    }

    const data = doc.data() as { userId?: string; status?: string };
    if (data.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own analyses.');
    }

    if (data.status && TERMINAL_ANALYSIS_STATUSES.has(data.status)) {
      throw new BadRequestException(
        `This analysis is already ${data.status.toLowerCase()}.`,
      );
    }

    this.cancelledAnalyses.add(analysisId);
    this.requestAiEngineCancel(analysisId).catch((err) => {
      this.logger.warn(`Background AI cancel failed for ${analysisId}`, err);
    });

    await this.updateStatus(analysisId, 'CANCELLED', 0, {
      errorMessage: 'Analysis cancelled.',
      statusMessage: null,
    });

    this.logger.log(`Analysis ${analysisId} cancelled by user ${userId}`);
    return {
      success: true,
      analysisId,
      status: 'CANCELLED',
    };
  }

  async updateStatus(
    analysisId: string,
    status: string,
    progress: number,
    data?: Record<string, unknown>,
  ) {
    const docRef = this.firebaseService.firestore
      .collection(this.collectionName)
      .doc(analysisId);
    const existingDoc = await docRef.get();
    const existingStatus = existingDoc.data()?.status as string | undefined;

    if (existingStatus === 'CANCELLED' && status !== 'CANCELLED') {
      this.logger.warn(
        `Ignoring update for cancelled analysis ${analysisId}: ${status}`,
      );
      return;
    }

    const isRegression =
      existingStatus === 'COMPLETED' &&
      status !== 'COMPLETED' &&
      status !== 'FAILED';

    if (isRegression) {
      this.logger.warn(
        `Ignoring stale status downgrade for ${analysisId}: ${existingStatus} -> ${status} (${progress}%)`,
      );
      return;
    }

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
      await docRef.set(sanitizedUpdateData, { merge: true });

      const hasFullResults =
        Boolean(data?.metrics) && typeof data?.metrics === 'object';

      if (status === 'COMPLETED' && data && hasFullResults) {
        const userId = (existingDoc.data() as { userId?: string })?.userId
          ?? (await docRef.get()).data()?.userId;
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

    const overlayUpdate = {
      skeletonOverlayPath: storagePath,
      storageBucket: bucketName,
      skeletonOverlayReady: true,
      updatedAt: new Date().toISOString(),
    };

    await this.firebaseService.firestore
      .collection(this.collectionName)
      .doc(analysisId)
      .set(overlayUpdate, { merge: true });

    const doc = await this.firebaseService.firestore
      .collection(this.collectionName)
      .doc(analysisId)
      .get();

    this.analysisGateway.broadcastStatus(
      analysisId,
      (doc.data()?.status as string) || 'COMPLETED',
      typeof doc.data()?.progress === 'number' ? (doc.data()?.progress as number) : 100,
      this.sanitizeForClient({ id: analysisId, ...doc.data(), ...overlayUpdate }),
    );

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

  private getFastApiHealthUrl(): string {
    return `${getFastApiPublicUrl()}/health`;
  }

  private getHealthCheckTimeoutMs(attempt: number): number {
    if (attempt === 0) return 120_000;
    if (attempt === 1) return 90_000;
    if (attempt === 2) return 60_000;
    return 45_000;
  }

  private async probeAiEngineHealth(timeoutMs: number): Promise<boolean> {
    const healthUrl = this.getFastApiHealthUrl();
    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(timeoutMs),
      });
      return response.ok;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`AI engine health probe failed: ${message}`);
      return false;
    }
  }

  private startAiEnginePrewarm(): void {
    this.aiEnginePrewarmPromise = this.probeAiEngineHealth(120_000);
  }

  private isAiEngineWakeUpError(err: unknown, status?: number): boolean {
    if (status === 502 || status === 503 || status === 504 || status === 408) {
      return true;
    }
    const message = (
      err instanceof Error ? err.message : String(err ?? '')
    ).toLowerCase();
    return (
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('fetch failed') ||
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('bad gateway') ||
      message.includes('service unavailable')
    );
  }

  private async wakeAiEngine(analysisId: string): Promise<boolean> {
    if (this.aiEnginePrewarmPromise) {
      const prewarmed = await this.aiEnginePrewarmPromise;
      this.aiEnginePrewarmPromise = null;
      if (prewarmed) {
        this.logger.log(
          `AI engine ready via upload prewarm for ${analysisId}`,
        );
        return true;
      }
    }

    const healthUrl = this.getFastApiHealthUrl();
    const maxAttempts = 6;
    const retryDelaysMs = [2000, 3000, 5000, 8000, 10000, 12000];

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (await this.isAnalysisCancelled(analysisId)) {
        this.logger.log(`Wake aborted — analysis ${analysisId} was cancelled`);
        return false;
      }

      if (attempt > 0) {
        await this.updateStatus(
          analysisId,
          'WAKING_AI_ENGINE',
          Math.min(8 + attempt * 2, 22),
          {
            statusMessage:
              'Connecting to analysis engine… Your running video is queued — please wait.',
          },
        );
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelaysMs[attempt - 1]),
        );
      }

      const timeoutMs = this.getHealthCheckTimeoutMs(attempt);
      try {
        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (response.ok) {
          this.logger.log(
            `AI engine health check passed on attempt ${attempt + 1} for ${analysisId} (${timeoutMs}ms timeout)`,
          );
          return true;
        }

        this.logger.warn(
          `AI engine health HTTP ${response.status} on attempt ${attempt + 1} for ${analysisId}`,
        );
        if (
          !this.isAiEngineWakeUpError(null, response.status) &&
          attempt >= maxAttempts - 1
        ) {
          return false;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `AI engine health attempt ${attempt + 1}/${maxAttempts} for ${analysisId} (${timeoutMs}ms): ${message}`,
        );
        if (!this.isAiEngineWakeUpError(err) && attempt >= maxAttempts - 1) {
          return false;
        }
      }
    }

    return false;
  }

  private async triggerPythonEngine(
    analysisId: string,
    videoUrl: string,
    userId: string,
  ) {
    this.logger.log(`Triggering analysis directly via HTTP for ${analysisId}`);

    const awake = await this.wakeAiEngine(analysisId);
    if (!awake) {
      if (await this.isAnalysisCancelled(analysisId)) {
        return;
      }
      await this.updateStatus(analysisId, 'FAILED', 0, {
        errorMessage:
          'Could not connect to the analysis engine. Please try again in a moment.',
      });
      return;
    }

    const athleteContext = await this.getAthleteContext(userId);
    const previousMetrics = await this.getPreviousMetrics(userId, analysisId);
    const maxTriggerAttempts = 3;

    for (let attempt = 0; attempt < maxTriggerAttempts; attempt++) {
      if (await this.isAnalysisCancelled(analysisId)) {
        this.logger.log(`Trigger aborted — analysis ${analysisId} was cancelled`);
        return;
      }

      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
      }

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
          signal: AbortSignal.timeout(60_000),
        });

        if (!response.ok) {
          const errText = await response.text();
          const wakeUp = this.isAiEngineWakeUpError(null, response.status);
          if (wakeUp && attempt < maxTriggerAttempts - 1) {
            this.logger.warn(
              `AI analyze retry ${attempt + 1}/${maxTriggerAttempts} for ${analysisId}: HTTP ${response.status}`,
            );
            await this.probeAiEngineHealth(90_000);
            continue;
          }
          throw new Error(
            `FastAPI responded with ${response.status}: ${errText}`,
          );
        }

        const body = await response.json().catch(() => null);
        const accepted =
          response.status === 202 || body?.status === 'ACCEPTED';

        await this.updateStatus(analysisId, 'PROCESSING_POSE', 18, {
          statusMessage: 'Analysis started. Processing your running video…',
        });

        this.logger.log(
          accepted
            ? `Analysis ${analysisId} accepted by AI engine (running in background)`
            : `Successfully triggered analysis directly via HTTP for ${analysisId}`,
        );
        return;
      } catch (httpErr: unknown) {
        const message =
          httpErr instanceof Error ? httpErr.message : String(httpErr);
        const wakeUp = this.isAiEngineWakeUpError(httpErr);
        if (wakeUp && attempt < maxTriggerAttempts - 1) {
          this.logger.warn(
            `AI analyze retry ${attempt + 1}/${maxTriggerAttempts} for ${analysisId}: ${message}`,
          );
          continue;
        }

        this.logger.error(`Direct HTTP trigger failed: ${message}`);
        await this.updateStatus(analysisId, 'FAILED', 0, {
          errorMessage: `Failed to trigger analysis pipeline: ${message}`,
        });
        return;
      }
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
