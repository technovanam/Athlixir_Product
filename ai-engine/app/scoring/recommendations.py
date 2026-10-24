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

    def _num(key: str) -> float | None:
        value = metrics.get(key)
        try:
            return None if value is None else float(value)
        except (TypeError, ValueError):
            return None

    # Unmeasured metrics (None) never trigger a drill.
    asymmetry = _num("asymmetryIndex")
    gct = _num("gct")
    oscillation = _num("oscillation")
    overstride = _num("overstrideAngle")
    cadence = _num("cadence")

    if asymmetry is not None and asymmetry > 4.0:
        recommendations.append(
            "Single-leg bounds, clamshells, and lateral band walks to reduce asymmetry."
        )
    if gct is not None and gct > 220:
        recommendations.append(
            "Ankle hops, jump rope, and wicket runs to shorten ground contact time."
        )
    if overstride is not None and overstride > 6.0:
        recommendations.append(
            "Wall drills, A-skips, and hamstring mobility to correct overstriding."
        )
    if oscillation is not None and oscillation > 9.0:
        recommendations.append(
            "Cadence drills and forward-lean posture work to reduce vertical bounce."
        )
    if cadence is not None and cadence < 170:
        recommendations.append(
            "Metronome cadence runs at 175–180 SPM to improve turnover rate."
        )
    if (
        cadence is not None and cadence >= 170
        and gct is not None and gct <= 220
        and asymmetry is not None and asymmetry <= 4
    ):
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
