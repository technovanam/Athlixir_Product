"""
ATHLIXIR AI Insights Engine — strengths, weaknesses, and observations.

Every rule only fires when the metrics it depends on were actually measured;
a metric rejected by validation (None) never produces a strength or weakness.
"""

from __future__ import annotations

from typing import Any

_STRONG_LEVELS = ("State", "National", "Elite")
_WEAK_LEVELS = ("Beginner", "Below District", "District")

_METRIC_LABELS = {
    "cadence_unreliable": "cadence",
    "gct_unreliable": "ground contact time",
    "stride_unreliable": "stride length",
    "symmetry_unreliable": "left-right symmetry",
    "oscillation_unreliable": "vertical oscillation",
}


def _num(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def generate_insights(
    metrics: dict[str, Any],
    benchmarks: dict[str, Any],
    scores: dict[str, Any],
    injury: dict[str, Any],
    metric_flags: list[str] | None = None,
) -> dict[str, Any]:
    strengths: list[str] = []
    weaknesses: list[str] = []
    observations: list[str] = []

    cadence = _num(metrics.get("cadence"))
    gct = _num(metrics.get("gct"))
    stride = _num(metrics.get("strideLength") or metrics.get("stride_length"))
    asymmetry = _num(metrics.get("asymmetryIndex"))
    oscillation = _num(metrics.get("oscillation"))
    overstride = _num(metrics.get("overstrideAngle"))
    symmetry = _num(metrics.get("symmetry"))

    cadence_level = benchmarks.get("cadenceLevel") or ""
    gct_level = benchmarks.get("gctLevel") or ""
    stride_level = benchmarks.get("strideLevel") or ""

    perf = scores.get("performanceScore")
    eff = scores.get("efficiencyScore")

    if cadence is not None:
        if cadence_level in _STRONG_LEVELS:
            strengths.append(f"Cadence at {int(cadence)} SPM — {cadence_level} benchmark level")
        elif cadence >= 170:
            strengths.append(f"Solid cadence ({int(cadence)} SPM) within productive sprint range")

    if gct is not None and (gct_level in _STRONG_LEVELS or gct <= 200):
        strengths.append(f"Ground contact time ({int(gct)} ms) shows efficient elastic response")
    if stride is not None and stride_level in _STRONG_LEVELS:
        strengths.append(f"Stride length ({stride:.2f} m) matches {stride_level}-level norms")
    if (symmetry is not None and symmetry >= 85) or (asymmetry is not None and asymmetry <= 3):
        strengths.append("Left-right loading symmetry is well maintained")
    if eff is not None and eff >= 80:
        strengths.append(f"Sprint efficiency score ({eff}) indicates strong movement economy")

    if cadence is not None and cadence_level in _WEAK_LEVELS and cadence < 170:
        weaknesses.append(f"Cadence ({int(cadence)} SPM) below target sprint range (170–190)")
    if gct is not None and gct > 230:
        weaknesses.append(f"Ground contact time elevated ({int(gct)} ms) — fatigue or stiffness risk")
    if overstride is not None and overstride > 6:
        weaknesses.append(f"Overstriding detected ({overstride}°) — braking forces increase")
    if oscillation is not None and oscillation > 9:
        weaknesses.append(f"High vertical oscillation ({oscillation} cm) — energy lost upward")
    if asymmetry is not None and asymmetry > 5:
        weaknesses.append(f"Limb asymmetry index {asymmetry}% — uneven loading pattern")

    injury_level = injury.get("level") or injury.get("injuryRisk") or ""
    risk_area = injury.get("riskArea") or ""
    if injury_level in ("Moderate", "High"):
        weaknesses.append(f"Injury risk flagged as {injury_level}" + (
            f" ({risk_area})" if risk_area and risk_area != "None" else ""
        ))

    if perf is not None and perf >= 80 and cadence_level in ("National", "Elite"):
        observations.append("Overall sprint mechanics align with high-performance benchmarks")
    elif perf is not None and perf < 65:
        observations.append("Biomechanics profile suggests foundational sprint mechanics work needed")
    if overstride is not None and oscillation is not None and overstride > 6 and oscillation > 9:
        observations.append(
            "Combined overstride and vertical bounce may reduce acceleration-phase stability"
        )
    if gct is not None and cadence is not None and gct > 240 and cadence < 175:
        observations.append(
            "Sprint mechanics unstable — long contact times with low turnover"
        )

    unreliable = [_METRIC_LABELS[f] for f in (metric_flags or []) if f in _METRIC_LABELS]
    if unreliable:
        observations.append(
            "Could not measure " + ", ".join(unreliable) + " reliably from this video — "
            "excluded from scores. A side-on, well-lit clip at 60 fps or higher improves accuracy."
        )
    if "gct_low_frame_rate" in (metric_flags or []):
        observations.append(
            "Video frame rate is below 60 fps, so ground contact time is approximate."
        )

    if not observations:
        observations.append(
            "Movement profile is consistent across cadence, contact time, and stride metrics"
        )

    if not strengths:
        strengths.append("Baseline biomechanics captured — upload another session to track progress")
    if not weaknesses:
        weaknesses.append("No major mechanical red flags in this analysis window")

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "observations": observations,
    }
