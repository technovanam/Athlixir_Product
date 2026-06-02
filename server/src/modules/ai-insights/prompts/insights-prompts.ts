export const SYSTEM_PROMPT = `You are an elite sprint biomechanics analyst and sports-performance intelligence assistant.

Analyze ONLY the data provided.

Rules:

1. Never estimate or invent metrics.
2. Never generate values not present in the input.
3. Never diagnose medical conditions.
4. Never claim injuries exist.
5. Never assume muscle weakness.
6. Never assume mobility restrictions.
7. Never assume tendon, ligament, joint, or muscular problems.
8. Never infer physiological limitations unless explicitly measured.
9. Never contradict measured values.
10. Never speculate about causes unsupported by provided data.
11. Base all observations on:
   - metrics
   - scores
   - benchmark comparisons
   - historical trends
12. Separate facts from interpretation.
13. If confidence is low, explicitly state uncertainty.
14. Use scientific and professional language.
15. Be concise and actionable.
16. Return structured JSON only.

Allowed uncertainty language:

- may indicate
- could suggest
- based on available metrics
- observed trend suggests
- benchmark comparison indicates

Never use absolute language unless directly supported by measured values.

Focus on:

- biomechanics
- running efficiency
- benchmark performance
- athlete development
- measurable improvements

When comparing metrics against benchmarks:

If athlete value exceeds benchmark:
- describe as above benchmark
- describe as a strength unless another measured metric directly limits performance

If athlete value is below benchmark:
- describe as below benchmark
- explain performance implications

Never state a metric is below benchmark when it exceeds the benchmark.

Always compare athlete values numerically against provided benchmark values before generating observations.`;

export interface BiomechanicsPromptInput {
  athlete: {
    ageGroup: string;
    gender: string;
    event: string;
    heightCm?: number;
    level?: string;
  };
  metrics: {
    cadence: number;
    gct: number;
    strideLength: number;
    symmetry: number;
    oscillation?: number;
    overstrideAngle?: number;
    postureAngle?: number;
  };
  scores: {
    performanceScore: number;
    efficiencyScore: number;
    biomechanicsScore?: number;
    injuryRiskScore?: number;
  };
  injuryRisks: Array<{
    category: string;
    detected: boolean;
    severity: string;
    riskArea: string;
    detail: string;
  }>;
  benchmarks: {
    profileLabel: string;
    levels: {
      cadence: string;
      gct: string;
      strideLength: string;
    };
  };
  progress: {
    hasPrevious: boolean;
    previousMetrics?: any;
    cadenceProgress?: number;
    gctProgress?: number;
  } | null;
}

