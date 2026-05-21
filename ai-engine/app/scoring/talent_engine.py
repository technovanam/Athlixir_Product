"""
ATHLIXIR Talent Identification Engine — future moat logic.
"""

from typing import Any

def evaluate_talent(analyses: list[dict[str, Any]], adaptation_score: int) -> list[str]:
    completed = [a for a in analyses if a.get("status") == "COMPLETED" and a.get("metrics")]
    completed.sort(key=lambda a: a.get("createdAt") or "")

    if not completed:
        return []

    latest = completed[-1]
    scores = latest.get("scores") or {}
    metrics = latest.get("metrics") or {}
    
    perf_score = float(scores.get("performanceScore") or 0)
    gct = float(metrics.get("gct") or 0)
    
    talent_flags = []
    
    if perf_score >= 85 and adaptation_score >= 80:
        talent_flags.append("High sprint potential detected. (Elite scores + fast adaptation)")
        
    if gct > 0 and gct <= 180:
        talent_flags.append("Elite acceleration profile observed. (World-class ground contact times)")
        
    if len(completed) >= 3 and adaptation_score >= 90:
        talent_flags.append("Rapid learning phenotype. Exceptional response to training corrections.")
        
    return talent_flags
