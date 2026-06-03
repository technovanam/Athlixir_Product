import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { ClaudeService } from './claude.service';
import { GeminiService } from './gemini.service';
import { AiParserService } from './ai-parser.service';
import { MetricValidatorService } from '../../ai/validators/metric-validator.service';
import { ConfidenceScoreService } from '../../ai/services/confidence-score.service';
import {
  SYSTEM_PROMPT,
  buildAnalysisPrompt,
  buildAthleteChatPrompt,
  buildEvolutionInsightsPrompt,
} from './prompts/insights-prompts';
import { generateSportsScienceReportHtml } from './templates/report-template';

@Injectable()
export class AiInsightsService {
  private readonly logger = new Logger(AiInsightsService.name);
  private readonly collectionName = 'analyses';
  private readonly profileCollectionName = 'athlete_profiles';

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly claudeService: ClaudeService,
    private readonly geminiService: GeminiService,
    private readonly aiParserService: AiParserService,
    private readonly metricValidatorService: MetricValidatorService,
    private readonly confidenceScoreService: ConfidenceScoreService,
  ) {}

  /**
   * Main orchestrator method to enrich a completed biomechanics scan with AI intelligence.
   */
  async generateIntelligence(
    analysisId: string,
    userId: string,
    rawData: any,
  ): Promise<any> {
    this.logger.log(
      `Running AI Sports Intelligence Orchestrator for analysis: ${analysisId}`,
    );

    const metrics = rawData.metrics || {};
    const scores = rawData.scores || {};
    const injuryRisks = rawData.injuryRisks || [];
    const benchmarks = rawData.benchmarks || {
      profileLabel: 'State Sprint Benchmark',
      levels: { cadence: 'State', gct: 'State', strideLength: 'State' },
    };
    const progress = rawData.progress || null;

    try {
      // 1. Fetch Athlete Profile Context
      const athleteContext = await this.getAthleteContext(userId);

      // 1.5 Validate metrics and calculate confidence score on the backend
      const validationResult =
        this.metricValidatorService.validateMetrics(metrics);
      const pythonFlags = Array.isArray(rawData?.metricFlags)
        ? rawData.metricFlags
        : [];
      const metricFlags = Array.from(
        new Set([...validationResult.metricFlags, ...pythonFlags]),
      );

      const confidence = this.confidenceScoreService.calculateConfidence(
        metrics,
        scores,
        benchmarks,
        rawData,
      );

      // 2. Build LLM prompt
      const promptInput = {
        athlete: athleteContext,
        metrics,
        scores,
        injuryRisks,
        benchmarks,
        progress,
      };

      const systemPrompt = SYSTEM_PROMPT;
      const userPrompt = buildAnalysisPrompt(
        promptInput,
        metricFlags,
        confidence,
      );

      // 3. Query LLMs with tiered fallback
      let rawResponse = '';
      let usedProvider = 'Claude';

      try {
        rawResponse = await this.claudeService.generateCompletion(
          systemPrompt,
          userPrompt,
        );
        this.logger.log(
          'AI intelligence generated successfully using Anthropic Claude.',
        );
      } catch (claudeErr: any) {
        this.logger.warn(
          `Claude completion failed: ${claudeErr.message}. Falling back to Google Gemini.`,
        );
        try {
          usedProvider = 'Gemini';
          rawResponse = await this.geminiService.generateCompletion(
            systemPrompt,
            userPrompt,
          );
          this.logger.log(
            'AI intelligence generated successfully using Google Gemini.',
          );
        } catch (geminiErr: any) {
          this.logger.error(
            `Gemini completion failed as well: ${geminiErr.message}. Triggering local high-fidelity simulator.`,
          );
          rawResponse = JSON.stringify(
            this.aiParserService.generateSafetyFallback(metrics),
          );
          usedProvider = 'LocalSimulator';
        }
      }

      // 4. Parse & Validate structured JSON output
      const parsedAiResults = this.aiParserService.parseAndValidateResponse(
        rawResponse,
        metrics,
        rawData,
      );

      // Override/lock backend-calculated metrics flags and confidence values
      parsedAiResults.confidence = confidence;
      parsedAiResults.metricFlags = metricFlags;

      // 5. Generate high-fidelity HTML report
      const reportHtml = generateSportsScienceReportHtml(
        analysisId,
        athleteContext.name,
        {
          athlete: athleteContext,
          metrics,
          scores,
          benchmarks,
          injuryRisk: rawData.injuryRisk,
          ...parsedAiResults,
          createdAt: new Date().toISOString(),
        },
      );

      // 6. Extend database schema and save to Firestore
      const db = this.firebaseService.firestore;
      const docRef = db.collection(this.collectionName).doc(analysisId);

      const aiUpdate = {
        ...parsedAiResults,
        aiReport: reportHtml,
        aiReportReady: true,
        aiEngineUsed: usedProvider,
        updatedAt: new Date().toISOString(),
      };

      await docRef.set(aiUpdate, { merge: true });
      this.logger.log(
        `Extended database schema in Firestore for ${analysisId} successfully.`,
      );

      // Store in sub-collections for progressive dashboard analytics if necessary
      await db
        .collection('reports')
        .doc(analysisId)
        .set(
          {
            analysisId,
            userId,
            reportPath: `running-videos/${userId}/reports/${analysisId}.html`,
            createdAt: new Date().toISOString(),
          },
          { merge: true },
        );

      return aiUpdate;
    } catch (err: any) {
      this.logger.error(
        `Failed during AI intelligence orchestration: ${err.message}. Saving emergency fallback.`,
      );

      // Calculate validation flags and confidence for fallback consistency
      const validationResult =
        this.metricValidatorService.validateMetrics(metrics);
      const pythonFlags = Array.isArray(rawData?.metricFlags)
        ? rawData.metricFlags
        : [];
      const metricFlags = Array.from(
        new Set([...validationResult.metricFlags, ...pythonFlags]),
      );
      const confidence = this.confidenceScoreService.calculateConfidence(
        metrics,
        scores,
        benchmarks,
        rawData,
      );

      const fallback = this.aiParserService.generateSafetyFallback(metrics);
      fallback.confidence = confidence;
      fallback.metricFlags = metricFlags;

      const reportHtml = generateSportsScienceReportHtml(
        analysisId,
        'Athlete',
        {
          athlete: {
            name: 'Athlete',
            ageGroup: 'u18',
            gender: 'male',
            event: '100m',
          },
          metrics,
          scores,
          benchmarks,
          injuryRisk: rawData.injuryRisk,
          ...fallback,
          createdAt: new Date().toISOString(),
        },
      );

      const aiEmergencyUpdate = {
        ...fallback,
        aiReport: reportHtml,
        aiReportReady: true,
        aiEngineUsed: 'EmergencyFallback',
        updatedAt: new Date().toISOString(),
      };

      await this.firebaseService.firestore
        .collection(this.collectionName)
        .doc(analysisId)
        .set(aiEmergencyUpdate, { merge: true });

      return aiEmergencyUpdate;
    }
  }

  /**
   * Athlete Chat Assistant handler - Loads user profile, latest telemetry, and historical trends to answer contextually.
   */
  async handleAthleteChat(
    analysisId: string,
    userId: string,
    message: string,
  ): Promise<string> {
    this.logger.log(
      `User ${userId} chatting with assistant regarding analysis ${analysisId}`,
    );

    try {
      const db = this.firebaseService.firestore;

      // 1. Fetch current analysis
      const analysisDoc = await db
        .collection(this.collectionName)
        .doc(analysisId)
        .get();
      if (!analysisDoc.exists) {
        return "I couldn't locate that specific sprint analysis record. Let's start with a new video scan!";
      }
      const latestAnalysis = analysisDoc.data() as any;

      // 2. Fetch athlete profile
      const profileDoc = await db
        .collection(this.profileCollectionName)
        .doc(userId)
        .get();
      const profile = profileDoc.exists
        ? (profileDoc.data() as any)
        : { gender: 'male', primary_event: '100m' };
      const name = profile.name || profile.username || 'Athlete';

      // 3. Fetch historical analyses to compute trend context
      const historySnapshot = await db
        .collection(this.collectionName)
        .where('userId', '==', userId)
        .get();

      const history = historySnapshot.docs
        .map((doc) => doc.data() as any)
        .filter((h) => h.status === 'COMPLETED' && h.metrics)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

      // 4. Construct prompts
      const prompts = buildAthleteChatPrompt(
        history,
        { ...profile, name },
        latestAnalysis,
        message,
      );

      // 5. Query LLM
      let response = '';
      try {
        response = await this.claudeService.generateCompletion(
          prompts.system,
          prompts.user,
        );
      } catch (err: any) {
        this.logger.warn(
          `Claude chat failed: ${err.message}. Trying Gemini...`,
        );
        try {
          response = await this.geminiService.generateCompletion(
            prompts.system,
            prompts.user,
            false,
          );
        } catch (geminiErr: any) {
          this.logger.error(
            `Gemini chat failed as well: ${geminiErr.message}. Resolving with local expert guidelines.`,
          );
          response = this.generateLocalExpertChatReply(message, latestAnalysis);
        }
      }

      return response;
    } catch (err: any) {
      this.logger.error(`Error in athlete chat copilot: ${err.message}`);
      return "I'm having trouble retrieving your active telemetry stats right now. Please verify your connection and let's try again in a moment!";
    }
  }

  /**
   * Generates LLM progress interpretation for the evolution dashboard.
   */
  async generateEvolutionInsights(
    userId: string,
    evolutionData: any,
  ): Promise<any> {
    this.logger.log(
      `Generating evolution/progress insights for user: ${userId}`,
    );

    try {
      const athleteContext = await this.getAthleteContext(userId);
      const prompt = buildEvolutionInsightsPrompt(
        athleteContext as any,
        evolutionData,
      );

      let rawResponse = '';
      try {
        rawResponse = await this.claudeService.generateCompletion(
          SYSTEM_PROMPT,
          prompt,
        );
      } catch (err: any) {
        this.logger.warn(
          `Claude progress insights failed: ${err.message}. Trying Gemini...`,
        );
        try {
          rawResponse = await this.geminiService.generateCompletion(
            SYSTEM_PROMPT,
            prompt,
            true,
          );
        } catch (geminiErr: any) {
          this.logger.error(
            `Gemini progress insights failed: ${geminiErr.message}. Falling back to default.`,
          );
          return this.generateDefaultEvolutionInsights(evolutionData);
        }
      }

      // Clean the JSON output (in case it contains markdown formatting)
      const cleanJson = rawResponse
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleanJson);
    } catch (err: any) {
      this.logger.error(
        `Failed to parse evolution insights JSON: ${err.message}`,
      );
      return this.generateDefaultEvolutionInsights(evolutionData);
    }
  }

  private generateDefaultEvolutionInsights(evolution: any): any {
    const highlights: string[] = [];
    if (evolution.cadence_growth) {
      highlights.push(
        `Cadence growth of ${evolution.cadence_growth} over the progression window.`,
      );
    }
    if (evolution.gct_reduction && parseInt(evolution.gct_reduction) !== 0) {
      highlights.push(
        `Ground Contact Time reduced by ${Math.abs(parseInt(evolution.gct_reduction))}ms.`,
      );
    }
    if (highlights.length === 0) {
      highlights.push(
        `Completed ${evolution.sessionCount} scan sessions to establish baseline mechanics.`,
      );
    }

    return {
      progressSummary: `You have completed ${evolution.sessionCount} sessions showing a ${evolution.trend} performance trajectory.`,
      trendAnalysis: `Symmetry is trending ${evolution.symmetryTrend} and GCT is trending ${evolution.gctTrend}.`,
      progressCommentary:
        'Maintain consistent stride-frequency intervals to further stabilize cadence output.',
      highlights,
    };
  }

  /**
   * Athlete context helper.
   */
  private async getAthleteContext(userId: string) {
    try {
      const doc = await this.firebaseService.firestore
        .collection(this.profileCollectionName)
        .doc(userId)
        .get();

      if (!doc.exists) {
        return {
          name: 'Athlete',
          ageGroup: 'u18',
          gender: 'male',
          event: '100m',
        };
      }

      const d = doc.data() as any;
      const genderRaw = String(d.gender || 'male').toLowerCase();
      const gender = genderRaw.startsWith('f') ? 'female' : 'male';
      const event = String(d.primary_event || '100m').trim();
      const ageGroup = d.dob
        ? this.calculateAge(d.dob) < 18
          ? 'u18'
          : 'open'
        : 'u18';

      return {
        name:
          d.firstName && d.lastName
            ? `${d.firstName} ${d.lastName}`
            : d.username || 'Athlete',
        ageGroup,
        gender,
        event,
        heightCm: d.height_cm,
      };
    } catch (err) {
      return {
        name: 'Athlete',
        ageGroup: 'u18',
        gender: 'male',
        event: '100m',
      };
    }
  }

  private calculateAge(dobStr: string): number {
    const birth = new Date(dobStr);
    if (Number.isNaN(birth.getTime())) return 17;
    const ageMs = Date.now() - birth.getTime();
    return ageMs / (365.25 * 24 * 60 * 60 * 1000);
  }

  /**
   * Generates a context-aware fallback response if LLM chat endpoints fail.
   */
  private generateLocalExpertChatReply(message: string, analysis: any): string {
    const query = message.toLowerCase();
    const cadence = analysis?.metrics?.cadence || 178;
    const gct = analysis?.metrics?.gct || 190;
    const stride = analysis?.metrics?.strideLength || 2.05;

    if (query.includes('cadence') || query.includes('spm')) {
      return `Based on your telemetry, your current turnover is **${cadence} SPM**. To scale this up to the elite standard of 185+ SPM, I highly recommend adding **Wicket Runs** to your acceleration training. This naturally restricts overstriding and coordinates rapid elastic muscle activation.`;
    }
    if (
      query.includes('gct') ||
      query.includes('ground contact') ||
      query.includes('contact')
    ) {
      return `Your Ground Contact Time is currently clocked at **${gct} ms** (ideal target is <180 ms). To decrease GCT, you must improve your ankle plantarflexion stiffness. Try incorporating **reactive ankle pogos** and **low box depth jumps** to cultivate high-performance stiffness.`;
    }
    if (query.includes('stride') || query.includes('length')) {
      return `Your average stride length is **${stride} meters**. While this provides a strong force projection, your vertical oscillation metrics suggest slightly high bouncing vectors. Shifting this upwards thrust to horizontal sled pushes will optimize your speed conversion.`;
    }
    return `Looking at your scan session, you show a strong efficiency score of **${analysis?.scores?.efficiencyScore || 81}%** and solid overall mechanics. I suggest focusing on reactive plyometrics this week to work on reducing ground contact time from its current ${gct}ms reading!`;
  }
}
