"""
ATHLIXIR Athlete Evolution Engine — multi-session progression intelligence.

Aggregates all historical analyses for an athlete and computes:
- Overall trend direction (improving / stable / declining)
- Best-ever scores
- Consistency index (stability of metrics across sessions)
- Week-over-week metric deltas
"""

from __future__ import annotations

from typing import Any


def _trend_direction(values: list[float]) -> str:
    """Simple linear trend from a list of values (most recent = last)."""
    if len(values) < 2:
        return "stable"
    slope = values[-1] - values[0]
    rel = slope / max(abs(values[0]), 1)
    if rel > 0.04:
        return "improving"
    if rel < -0.04:
        return "declining"
    return "stable"


def _pct_change(old: float, new: float) -> str | None:
    if old == 0:
        return None
    delta = ((new - old) / old) * 100
    sign = "+" if delta >= 0 else ""
    return f"{sign}{delta:.1f}%"


def compute_athlete_evolution(
    analyses: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Compute multi-session evolution from a list of completed analysis records
    sorted oldest-first. Each item must have a `metrics` and `scores` dict.
    """
    completed = [
        a for a in analyses
        if a.get("status") == "COMPLETED" and a.get("metrics")
    ]

    # Sort oldest → newest by createdAt
    completed.sort(key=lambda a: a.get("createdAt") or "")

    if not completed:
        return {
            "hasHistory": False,
            "sessionCount": 0,
            "trend": "stable",
            "bestPerformanceScore": None,
            "latestPerformanceScore": None,
            "consistencyIndex": None,
            "cadenceTrend": "stable",
            "gctTrend": "stable",
            "symmetryTrend": "stable",
            "firstScan": None,
            "latestScan": None,
            "overallProgress": None,
        }

    # Extract metric time series
    cadences: list[float] = []
    gcts: list[float] = []
    symmetries: list[float] = []
    perf_scores: list[float] = []

    for a in completed:
        m = a.get("metrics") or {}
        s = a.get("scores") or {}
        c = float(m.get("cadence") or 0)
        g = float(m.get("gct") or 0)
        sym = float(m.get("symmetry") or 0)
        ps = float(s.get("performanceScore") or 0)
        if c:
            cadences.append(c)
        if g:
            gcts.append(g)
        if sym:
            symmetries.append(sym)
        if ps:
            perf_scores.append(ps)

    best_score = max(perf_scores) if perf_scores else None
    latest_score = perf_scores[-1] if perf_scores else None
    first_score = perf_scores[0] if perf_scores else None

    # Consistency index: inverse of relative standard deviation across sessions
    def _consistency(vals: list[float]) -> float | None:
        if len(vals) < 2:
            return None
        mean = sum(vals) / len(vals)
        if mean == 0:
            return None
        variance = sum((v - mean) ** 2 for v in vals) / len(vals)
        std = variance ** 0.5
        cv = std / mean  # coefficient of variation
        return round(max(0.0, min(100.0, (1 - cv) * 100)), 1)

    consistency = _consistency(perf_scores)

    # GCT trend: lower is better so invert direction label
    gct_raw_trend = _trend_direction(gcts)
    gct_trend = (
        "improving" if gct_raw_trend == "declining"
        else "declining" if gct_raw_trend == "improving"
        else "stable"
    )

    overall_progress = _pct_change(first_score, latest_score) if first_score and latest_score else None

    # Calculate new output requirements
    cadence_growth = _pct_change(cadences[0], cadences[-1]) if cadences else None
    gct_reduction_val = gcts[0] - gcts[-1] if len(gcts) >= 2 else 0
    gct_reduction = f"{'-' if gct_reduction_val > 0 else '+'}{abs(gct_reduction_val):.0f}ms" if len(gcts) >= 2 else None
    
    efficiency_scores = []
    for a in completed:
        eff = (a.get("scores") or {}).get("efficiencyScore")
        if eff:
            efficiency_scores.append(float(eff))
            
    efficiency_improvement = _pct_change(efficiency_scores[0], efficiency_scores[-1]) if len(efficiency_scores) >= 2 else None

    return {
        "hasHistory": len(completed) >= 2,
        "sessionCount": len(completed),
        "trend": _trend_direction(perf_scores),
        "bestPerformanceScore": int(best_score) if best_score else None,
        "latestPerformanceScore": int(latest_score) if latest_score else None,
        "consistencyIndex": consistency,
        "cadenceTrend": _trend_direction(cadences),
        "gctTrend": gct_trend,
        "symmetryTrend": _trend_direction(symmetries),
        "firstScan": completed[0].get("createdAt"),
        "latestScan": completed[-1].get("createdAt"),
        "overallProgress": overall_progress,
        "cadence_growth": cadence_growth,
        "gct_reduction": gct_reduction,
        "efficiency_improvement": efficiency_improvement,
        "cadenceSeries": [
            {"date": completed[i].get("createdAt", "")[:10], "value": cadences[i]}
            for i in range(len(cadences))
        ],
        "gctSeries": [
            {"date": completed[i].get("createdAt", "")[:10], "value": gcts[i]}
            for i in range(len(gcts))
        ],
        "symmetrySeries": [
            {"date": completed[i].get("createdAt", "")[:10], "value": symmetries[i]}
            for i in range(len(symmetries))
        ],
        "performanceSeries": [
            {"date": completed[i].get("createdAt", "")[:10], "value": perf_scores[i]}
            for i in range(len(perf_scores))
        ],
    }
