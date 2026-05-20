"""
ATHLIXIR Recommendation Engine — drills and training focus from weaknesses.
"""

from __future__ import annotations

from typing import Any


def generate_biomechanics_recommendations(
    metrics: dict[str, Any],
    insights: dict[str, Any] | None = None,
) -> list[str]:
    recommendations: list[str] = []
    insights = insights or {}

    asymmetry = float(metrics.get("asymmetryIndex") or 0)
    gct = int(metrics.get("gct") or 0)
    oscillation = float(metrics.get("oscillation") or 0)
    overstride = float(metrics.get("overstrideAngle") or 0)
    cadence = float(metrics.get("cadence") or 0)

    if asymmetry > 4.0:
        recommendations.append(
            "Single-leg bounds, clamshells, and lateral band walks to reduce asymmetry."
        )
    if gct > 220:
        recommendations.append(
            "Ankle hops, jump rope, and wicket runs to shorten ground contact time."
        )
    if overstride > 6.0:
        recommendations.append(
            "Wall drills, A-skips, and hamstring mobility to correct overstriding."
        )
    if oscillation > 9.0:
        recommendations.append(
            "Cadence drills and forward-lean posture work to reduce vertical bounce."
        )
    if cadence < 170:
        recommendations.append(
            "Metronome cadence runs at 175–180 SPM to improve turnover rate."
        )
    if cadence >= 170 and gct <= 220 and asymmetry <= 4:
        recommendations.append(
            "Maintain current mechanics with periodic sprint-stride video checks."
        )

    for weakness in insights.get("weaknesses") or []:
        w = str(weakness).lower()
        if "overstride" in w and not any("overstride" in r.lower() or "wall drill" in r.lower() for r in recommendations):
            recommendations.append("Sprint wall drills and B-skips for foot placement under hips.")
        if "oscillation" in w and not any("bounce" in r.lower() for r in recommendations):
            recommendations.append("Hill sprints and core anti-rotation work for stability.")

    if not recommendations:
        recommendations.append(
            "Continue structured sprint training with weekly biomechanics check-ins."
        )

    return recommendations[:8]
