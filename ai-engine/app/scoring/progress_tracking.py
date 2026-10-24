"""
ATHLIXIR Progress Tracking — compare current vs previous analysis metrics.

A metric is only compared when it was measured in both sessions; otherwise its
progress fields are None instead of a delta against an implied zero.
"""

from __future__ import annotations

from typing import Any


def _num(metrics: dict[str, Any], *keys: str) -> float | None:
    for key in keys:
        value = metrics.get(key)
        if value is None:
            continue
        try:
            return float(value)
        except (TypeError, ValueError):
            return None
    return None


def _pct_change(current: float | None, previous: float | None) -> str | None:
    if current is None or previous is None or previous == 0:
        return None
    delta = ((current - previous) / previous) * 100
    sign = "+" if delta >= 0 else ""
    return f"{sign}{delta:.1f}%"


def _delta(current: float | None, previous: float | None, ndigits: int) -> float | None:
    if current is None or previous is None:
        return None
    return round(current - previous, ndigits)


def compute_progress(
    current_metrics: dict[str, Any],
    previous_metrics: dict[str, Any] | None,
) -> dict[str, Any] | None:
    if not previous_metrics:
        return None

    cur_cadence = _num(current_metrics, "cadence")
    prev_cadence = _num(previous_metrics, "cadence")
    cur_gct = _num(current_metrics, "gct")
    prev_gct = _num(previous_metrics, "gct")
    cur_stride = _num(current_metrics, "strideLength", "stride_length")
    prev_stride = _num(previous_metrics, "strideLength", "stride_length")
    cur_sym = _num(current_metrics, "symmetry")
    prev_sym = _num(previous_metrics, "symmetry")

    gct_delta_ms = None
    gct_progress = None
    if cur_gct is not None and prev_gct is not None:
        gct_delta_ms = int(cur_gct - prev_gct)
        gct_progress = f"{'+' if gct_delta_ms >= 0 else ''}{gct_delta_ms}ms"

    return {
        "cadenceProgress": _pct_change(cur_cadence, prev_cadence),
        "gctProgress": gct_progress,
        "strideProgress": _pct_change(cur_stride, prev_stride),
        "symmetryProgress": _pct_change(cur_sym, prev_sym),
        "cadenceDelta": _delta(cur_cadence, prev_cadence, 1),
        "gctDelta": gct_delta_ms,
        "strideDelta": _delta(cur_stride, prev_stride, 2),
        "symmetryDelta": _delta(cur_sym, prev_sym, 1),
        "hasPrevious": True,
    }
