import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MetricValidatorService {
  private readonly logger = new Logger(MetricValidatorService.name);

  /**
   * Validates running biomechanics metrics before they are passed to the AI.
   * Returns an array of flags for metrics that are outside physiological ranges.
   */
  validateMetrics(metrics: {
    cadence?: number;
    gct?: number;
    strideLength?: number;
    symmetry?: number;
    oscillation?: number;
  }): { metricFlags: string[] } {
    const flags: string[] = [];

    const cadence = metrics?.cadence;
    const gct = metrics?.gct;
    const strideLength = metrics?.strideLength;
    const symmetry = metrics?.symmetry;
    const oscillation = metrics?.oscillation;

    if (gct !== undefined && gct !== null) {
      if (gct < 50 || gct > 500) {
        flags.push('gct_unreliable');
      }
    }

    if (cadence !== undefined && cadence !== null) {
      if (cadence < 100 || cadence > 300) {
        flags.push('cadence_unreliable');
      }
    }

    if (strideLength !== undefined && strideLength !== null) {
      if (strideLength < 0.3 || strideLength > 5) {
        flags.push('stride_unreliable');
      }
    }

    if (symmetry !== undefined && symmetry !== null) {
      if (symmetry < 0 || symmetry > 100) {
        flags.push('symmetry_unreliable');
      }
    }

    if (oscillation !== undefined && oscillation !== null) {
      if (oscillation < 0 || oscillation > 50) {
        flags.push('oscillation_unreliable');
      }
    }

    if (flags.length > 0) {
      this.logger.warn(`Telemetry anomaly flags detected: ${flags.join(', ')}`);
    }

    return { metricFlags: flags };
  }
}
