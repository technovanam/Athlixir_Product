"""
ATHLIXIR Athlete Classification Engine — talent level from scores and benchmarks.
"""

from __future__ import annotations

from typing import Any

_LEVEL_RANK = {
    "Below District": 0,
    "District": 1,
    "State": 2,
    "National": 3,
    "Elite": 4,
}


def _level_rank(level: str) -> int:
    return _LEVEL_RANK.get(level, 0)


def classify_athlete(
    scores: dict[str, Any],
    benchmarks: dict[str, Any],
) -> dict[str, str]:
    performance = int(scores.get("performanceScore") or 0)
    efficiency = int(scores.get("efficiencyScore") or 0)

    levels = benchmarks.get("levels") or {}
    level_values = [
        levels.get("cadence"),
        levels.get("gct"),
        levels.get("strideLength"),
    ]
    ranks = [_level_rank(str(v)) for v in level_values if v]

    elite_metrics = sum(1 for r in ranks if r >= 4)
    national_metrics = sum(1 for r in ranks if r >= 3)
    state_metrics = sum(1 for r in ranks if r >= 2)

    if performance >= 88 and efficiency >= 85 and elite_metrics >= 2:
        label = "Elite Prospect"
    elif performance >= 78 and national_metrics >= 2:
        label = "National Prospect"
    elif performance >= 65 and state_metrics >= 2:
        label = "State Potential"
    else:
        label = "District Athlete"

    return {
        "athleteLevel": label,
        "classification": label,
    }
