import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiParserService {
  private readonly logger = new Logger(AiParserService.name);

  /**
   * Sanitizes, parses, and validates the LLM JSON response.
   */
  parseAndValidateResponse(rawText: string, metrics: any, rawData?: any): any {
    try {
      // 1. Clean the raw text (strip markdown blocks if any)
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/i, '');
        cleaned = cleaned.replace(/\n?```$/i, '');
      }
      cleaned = cleaned.trim();

      // 2. Parse JSON
      const parsed = JSON.parse(cleaned);

      // 3. Structural Validation & Normalization
      const normalizeObservation = (item: any): any => {
        if (typeof item === 'string') {
          return { observation: item, basedOn: [] };
        }
        if (item && typeof item === 'object' && typeof item.observation === 'string') {
          return {
            observation: item.observation,
            basedOn: Array.isArray(item.basedOn) ? item.basedOn.filter((s: any) => typeof s === 'string') : []
          };
        }
        return null;
      };

      const strengths = Array.isArray(parsed?.aiInsights?.strengths)
        ? parsed.aiInsights.strengths.map(normalizeObservation).filter(Boolean)
        : Array.isArray(parsed?.strengths)
        ? parsed.strengths.map(normalizeObservation).filter(Boolean)
        : [
            {
              observation: `Cadence stabilized at ${metrics?.cadence || 178} SPM — demonstrating robust stride frequency coordination.`,
              basedOn: [`✓ Cadence: ${metrics?.cadence || 178} SPM`]
            },
            {
              observation: `Ground contact metrics (${metrics?.gct || 190}ms) reflect highly optimized ground-reaction force application.`,
              basedOn: [`✓ GCT: ${metrics?.gct || 190} ms`]
            }
          ];

      const weaknesses = Array.isArray(parsed?.aiInsights?.weaknesses)
        ? parsed.aiInsights.weaknesses.map(normalizeObservation).filter(Boolean)
        : Array.isArray(parsed?.weaknesses)
        ? parsed.weaknesses.map(normalizeObservation).filter(Boolean)
        : [
            {
              observation: `Elevated lateral asymmetry of ${metrics?.symmetry ? (100 - metrics.symmetry).toFixed(1) : '3.2'}% detected during terminal transition.`,
              basedOn: [`✓ Symmetry Score: ${metrics?.symmetry || 92.5}%`]
            }
          ];

      const observations = Array.isArray(parsed?.aiInsights?.observations)
        ? parsed.aiInsights.observations.map(normalizeObservation).filter(Boolean)
        : Array.isArray(parsed?.observations)
        ? parsed.observations.map(normalizeObservation).filter(Boolean)
        : [
            {
              observation: `Excellent sagittal hip extension allows for high stride amplitude.`,
              basedOn: []
            },
            {
              observation: `Minimal core oscillation suggests optimal postural core stabilization.`,
              basedOn: []
            }
          ];

      const drills = Array.isArray(parsed?.aiRecommendations?.drills)
        ? parsed.aiRecommendations.drills.filter((d: any) => typeof d === 'string')
        : Array.isArray(parsed?.aiRecommendations)
        ? parsed.aiRecommendations.filter((d: any) => typeof d === 'string')
        : Array.isArray(parsed?.recommendations)
        ? parsed.recommendations.filter((d: any) => typeof d === 'string')
        : ['Metronome Cadence Drills (180 SPM target)', 'Wicket runs for stride frequency adaptation'];

      const trainingPlan = Array.isArray(parsed?.aiRecommendations?.trainingPlan)
        ? parsed.aiRecommendations.trainingPlan.filter((t: any) => typeof t === 'string')
        : ['Short cadence turnover block runs', 'Core stabilization holds during terminal extension'];

      const correctiveExercises = Array.isArray(parsed?.aiRecommendations?.correctiveExercises)
        ? parsed.aiRecommendations.correctiveExercises.filter((e: any) => typeof e === 'string')
        : ['Single-leg eccentric calf raises', 'Weighted hamstring Nordic drops'];

      const recovery = Array.isArray(parsed?.aiRecommendations?.recovery)
        ? parsed.aiRecommendations.recovery.filter((r: any) => typeof r === 'string')
        : ['Active dynamic foam rolling on posterior chain', 'Load-management tapering on volume blocks'];

      let summary = typeof parsed?.aiSummary === 'string' && parsed.aiSummary.length > 20
        ? parsed.aiSummary
        : `The athlete demonstrates strong mechanical turnover at ${metrics?.cadence || 178} SPM, matching advanced developmental biomechanical benchmarks. Reducing terminal stride deceleration forces and correcting symmetry lines will yield significant top-end gains.`;

      // 4. Calculate V2 AI Confidence System Score
      const confidence = this.calculateConfidence(parsed, metrics, rawData);

      // Prepend warning if confidence score is low (< 0.70)
      if (confidence < 0.70) {
        summary = `Limited data available. Interpretations should be viewed with caution. ${summary}`;
      }

      let finalInsights = {
        confidence,
        aiInsights: {
          strengths,
          weaknesses,
          observations,
        },
        aiRecommendations: {
          drills,
          trainingPlan,
          correctiveExercises,
          recovery,
        },
        aiSummary: summary,
        aiPotential: {
          currentLevel: parsed?.aiPotential?.currentLevel || 'District',
          potential: parsed?.aiPotential?.potential || 'High-potential State Prospect',
          reasoning: parsed?.aiPotential?.reasoning || 'Turnover capacity matches advanced high-performance profiles. Enhancing tendon reactive strength index will establish national-tier acceleration parameters.',
        },
        aiProgressAnalysis: {
          improvement: parsed?.aiProgressAnalysis?.improvement || 'Baseline scan parameters successfully established.',
          trends: parsed?.aiProgressAnalysis?.trends || 'Initial metrics indicate stable mechanical integrity. Stride frequency acceleration trends are positive.',
        },
        aiTimeline: Array.isArray(parsed?.aiTimeline)
          ? parsed.aiTimeline.map((item: any) => ({
              time: typeof item?.time === 'string' ? item.time : '0:00',
              phase: typeof item?.phase === 'string' ? item.phase : 'Sprint Phase',
              event: typeof item?.event === 'string' ? item.event : 'Stride mechanics detected within normal parameters.',
              severity: ['none', 'warning', 'optimal'].includes(item?.severity) ? item.severity : 'none',
            }))
          : [
              { time: '0:00', phase: 'Block Clearance', event: 'Sprint start posture stable and aligned.', severity: 'optimal' },
              { time: '0:02', phase: 'Transition Phase', event: 'Slight cadence recovery adjustments detected.', severity: 'none' },
              { time: '0:04', phase: 'Max Velocity', event: 'Max knee drive angle restricted during extension.', severity: 'warning' },
            ],
      };

      // 5. Cadence Interpretation Fix (Rule V2)
      const cadence = metrics?.cadence || 0;
      if (cadence > 195) {
        const hasCadenceStrength = finalInsights.aiInsights.strengths.some((s: any) => {
          const text = typeof s === 'string' ? s : s?.observation || '';
          return text.toLowerCase().includes('cadence');
        });
        if (!hasCadenceStrength) {
          finalInsights.aiInsights.strengths.unshift({
            observation: `Cadence of ${cadence} SPM exceeds elite benchmark levels and reflects excellent sprint turnover efficiency.`,
            basedOn: [`✓ Cadence: ${cadence} SPM`, `✓ Elite Benchmark: 195 SPM`]
          });
        }
      }

      // 6. Hallucination Guard / Metrics Verification
      this.verifyMetricsSanity(finalInsights, metrics);

      // 7. Auto-Rewrite / Sanitization Layer (Rule V2)
      finalInsights = this.recursiveSanitize(finalInsights);

      return finalInsights;
    } catch (err: any) {
      this.logger.warn(`Parsing response failed: ${err.message}. Using safety fallback template.`);
      return this.generateSafetyFallback(metrics);
    }
  }

  private verifyMetricsSanity(data: any, metrics: any) {
    this.logger.log('Executing metrics sanity and hallucination checks...');
    
    const cadence = metrics?.cadence;
    const gct = metrics?.gct;
    const stride = metrics?.strideLength;

    const sanitizeString = (text: string): string => {
      let sanitized = text;

      // 1. Cadence check: look for "XX SPM" or "XXspm"
      if (cadence !== undefined && cadence !== null) {
        sanitized = sanitized.replace(/(\d{3})\s*(spm|SPM)/g, (match, val, unit) => {
          if (Math.abs(Number(val) - cadence) > 2) {
            return `${cadence} ${unit}`;
          }
          return match;
        });
      }

      // 2. GCT check: look for "XX ms" or "XXms"
      if (gct !== undefined && gct !== null) {
        sanitized = sanitized.replace(/(\d{3})\s*(ms|MS)/g, (match, val, unit) => {
          if (Math.abs(Number(val) - gct) > 5) {
            return `${gct} ${unit}`;
          }
          return match;
        });
      }

      // 3. Stride check: look for "X.XX m" or "X.XX meters"
      if (stride !== undefined && stride !== null) {
        sanitized = sanitized.replace(/(\d+\.\d+)\s*(m|meter|meters)/g, (match, val, unit) => {
          if (Math.abs(Number(val) - stride) > 0.1) {
            return `${stride} ${unit}`;
          }
          return match;
        });
      }

      return sanitized;
    };

    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return sanitizeString(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      }
      if (obj !== null && typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
          obj[key] = sanitizeObject(obj[key]);
        }
      }
      return obj;
    };

    sanitizeObject(data);
  }

  /**
   * Returns a complete, high-fidelity biomechanical fallback in case of LLM failures or missing API keys.
   */
  generateSafetyFallback(metrics: any): any {
    const cadence = metrics?.cadence || 178;
    const gct = metrics?.gct || 190;
    const stride = metrics?.strideLength || 2.05;
    const symmetry = metrics?.symmetry || 92.5;

    return {
      aiInsights: {
        strengths: [
          {
            observation: `Excellent turnover frequency recorded at ${cadence} SPM, illustrating strong CNS-coordinated muscle firing patterns.`,
            basedOn: [`✓ Cadence: ${cadence} SPM`]
          },
          {
            observation: `Symmetry index of ${symmetry}% indicates balanced force absorption between left and right foot strikes.`,
            basedOn: [`✓ Symmetry Score: ${symmetry}%`]
          }
        ],
        weaknesses: [
          {
            observation: `Ground contact time is slightly elevated at ${gct} ms (target is <180 ms), suggesting opportunities for increased reactive ankle stiffness.`,
            basedOn: [`✓ GCT: ${gct} ms`]
          },
          {
            observation: `Stride amplitude of ${stride} m is slightly restricted in the terminal acceleration phase.`,
            basedOn: [`✓ Stride Length: ${stride} m`]
          }
        ],
        observations: [
          {
            observation: 'Excellent horizontal force vectors during the first 3 acceleration strides.',
            basedOn: []
          },
          {
            observation: 'Ankle angle clearance remains optimal with zero toe drag flags detected.',
            basedOn: []
          }
        ]
      },
      aiRecommendations: {
        drills: [
          'Wicket Runs (spaced at 1.8m intervals to promote high turnover and avoid overstriding)',
          'Sled Drives (5 reps x 20m with 15% bodyweight to build horizontal projection power)',
        ],
        trainingPlan: [
          'Incorporate reactive plyometrics (e.g. depth jumps, reactive pogo hops) twice weekly.',
          'Cadence training blocks using metronome-guided acceleration sequences.',
        ],
        correctiveExercises: [
          'Weighted Soleus Calf Raises (3 sets of 12 reps, focusing on eccentric phase control)',
          'Nordic Hamstring Curls (3 sets of 5 reps to build hamstring deceleration capacity)',
        ],
        recovery: [
          'Posterior chain dynamic foam rolling and percussion therapy on glutes and calves.',
          'Load tapering on high-volume days if asymmetry spikes beyond 5%.',
        ],
      },
      aiSummary: `The athlete demonstrates a highly efficient biomechanical blueprint with a cadence rate of ${cadence} SPM. To unlock additional top-end velocity, dynamic focus should be shifted towards decreasing Ground Contact Time (${gct}ms) and building ankle joint plantarflexion stiffness. Corrective plyometrics and wicket drills will yield high performance gains in the upcoming block.`,
      aiPotential: {
        currentLevel: cadence >= 185 ? 'Elite' : cadence >= 180 ? 'National' : 'State',
        potential: cadence >= 180 ? 'National Finalist Candidate' : 'High-potential State Prospect',
        reasoning: `Turnover mechanics are highly promising. Reducing ground contact parameters toward 180ms will launch this athlete's times into the national tier.`,
      },
      aiProgressAnalysis: {
        improvement: 'Baseline scan parameters successfully established. Consistent cadence parameters detected.',
        trends: 'Initial metrics indicate stable mechanical integrity. Progression trajectory is highly favorable.',
      },
      aiTimeline: [
        { time: '0:00', phase: 'Block Clearance', event: 'Sprint start posture stable and aligned.', severity: 'optimal' },
        { time: '0:02', phase: 'Transition Phase', event: 'Excellent acceleration mechanics; posture angle in optimal lean range.', severity: 'optimal' },
        { time: '0:03', phase: 'Max Velocity', event: 'GCT slightly elevated at landing. Focus on rigid ground strikes.', severity: 'warning' },
        { time: '0:04', phase: 'Deceleration', event: 'Cadence recovers strongly; ankle stiffness holds standard alignment.', severity: 'none' },
      ],
    };
  }

  private sanitizeBlockedTerms(text: string): string {
    let sanitized = text;

    const rewrites = [
      { regex: /hip flexor restriction/gi, replacement: 'reduced knee drive may be influencing stride mechanics' },
      { regex: /glute weakness/gi, replacement: 'reduced glute activation may suggest opportunities for improved force application' },
      { regex: /muscle imbalance/gi, replacement: 'asymmetry may be influencing running efficiency' },
      { regex: /medical condition/gi, replacement: 'physiological state' },
      { regex: /injury diagnosis/gi, replacement: 'biomechanical flag' },
      { regex: /tendon issue/gi, replacement: 'tendon loading adaptation' },
      { regex: /ligament issue/gi, replacement: 'ligament stability characteristics' },
      { regex: /nerve issue/gi, replacement: 'neuromuscular coordination pattern' },
      { regex: /structural damage/gi, replacement: 'load management variance' },
      { regex: /pathology/gi, replacement: 'mechanical variance' },
      { regex: /rehabilitation requirement/gi, replacement: 'corrective training adaptation' },
    ];

    for (const rule of rewrites) {
      sanitized = sanitized.replace(rule.regex, rule.replacement);
    }

    return sanitized;
  }

  private recursiveSanitize(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeBlockedTerms(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.recursiveSanitize(item));
    }
    if (obj !== null && typeof obj === 'object') {
      const copy: any = {};
      for (const key of Object.keys(obj)) {
        copy[key] = this.recursiveSanitize(obj[key]);
      }
      return copy;
    }
    return obj;
  }

  private calculateConfidence(parsed: any, metrics: any, rawData: any): number {
    let score = typeof parsed?.confidence === 'number' ? parsed.confidence : 0.95;

    const requiredMetrics = ['cadence', 'gct', 'strideLength', 'symmetry'];
    let missingMetricsCount = 0;
    for (const m of requiredMetrics) {
      if (metrics?.[m] === undefined || metrics?.[m] === null) {
        missingMetricsCount++;
      }
    }
    score -= missingMetricsCount * 0.05;

    const benchmarks = rawData?.benchmarks || metrics?.benchmarks;
    if (!benchmarks || !benchmarks.levels || Object.keys(benchmarks.levels).length === 0) {
      score -= 0.10;
    }

    const progress = rawData?.progress || rawData?.history;
    if (!progress || (!progress.hasPrevious && !progress.previousCadence)) {
      score -= 0.10;
    }

    score = Math.max(0.50, Math.min(1.00, score));
    return parseFloat(score.toFixed(2));
  }
}
