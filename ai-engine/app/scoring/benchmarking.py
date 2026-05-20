"""
ATHLIXIR Norm Comparison Engine — benchmarks biomechanics against age/event/level norms.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

_NORMS_PATH = Path(__file__).resolve().parent.parent / "norms" / "benchmark_norms.json"

_LEVEL_ORDER = ["Below District", "District", "State", "National", "Elite"]


def load_benchmark_norms() -> dict[str, Any]:
    with open(_NORMS_PATH, encoding="utf-8") as f:
        return json.load(f)


def _resolve_profile_key(
    norms: dict[str, Any],
    age_group: str | None,
    gender: str | None,
    event: str | None,
) -> str:
    profiles: dict[str, Any] = norms.get("profiles", {})
    if not profiles:
        return norms.get("default_profile", "")

    age = (age_group or "u18").lower()
    gen = (gender or "male").lower()
    evt = (event or "100m").lower().replace(" ", "")

    candidates = [
        f"{age}_{gen}_{evt}",
        f"open_{gen}_{evt}",
        f"{age}_{gen}_100m",
        norms.get("default_profile", ""),
    ]

    for key in candidates:
        if key and key in profiles:
            return key

    return norms.get("default_profile", next(iter(profiles)))


def _assign_level(
    value: float,
    thresholds: dict[str, float],
    *,
    higher_is_better: bool,
) -> str:
    order = ["district", "state", "national", "elite"]
    labels = ["District", "State", "National", "Elite"]

    achieved = "Below District"
    for key, label in zip(order, labels):
        threshold = thresholds.get(key)
        if threshold is None:
            continue
        if higher_is_better and value >= threshold:
            achieved = label
        elif not higher_is_better and value <= threshold:
            achieved = label

    return achieved


def compare_against_norms(
    metrics: dict[str, Any],
    *,
    age_group: str | None = None,
    gender: str | None = None,
    event: str | None = None,
) -> dict[str, Any]:
    """
    Compare cadence, GCT, stride length to competition benchmarks.

    Returns levels like cadenceLevel: "State", plus profile metadata.
    """
    norms = load_benchmark_norms()
    profile_key = _resolve_profile_key(norms, age_group, gender, event)
    profile = norms["profiles"][profile_key]

    cadence = float(metrics.get("cadence") or 0)
    gct = float(metrics.get("gct") or 0)
    stride = float(metrics.get("strideLength") or metrics.get("stride_length") or 0)

    cadence_level = _assign_level(
        cadence, profile["cadence"], higher_is_better=True
    )
    gct_level = _assign_level(gct, profile["gct"], higher_is_better=False)
    stride_level = _assign_level(
        stride, profile["stride_length"], higher_is_better=True
    )

    return {
        "profileKey": profile_key,
        "profileLabel": profile.get("label", profile_key),
        "cadenceLevel": cadence_level,
        "gctLevel": gct_level,
        "strideLevel": stride_level,
        "levels": {
            "cadence": cadence_level,
            "gct": gct_level,
            "strideLength": stride_level,
        },
    }


def benchmark_percentile_hint(
    value: float,
    thresholds: dict[str, float],
    *,
    higher_is_better: bool,
) -> int:
    """Rough percentile estimate (0–100) for dashboard display."""
    order = ["district", "state", "national", "elite"]
    if higher_is_better:
        if value >= thresholds.get("elite", value):
            return 95
        if value >= thresholds.get("national", value):
            return 82
        if value >= thresholds.get("state", value):
            return 68
        if value >= thresholds.get("district", value):
            return 52
        return 35
    if value <= thresholds.get("elite", value):
        return 95
    if value <= thresholds.get("national", value):
        return 82
    if value <= thresholds.get("state", value):
        return 68
    if value <= thresholds.get("district", value):
        return 52
    return 35
