"""
ATHLIXIR Performance Scoring Engine — weighted biomechanics intelligence scores.
"""

from __future__ import annotations

from typing import Any


def _metric_score(value: float, optimal: float, spread: float, *, invert: bool = False) -> float:
    delta = abs(value - optimal) if not invert else max(0, value - optimal)
    raw = 100 - (delta / spread) * 100
    return max(0.0, min(100.0, raw))


def calculate_performance_scores(metrics: dict[str, Any]) -> dict[str, int]:
    cadence = float(metrics.get("cadence") or 170)
    gct = float(metrics.get("gct") or 220)
    stride = float(metrics.get("strideLength") or metrics.get("stride_length") or 1.8)
    symmetry = float(metrics.get("symmetry") or metrics.get("asymmetryIndex") or 3.0)
    oscillation = float(metrics.get("oscillation") or 7.0)
    posture = float(metrics.get("postureAngle") or metrics.get("posture") or 8.0)

    cadence_s = _metric_score(cadence, optimal=180, spread=25)
    gct_s = _metric_score(gct, optimal=190, spread=80, invert=False)
    if gct > 190:
        gct_s = _metric_score(gct, optimal=190, spread=80, invert=True)
    stride_s = _metric_score(stride, optimal=2.05, spread=0.5)
    symmetry_s = max(0.0, 100 - symmetry * 8)
    oscillation_s = max(0.0, 100 - max(0, oscillation - 6) * 6)
    posture_s = max(0.0, 100 - abs(posture - 8) * 4)

    performance = int(
        cadence_s * 0.20
        + gct_s * 0.25
        + stride_s * 0.20
        + symmetry_s * 0.15
        + oscillation_s * 0.10
        + posture_s * 0.10
    )

    efficiency = int(
        cadence_s * 0.22
        + gct_s * 0.30
        + symmetry_s * 0.22
        + oscillation_s * 0.16
        + posture_s * 0.10
    )

    biomechanics = int(
        (cadence_s + gct_s + stride_s + symmetry_s) / 4
    )

    performance = min(max(performance, 35), 99)
    efficiency = min(max(efficiency, 35), 99)
    biomechanics = min(max(biomechanics, 35), 99)

    return {
        "performanceScore": performance,
        "efficiencyScore": efficiency,
        "biomechanicsScore": biomechanics,
    }