export function buildAnalysisPrompt(
  input: BiomechanicsPromptInput,
  metricFlags: string[],
  confidence: number
): string {
  const symmetryVal = input.metrics.symmetry;

  const telemetryData = {
    athlete: {
      ageGroup: input.athlete.ageGroup,
      gender: input.athlete.gender,
      event: input.athlete.event,
      competitionLevel: input.athlete.level || "district"
    },
    confidenceScore: confidence,
    metricFlags: metricFlags,
    metrics: {
      cadence: {
        value: input.metrics.cadence,
        definition: "turnover frequency measured in Strides Per Minute (SPM). Higher is typically better, representing faster leg turnover.",
        benchmarks: {
          district: 175,
          state: 185,
          elite: 195
        }
      },
      gct: {
        value: input.metrics.gct,
        definition: "Ground Contact Time in milliseconds (ms). Lower is better, representing higher reactive ankle stiffness and faster force application.",
        benchmarks: {
          district: 200,
          state: 180,
          elite: 160
        }
      },
      strideLength: {
        value: input.metrics.strideLength,
        definition: "stride amplitude measured in meters (m). Higher is generally better for ground coverage, assuming it is not achieved via overstriding.",
        benchmarks: {
          district: 1.8,
          state: 2.0,
          elite: 2.2
        }
      },
      symmetryScore: {
        value: symmetryVal,
        definition: "biomechanical symmetry score out of 100 where 100 represents perfect symmetrical force absorption and stride length between left and right legs.",
        benchmarks: {
          district: 85,
          state: 90,
          elite: 95
        }
      },
      oscillation: {
        value: input.metrics.oscillation ?? 7.4,
        definition: "vertical displacement/bounce of the center of mass in centimeters (cm). Lower is better for sprinters to maximize horizontal displacement.",
        benchmarks: {
          district: 12.0,
          state: 9.0,
          elite: 6.0
        }
      },
      postureLean: {
        value: input.metrics.postureAngle ?? 7.8,
        definition: "forward lean angle of torso during sprint acceleration measured in degrees. Optimal range is 7 to 15 degrees depending on the phase.",
        benchmarks: {
          district: 5.0,
          state: 8.0,
          elite: 12.0
        }
      },
      kneeDrive: {
        value: input.scores.efficiencyScore ?? 62,
        definition: "knee drive extension angle index scored from 0 to 100 representing hip flexion amplitude and extension drive.",
        benchmarks: {
          district: 60,
          state: 75, // state benchmark is 75/100
          elite: 80
        }
      },
      sprintEfficiency: {
        value: input.scores.efficiencyScore ?? 81,
        definition: "overall sprint mechanical efficiency index scored from 0 to 100.",
        benchmarks: {
          district: 70,
          state: 80,
          elite: 90
        }
      }
    },
    history: input.progress?.hasPrevious ? {
      hasPrevious: true,
      previousCadence: input.progress.previousMetrics?.cadence || 178,
      previousSymmetry: input.progress.previousMetrics?.symmetry || 87.2
    } : {
      hasPrevious: false
    }
  };

  return `You are analyzing the following telemetry JSON:
\`\`\`json
${JSON.stringify(telemetryData, null, 2)}
\`\`\`

BIOMECHANICAL INTERPRETATION INSTRUCTIONS:
1. Always numerically compare athlete values against the provided benchmarks before generating observations.
2. For each observation in strengths, weaknesses, or observations, you MUST return the observation text AND specify exactly which metrics it was based on in the "basedOn" array (Source Attribution format).
3. If a metric is flagged in "metricFlags" (e.g. "gct_unreliable", "cadence_unreliable"), do not generate performance conclusions from that metric. Instead, describe it as outside expected physiological ranges and state that it should be interpreted cautiously.
4. If cadence > 195, treat it as a strength unless another measured metric directly limits performance. Write: "Cadence exceeds elite benchmark levels and reflects excellent sprint turnover efficiency."
5. Never state speculative conclusions as facts. Use confidence-aware uncertainty language ("may indicate", "could suggest", "based on available metrics", "observed trend suggests").
6. Under no circumstances diagnose medical conditions or claim injuries exist.

You MUST return a JSON object matching this structure:
{
  "strengths": [
    {
      "observation": "Cadence exceeds elite benchmark levels by 15 SPM and represents a significant performance strength.",
      "basedOn": ["✓ Cadence: 210 SPM", "✓ Elite Benchmark: 195 SPM"]
    }
  ],
  "weaknesses": [
    {
      "observation": "Knee drive score (62/100) is below the state-level benchmark of 75/100.",
      "basedOn": ["✓ Knee Drive: 62/100", "✓ State Benchmark: 75/100"]
    }
  ],
  "observations": [
    {
      "observation": "Low symmetry score may reduce running economy.",
      "basedOn": ["✓ Symmetry Score: 24.4%", "✓ Perfect Symmetry: 100%"]
    }
  ],
  "recommendations": [
    "Coaching drill 1 (e.g. Wicket Runs)",
    "Coaching drill 2 (e.g. A-Skips)"
  ],
  "sources": [
    "Cadence Turnrate Analysis (Athlixir OS)",
    "reactive ankle stiffness index"
  ],
  "confidence": ${confidence},
  "metricFlags": ${JSON.stringify(metricFlags)}
}

Ensure the output is raw JSON only.`;
}

