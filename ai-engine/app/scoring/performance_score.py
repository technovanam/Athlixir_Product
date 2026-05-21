"""
ATHLIXIR Performance Scoring Engine — weighted biomechanics intelligence scores.
"""

from __future__ import annotations

from typing import Any


def calculate_performance_scores(metrics: dict[str, Any], percentiles: dict[str, int]) -> dict[str, int]:
    # If a percentile wasn't calculated, fallback to a middle score
    cadence_s = percentiles.get("cadence", 50)
    gct_s = percentiles.get("gct", 50)
    stride_s = percentiles.get("stride", 50)
    symmetry_s = percentiles.get("symmetry", 50)
    
    # We don't have oscillation and posture percentiles loaded in compare_against_norms currently,
    # so we'll fallback to a raw metric calc for those two if missing.
    oscillation = float(metrics.get("oscillation") or 7.0)
    posture = float(metrics.get("postureAngle") or metrics.get("posture") or 8.0)
    oscillation_s = max(0.0, 100 - max(0, oscillation - 6) * 6)
    posture_s = max(0.0, 100 - abs(posture - 8) * 4)

    # Weights defined by user plan: Cadence 20%, GCT 25%, Stride 20%, Symmetry 15%, Oscillation 10%, Posture 10%
    performance = int(
        cadence_s * 0.20
        + gct_s * 0.25
        + stride_s * 0.20
        + symmetry_s * 0.15
        + oscillation_s * 0.10
        + posture_s * 0.10
    )

    # Efficiency heavily weights GCT, symmetry and oscillation over pure stride length
    efficiency = int(
        cadence_s * 0.15
        + gct_s * 0.30
        + symmetry_s * 0.25
        + oscillation_s * 0.20
        + posture_s * 0.10
    )

    biomechanics = int(
        (stride_s + symmetry_s + oscillation_s + posture_s) / 4
    )

    performance = min(max(performance, 0), 100)
    efficiency = min(max(efficiency, 0), 100)
    biomechanics = min(max(biomechanics, 0), 100)

    return {
        "performanceScore": performance,
        "efficiencyScore": efficiency,
        "biomechanicsScore": biomechanics,
    }
