"""
ATHLIXIR Progress Tracking — compare current vs previous analysis metrics.
"""

from __future__ import annotations

from typing import Any


def _pct_change(current: float, previous: float) -> str | None:
    if previous == 0:
        return None
    delta = ((current - previous) / previous) * 100
    sign = "+" if delta >= 0 else ""
    return f"{sign}{delta:.1f}%"


def compute_progress(
    current_metrics: dict[str, Any],
    previous_metrics: dict[str, Any] | None,
) -> dict[str, Any] | None:
    if not previous_metrics:
        return None

    cur_cadence = float(current_metrics.get("cadence") or 0)
    prev_cadence = float(previous_metrics.get("cadence") or 0)
    cur_gct = float(current_metrics.get("gct") or 0)
    prev_gct = float(previous_metrics.get("gct") or 0)
    cur_stride = float(current_metrics.get("strideLength") or current_metrics.get("stride_length") or 0)
    prev_stride = float(previous_metrics.get("strideLength") or previous_metrics.get("stride_length") or 0)
    cur_sym = float(current_metrics.get("symmetry") or 0)
    prev_sym = float(previous_metrics.get("symmetry") or 0)
    cur_eff = float(current_metrics.get("efficiencyScore") or 0)

    gct_delta_ms = int(cur_gct - prev_gct)
    gct_sign = "+" if gct_delta_ms >= 0 else ""

    return {
        "cadenceProgress": _pct_change(cur_cadence, prev_cadence),
        "gctProgress": f"{gct_sign}{gct_delta_ms}ms",
        "strideProgress": _pct_change(cur_stride, prev_stride),
        "symmetryProgress": _pct_change(cur_sym, prev_sym) if prev_sym else None,
        "cadenceDelta": round(cur_cadence - prev_cadence, 1),
        "gctDelta": gct_delta_ms,
        "strideDelta": round(cur_stride - prev_stride, 2),
        "symmetryDelta": round(cur_sym - prev_sym, 1) if prev_sym else None,
        "hasPrevious": True,
    }
