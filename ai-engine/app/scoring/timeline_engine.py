"""
ATHLIXIR Timeline Engine — career intelligence platform.
"""

from typing import Any
from datetime import datetime

def generate_timeline(analyses: list[dict[str, Any]]) -> list[dict[str, Any]]:
    completed = [a for a in analyses if a.get("status") == "COMPLETED" and a.get("metrics")]
    completed.sort(key=lambda a: a.get("createdAt") or "")

    if not completed:
        return []

    timeline = []
    
    # First upload milestone
    first = completed[0]
    timeline.append({
        "date": first.get("createdAt", ""),
        "milestone": "Initiated ATHLIXIR Tracking",
        "type": "start"
    })
    
    # Track breakthroughs
    highest_tier = "Intermediate"
    best_cadence = 0
    
    for i, a in enumerate(completed):
        if i == 0:
            best_cadence = float(a.get("metrics", {}).get("cadence") or 0)
            highest_tier = a.get("scores", {}).get("athleteLevel") or "Intermediate"
            continue
            
        date = a.get("createdAt", "")
        metrics = a.get("metrics") or {}
        scores = a.get("scores") or {}
        
        current_cadence = float(metrics.get("cadence") or 0)
        current_tier = scores.get("athleteLevel") or "Intermediate"
        
        # Tier breakthrough
        tiers = {"Intermediate": 1, "Advanced": 2, "State": 3, "National": 4, "Elite": 5}
        if tiers.get(current_tier, 0) > tiers.get(highest_tier, 0):
            timeline.append({
                "date": date,
                "milestone": f"Reached {current_tier}-Level Classification",
                "type": "classification"
            })
            highest_tier = current_tier
            
        # Cadence breakthrough (>10% improvement)
        if best_cadence > 0 and current_cadence > best_cadence * 1.10:
            improvement_pct = int(((current_cadence - best_cadence) / best_cadence) * 100)
            timeline.append({
                "date": date,
                "milestone": f"Cadence improved by {improvement_pct}%",
                "type": "biomechanics"
            })
            best_cadence = current_cadence

    return timeline
