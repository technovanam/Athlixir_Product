"""
ATHLIXIR Adaptation Engine — athlete growth intelligence system.
"""

from typing import Any

def calculate_adaptation(analyses: list[dict[str, Any]]) -> dict[str, Any]:
    completed = [a for a in analyses if a.get("status") == "COMPLETED" and a.get("metrics")]
    completed.sort(key=lambda a: a.get("createdAt") or "")

    if len(completed) < 2:
        return {
            "adaptation_rate": "Insufficient Data",
            "adaptation_score": 0
        }

    perf_scores = []
    for a in completed:
        s = a.get("scores") or {}
        ps = float(s.get("performanceScore") or 0)
        if ps:
            perf_scores.append(ps)
            
    if len(perf_scores) < 2:
        return {
            "adaptation_rate": "Insufficient Data",
            "adaptation_score": 0
        }
        
    # Rate of change over sessions
    total_change = perf_scores[-1] - perf_scores[0]
    avg_change_per_session = total_change / (len(perf_scores) - 1)
    
    # 0 change = 50 score
    # +2 per session = 90 score
    adaptation_score = max(0, min(100, int(50 + (avg_change_per_session * 20))))
    
    if adaptation_score >= 80:
        adaptation_rate = "Fast"
    elif adaptation_score >= 40:
        adaptation_rate = "Standard"
    else:
        adaptation_rate = "Slow"
        
    return {
        "adaptation_rate": adaptation_rate,
        "adaptation_score": adaptation_score
    }