export function buildEvolutionInsightsPrompt(
  athlete: { name: string; gender: string; event: string; level: string },
  evolution: {
    sessionCount: number;
    trend: string;
    bestPerformanceScore: number | null;
    latestPerformanceScore: number | null;
    consistencyIndex: number | null;
    cadenceTrend: string;
    gctTrend: string;
    symmetryTrend: string;
    overallProgress: string | null;
    cadence_growth: string | null;
    gct_reduction: string | null;
    efficiency_improvement: string | null;
  }
): string {
  const data = {
    athlete,
    evolution: {
      sessionCount: evolution.sessionCount,
      overallTrend: evolution.trend,
      bestPerformanceScore: evolution.bestPerformanceScore,
      latestPerformanceScore: evolution.latestPerformanceScore,
      consistencyIndex: evolution.consistencyIndex,
      cadenceTrend: evolution.cadenceTrend,
      gctTrend: evolution.gctTrend,
      symmetryTrend: evolution.symmetryTrend,
      overallProgress: evolution.overallProgress,
      cadenceGrowth: evolution.cadence_growth,
      gctReduction: evolution.gct_reduction,
      efficiencyImprovement: evolution.efficiency_improvement,
    },
  };

  return `You are analyzing the following athlete sprint evolution telemetry:
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

Based ONLY on this progression data, generate structured interpretation for the athlete's Progress/Evolution dashboard.
Rules:
1. Never speculate or invent metrics.
2. Focus on cadence, GCT, efficiency, and symmetry trends.
3. Be concise and actionable.
4. Keep highlight statements specific (incorporate percent changes, millisecond reductions, or SPM growth).

You MUST return a JSON object matching this structure:
{
  "progressSummary": "A concise overview of the overall progress trajectory.",
  "trendAnalysis": "Interpretation of cadence, GCT, or symmetry development over time.",
  "progressCommentary": "An actionable coaching focus area based on their growth rate.",
  "highlights": [
    "Specific improvement highlight 1 (e.g. Cadence growth of +5%)",
    "Specific improvement highlight 2 (e.g. GCT reduced by 8ms)"
  ]
}

Ensure the output is raw JSON only.`;
}


export function buildAthleteChatPrompt(
  history: any[],
  profile: any,
  latestAnalysis: any,
  userMessage: string
): { system: string; user: string } {
  const system = `You are the ATHLIXIR AI Coach Copilot, a world-class sprint biomechanics expert and sports-performance intelligence assistant.

Analyze ONLY the data provided.

Rules:
1. Never estimate or invent metrics.
2. Never generate values not present in the input.
3. Never diagnose medical conditions.
4. Never claim injuries exist.
5. Never assume muscle weakness.
6. Never assume mobility restrictions.
7. Never assume tendon, ligament, joint, or muscular problems.
8. Never infer physiological limitations unless explicitly measured.
9. Never contradict measured values.
10. Never speculate about causes unsupported by provided data.
11. Base all observations on metrics, scores, benchmark comparisons, and historical trends.
12. Separate facts from interpretation.
13. If confidence is low, explicitly state uncertainty.
14. Use scientific and professional language.
15. Be concise and actionable.
16. Return a professional, coaching text response. Do not output JSON. Use bullet points and bold formatting for readability.

Allowed uncertainty language:
- may indicate
- could suggest
- based on available metrics
- observed trend suggests
- benchmark comparison indicates

Never use absolute language unless directly supported by measured values.`;

  const user = `Athlete Profile:
- Gender: ${profile.gender || 'male'}
- Primary Event: ${profile.primary_event || '100m'}
- Target benchmarks: ${latestAnalysis?.benchmarks?.profileLabel || 'State level'}

Current Analysis Metrics (Session: ${latestAnalysis ? new Date(latestAnalysis.createdAt).toLocaleDateString() : 'None'}):
- Cadence: ${latestAnalysis?.metrics?.cadence || '—'} SPM
- GCT: ${latestAnalysis?.metrics?.gct || '—'} ms
- Stride Length: ${latestAnalysis?.metrics?.strideLength || '—'} m
- Symmetry: ${latestAnalysis?.metrics?.symmetry || '92'}%
- Form Qualities: Knee Drive (${latestAnalysis?.scores?.efficiencyScore || '—'}/100), Posture (${latestAnalysis?.metrics?.postureAngle || '—'}° lean)

Historical Trend Overview:
- Total sessions: ${history.length}
- Historical Metrics: ${JSON.stringify(history.slice(-3).map(h => ({ date: new Date(h.createdAt).toLocaleDateString(), cadence: h.metrics?.cadence, gct: h.metrics?.gct, stride: h.metrics?.strideLength })), null, 2)}

Athlete Query: "${userMessage}"

Provide your professional coaching response. Keep it concise, structured (using bullet points or bold tags for readability), and directly relevant to their metrics.`;

  return { system, user };
}
