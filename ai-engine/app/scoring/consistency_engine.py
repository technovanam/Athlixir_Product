"""
ATHLIXIR Consistency Engine — athlete reliability intelligence.
"""

from typing import Any

def calculate_consistency(analyses: list[dict[str, Any]]) -> dict[str, Any]:
    completed = [a for a in analyses if a.get("status") == "COMPLETED" and a.get("metrics")]
    completed.sort(key=lambda a: a.get("createdAt") or "")

    if len(completed) < 2:
        return {
            "consistency_score": 0,
            "training_stability": "Low"
        }

    perf_scores = []
    for a in completed:
        s = a.get("scores") or {}
        ps = float(s.get("performanceScore") or 0)
        if ps:
            perf_scores.append(ps)
            
    if not perf_scores or len(perf_scores) < 2:
        return {
            "consistency_score": 0,
            "training_stability": "Low"
        }
        
    mean = sum(perf_scores) / len(perf_scores)
    variance = sum((v - mean) ** 2 for v in perf_scores) / len(perf_scores)
    std = variance ** 0.5
    cv = std / max(mean, 1)
    
    # 0 variance = 100 consistency
    # 20% variance = 80 consistency
    consistency_score = round(max(0.0, min(100.0, (1 - cv) * 100)), 1)
    
    if consistency_score >= 90:
        stability = "High"
    elif consistency_score >= 70:
        stability = "Moderate"
    else:
        stability = "Erratic"
        
    return {
        "consistency_score": consistency_score,
        "training_stability": stability
    }
