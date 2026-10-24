"""
ATHLIXIR Norm Comparison Engine — benchmarks biomechanics against scientific distributions.

When the athlete's (age group, gender, event) matches a profile in
benchmark_norms.json, cadence / GCT / stride are graded against that profile's
thresholds; otherwise the general per-metric norm files are used. Metrics that
were rejected by validation (None) are not graded and get no percentile.
"""

from __future__ import annotations
import json
from pathlib import Path
from typing import Any

_NORMS_DIR = Path(__file__).resolve().parent.parent / "norms"

# Upper/lower bounds used to close the open-ended top and bottom bands when
# building level ranges from profile thresholds.
_PROFILE_METRICS = {
    # metric key in profile -> (norm name, higher_is_better, floor, ceiling)
    "cadence": ("cadence", True, 0, 300),
    "gct": ("gct", False, 0, 1000),
    "stride_length": ("stride", True, 0, 3.0),
}

def load_norm(metric: str) -> dict[str, Any]:
    path = _NORMS_DIR / f"{metric}_norms.json"
    if not path.exists():
        return {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def _assign_level_from_norm(value: float, norm_data: dict[str, Any]) -> dict[str, Any]:
    levels = norm_data.get("levels", [])
    if not levels:
        return {"level": "Beginner", "percentile": 0}

    higher_is_better = norm_data.get("is_higher_better", True)

    # Sort levels by 'min' to easily compute percentiles
    levels = sorted(levels, key=lambda x: x["min"])

    achieved_level = "Beginner"
    percentile = 0

    for i, lvl in enumerate(levels):
        vmin = lvl["min"]
        vmax = lvl["max"]

        if (value >= vmin and value <= vmax) or (value > vmax and i == len(levels)-1):
            achieved_level = lvl["level"]
            # basic linear interpolation for percentile
            # A bit rough but good enough for scoring
            if higher_is_better:
                base_pct = (i / len(levels)) * 100
                range_pct = (100 / len(levels))
                pct = base_pct + ((value - vmin) / max((vmax - vmin), 0.01)) * range_pct
            else:
                # lower is better, so flip percentile calculation
                base_pct = ((len(levels) - i - 1) / len(levels)) * 100
                range_pct = (100 / len(levels))
                pct = base_pct + ((vmax - value) / max((vmax - vmin), 0.01)) * range_pct

            percentile = min(max(int(pct), 1), 99)
            if value >= vmax and higher_is_better:
                percentile = 99
            if value <= vmin and not higher_is_better:
                percentile = 99
            break

    return {"level": achieved_level, "percentile": percentile}


def _normalise_event(event: str | None) -> str:
    return str(event or "").strip().lower().replace(" ", "")


def find_profile(
    age_group: str | None,
    gender: str | None,
    event: str | None,
) -> dict[str, Any] | None:
    """Exact (age group, gender, event) match in benchmark_norms.json, else None."""
    if not (age_group and gender and event):
        return None
    profiles = load_norm("benchmark").get("profiles", {})
    key = f"{str(age_group).strip().lower()}_{str(gender).strip().lower()}_{_normalise_event(event)}"
    return profiles.get(key)


def _levels_from_thresholds(
    thresholds: dict[str, float],
    higher_is_better: bool,
    floor: float,
    ceiling: float,
) -> dict[str, Any]:
    d, s, n, e = (thresholds[k] for k in ("district", "state", "national", "elite"))
    if higher_is_better:
        levels = [
            {"level": "Beginner", "min": floor, "max": d},
            {"level": "District", "min": d, "max": s},
            {"level": "State", "min": s, "max": n},
            {"level": "National", "min": n, "max": e},
            {"level": "Elite", "min": e, "max": ceiling},
        ]
    else:
        levels = [
            {"level": "Elite", "min": floor, "max": e},
            {"level": "National", "min": e, "max": n},
            {"level": "State", "min": n, "max": s},
            {"level": "District", "min": s, "max": d},
            {"level": "Beginner", "min": d, "max": ceiling},
        ]
    return {"is_higher_better": higher_is_better, "levels": levels}


def _as_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def compare_against_norms(
    metrics: dict[str, Any],
    *,
    age_group: str | None = None,
    gender: str | None = None,
    event: str | None = None,
) -> dict[str, Any]:
    """
    Compare cadence, GCT, stride length and limb asymmetry against norms.
    Levels for unavailable metrics are None and they have no percentile entry.
    """
    norms = {
        "cadence": load_norm("cadence"),
        "gct": load_norm("gct"),
        "stride": load_norm("stride"),
        # symmetry_norms.json is graded on asymmetry % (lower is better).
        "symmetry": load_norm("symmetry"),
    }

    profile = find_profile(age_group, gender, event)
    if profile:
        for profile_key, (norm_name, higher, floor, ceiling) in _PROFILE_METRICS.items():
            thresholds = profile.get(profile_key)
            if thresholds:
                norms[norm_name] = _levels_from_thresholds(thresholds, higher, floor, ceiling)

    values = {
        "cadence": _as_float(metrics.get("cadence")),
        "gct": _as_float(metrics.get("gct")),
        "stride": _as_float(metrics.get("strideLength") or metrics.get("stride_length")),
        "symmetry": _as_float(metrics.get("asymmetryIndex")),
    }

    levels: dict[str, str | None] = {}
    percentiles: dict[str, int] = {}
    for name, value in values.items():
        if value is None:
            levels[name] = None
            continue
        res = _assign_level_from_norm(value, norms[name])
        levels[name] = res["level"]
        percentiles[name] = res["percentile"]

    return {
        "cadenceLevel": levels["cadence"],
        "gctLevel": levels["gct"],
        "strideLevel": levels["stride"],
        "symmetryLevel": levels["symmetry"],
        "percentiles": percentiles,
        "profileLabel": profile["label"] if profile else "General running norms",
        "profileMatched": bool(profile),
    }
