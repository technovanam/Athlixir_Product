"""
ATHLIXIR AI Insights Engine — strengths, weaknesses, and observations.
"""

from __future__ import annotations

from typing import Any


def generate_insights(
    metrics: dict[str, Any],
    benchmarks: dict[str, Any],
    scores: dict[str, Any],
    injury: dict[str, Any],
) -> dict[str, Any]:
    strengths: list[str] = []
    weaknesses: list[str] = []
    observations: list[str] = []

    cadence = float(metrics.get("cadence") or 0)
    gct = float(metrics.get("gct") or 0)
    stride = float(metrics.get("strideLength") or metrics.get("stride_length") or 0)
    asymmetry = float(metrics.get("asymmetryIndex") or 0)
    oscillation = float(metrics.get("oscillation") or 0)
    overstride = float(metrics.get("overstrideAngle") or 0)
    symmetry = float(metrics.get("symmetry") or 0)

    levels = benchmarks.get("levels") or {}
    cadence_level = levels.get("cadence") or benchmarks.get("cadenceLevel") or ""
    gct_level = levels.get("gct") or benchmarks.get("gctLevel") or ""
    stride_level = levels.get("strideLength") or benchmarks.get("strideLevel") or ""

    perf = int(scores.get("performanceScore") or 0)
    eff = int(scores.get("efficiencyScore") or 0)

    if cadence_level in ("State", "National", "Elite"):
        strengths.append(f"Cadence at {cadence} SPM — {cadence_level} benchmark level")
    elif cadence >= 170:
        strengths.append(f"Solid cadence ({cadence} SPM) within productive sprint range")

    if gct_level in ("State", "National", "Elite") or gct <= 200:
        strengths.append(f"Ground contact time ({int(gct)} ms) shows efficient elastic response")
    if stride_level in ("State", "National", "Elite"):
        strengths.append(f"Stride length ({stride:.2f} m) matches {stride_level}-level norms")
    if symmetry >= 85 or asymmetry <= 3:
        strengths.append("Left-right loading symmetry is well maintained")
    if eff >= 80:
        strengths.append(f"Sprint efficiency score ({eff}) indicates strong movement economy")

    if cadence_level in ("Below District", "District") and cadence < 170:
        weaknesses.append(f"Cadence ({cadence} SPM) below target sprint range (170–190)")
    if gct > 230:
        weaknesses.append(f"Ground contact time elevated ({int(gct)} ms) — fatigue or stiffness risk")
    if overstride > 6:
        weaknesses.append(f"Overstriding detected ({overstride}°) — braking forces increase")
    if oscillation > 9:
        weaknesses.append(f"High vertical oscillation ({oscillation} cm) — energy lost upward")
    if asymmetry > 5:
        weaknesses.append(f"Limb asymmetry index {asymmetry}% — uneven loading pattern")

    injury_level = injury.get("level") or injury.get("injuryRisk") or ""
    risk_area = injury.get("riskArea") or ""
    if injury_level in ("Moderate", "High"):
        weaknesses.append(f"Injury risk flagged as {injury_level}" + (
            f" ({risk_area})" if risk_area and risk_area != "None" else ""
        ))

    if perf >= 80 and cadence_level in ("National", "Elite"):
        observations.append("Overall sprint mechanics align with high-performance benchmarks")
    elif perf < 65:
        observations.append("Biomechanics profile suggests foundational sprint mechanics work needed")
    if overstride > 6 and oscillation > 9:
        observations.append(
            "Combined overstride and vertical bounce may reduce acceleration-phase stability"
        )
    if gct > 240 and cadence < 175:
        observations.append(
            "Sprint mechanics unstable — long contact times with low turnover"
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
