"""
ATHLIXIR Performance Scoring Engine — weighted biomechanics intelligence scores.

Each score is a weighted mean over the components that are actually available.
A metric rejected by validation is left out and the remaining weights are
renormalised, rather than substituting a guessed or worst-case value.
"""

from __future__ import annotations

from typing import Any


def _num(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _weighted(components: dict[str, float | None], weights: dict[str, float]) -> int | None:
    available = {k: w for k, w in weights.items() if components.get(k) is not None}
    total = sum(available.values())
    if total <= 0:
        return None
    score = sum(components[k] * w for k, w in available.items()) / total
    return min(max(int(score), 0), 100)


def calculate_performance_scores(
    metrics: dict[str, Any],
    percentiles: dict[str, int],
) -> dict[str, Any]:
    oscillation = _num(metrics.get("oscillation"))
    posture = _num(metrics.get("postureAngle") if metrics.get("postureAngle") is not None else metrics.get("posture"))

    # Oscillation and posture have no percentile norms, so they are scored
    # directly from the raw measurement.
    components: dict[str, float | None] = {
        "cadence": _num(percentiles.get("cadence")),
        "gct": _num(percentiles.get("gct")),
        "stride": _num(percentiles.get("stride")),
        "symmetry": _num(percentiles.get("symmetry")),
        "oscillation": None if oscillation is None else max(0.0, 100 - max(0, oscillation - 6) * 6),
        "posture": None if posture is None else max(0.0, 100 - abs(posture - 8) * 4),
    }

    # Weights defined by user plan: Cadence 20%, GCT 25%, Stride 20%, Symmetry 15%, Oscillation 10%, Posture 10%
    performance = _weighted(components, {
        "cadence": 0.20, "gct": 0.25, "stride": 0.20,
        "symmetry": 0.15, "oscillation": 0.10, "posture": 0.10,
    })

    # Efficiency heavily weights GCT, symmetry and oscillation over pure stride length
    efficiency = _weighted(components, {
        "cadence": 0.15, "gct": 0.30, "symmetry": 0.25,
        "oscillation": 0.20, "posture": 0.10,
    })

    biomechanics = _weighted(components, {
        "stride": 0.25, "symmetry": 0.25, "oscillation": 0.25, "posture": 0.25,
    })

    return {
        "performanceScore": performance,
        "efficiencyScore": efficiency,
        "biomechanicsScore": biomechanics,
        "scoredMetrics": [k for k, v in components.items() if v is not None],
    }
