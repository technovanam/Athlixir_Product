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

    if performance >= 88:
        label = "Elite Prospect"
    elif performance >= 65:
        label = "State Potential"
    else:
        label = "District Athlete"

    return {
        "athleteLevel": label,
        "classification": label,
    }
