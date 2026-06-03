import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConfidenceScoreService {
  private readonly logger = new Logger(ConfidenceScoreService.name);

  /**
   * Calculates a scientific confidence score based on:
   * - Pose Confidence (average visibility of key joints)
   * - Metric Completeness (ratio of filled metrics to required metrics)
   * - Video Quality (FPS)
   * - Tracking Stability (relative tracking state)
   * - Benchmark Availability (if benchmark standard references exist)
   */
  calculateConfidence(
    metrics: any,
    scores: any,
    benchmarks: any,
    rawAnalysis: any,
  ): number {
    let score = 1.0;

    // 1. Metric Completeness check (cadence, gct, strideLength, symmetry)
    const primaryMetrics = ['cadence', 'gct', 'strideLength', 'symmetry'];
    let missingCount = 0;
    for (const pm of primaryMetrics) {
      if (metrics?.[pm] === undefined || metrics?.[pm] === null) {
        missingCount++;
      }
    }
    score -= missingCount * 0.05;

    // 2. Video Quality / FPS check
    const fps = rawAnalysis?.fps || rawAnalysis?.videoFps || metrics?.fps || 60;
    if (fps < 60) {
      score -= 0.15;
      this.logger.log(`Confidence penalty applied for low FPS (${fps}): -0.15`);
    } else if (fps < 120) {
      score -= 0.05;
    }

    // 3. Pose Confidence (based on landmark average visibility)
    const poseVisibility =
      rawAnalysis?.poseVisibility ?? rawAnalysis?.averageVisibility ?? 0.9;
    if (poseVisibility < 0.85) {
      score -= 0.1;
    }

    // 4. Tracking Stability
    const isStable = rawAnalysis?.isStable ?? true;
    if (!isStable) {
      score -= 0.1;
    }

    // 5. Benchmark Availability
    if (
      !benchmarks ||
      !benchmarks.levels ||
      Object.keys(benchmarks.levels).length === 0
    ) {
      score -= 0.1;
    }

    const finalScore = Math.max(0.5, Math.min(1.0, score));
    return parseFloat(finalScore.toFixed(2));
  }
}
