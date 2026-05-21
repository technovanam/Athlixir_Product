"""
ATHLIXIR Forecast Engine — future-performance intelligence.
"""

from typing import Any

def calculate_forecast(analyses: list[dict[str, Any]]) -> dict[str, Any]:
    completed = [a for a in analyses if a.get("status") == "COMPLETED" and a.get("metrics")]
    completed.sort(key=lambda a: a.get("createdAt") or "")

    if len(completed) < 2:
        return {
            "projected_100m_improvement": "-0.00s",
            "future_tier": "Insufficient Data"
        }

    perf_scores = []
    for a in completed:
        s = a.get("scores") or {}
        ps = float(s.get("performanceScore") or 0)
        if ps:
            perf_scores.append(ps)
            
    if len(perf_scores) < 2:
        return {
            "projected_100m_improvement": "-0.00s",
            "future_tier": "Insufficient Data"
        }
        
    latest_score = perf_scores[-1]
    total_change = latest_score - perf_scores[0]
    avg_change_per_session = total_change / (len(perf_scores) - 1)
    
    # Project 10 sessions into the future
    projected_score = latest_score + (avg_change_per_session * 10)
    
    # Roughly translate score improvement to sprint time
    # E.g. 1 score point = 0.05s improvement
    time_improvement = max(0, (projected_score - latest_score) * 0.05)
    
    if projected_score >= 90:
        future_tier = "Elite Potential"
    elif projected_score >= 80:
        future_tier = "National Potential"
    elif projected_score >= 65:
        future_tier = "State Potential"
    elif projected_score >= 45:
        future_tier = "District Potential"
    else:
        future_tier = "Development Potential"
        
    return {
        "projected_100m_improvement": f"-{time_improvement:.2f}s",
        "future_tier": future_tier
    }
