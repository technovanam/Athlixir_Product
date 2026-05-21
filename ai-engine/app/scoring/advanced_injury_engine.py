"""
ATHLIXIR Advanced Injury Engine — deep movement intelligence.
"""

from typing import Any

def calculate_advanced_injury_risk(analyses: list[dict[str, Any]]) -> list[str]:
    completed = [a for a in analyses if a.get("status") == "COMPLETED" and a.get("metrics")]
    completed.sort(key=lambda a: a.get("createdAt") or "")

    if len(completed) < 2:
        return []

    insights = []
    
    latest = completed[-1].get("metrics") or {}
    previous = completed[-2].get("metrics") or {}
    
    latest_asym = float(latest.get("asymmetryIndex") or 0)
    prev_asym = float(previous.get("asymmetryIndex") or 0)
    
    if latest_asym > 5.0 and prev_asym > 5.0:
        insights.append("Repeated lateral asymmetry detected. High risk of chronic compensation.")
    elif latest_asym > prev_asym + 3.0:
        insights.append("Sudden increase in movement asymmetry. Possible fatigue compensation detected.")
        
    latest_gct = float(latest.get("gct") or 0)
    prev_gct = float(previous.get("gct") or 0)
    
    if latest_gct > prev_gct + 15:
        insights.append("Significant increase in ground contact time. Sprint posture degrades after acceleration phase.")
        
    latest_osc = float(latest.get("oscillation") or 0)
    prev_osc = float(previous.get("oscillation") or 0)
    
    if latest_osc > prev_osc + 2.0:
        insights.append("Vertical oscillation increased. Landing instability developing.")
        
    return insights
