"""
ATHLIXIR Injury Risk Engine — rule-based biomechanical risk intelligence.
"""

from __future__ import annotations

from typing import Any


def evaluate_injury_risk(metrics: dict[str, Any]) -> dict[str, Any]:
    asymmetry = float(metrics.get("asymmetryIndex") or metrics.get("symmetry") or 0)
    gct = float(metrics.get("gct") or 200)
    overstride = float(metrics.get("overstrideAngle") or metrics.get("overstride") or 0)
    oscillation = float(metrics.get("oscillation") or 0)

    flags: list[dict[str, Any]] = []
    risk_points = 0
    primary_area = "None"

    if asymmetry > 5.0:
        flags.append({
            "category": "Limb Asymmetry",
            "detected": True,
            "severity": "high" if asymmetry > 8 else "medium",
            "riskArea": "Knee",
            "detail": f"Asymmetry index {asymmetry}% exceeds 5% threshold",
        })
        risk_points += 30 if asymmetry > 8 else 18
        primary_area = "Knee"

    if gct > 240:
        flags.append({
            "category": "Prolonged Ground Contact",
            "detected": True,
            "severity": "medium" if gct < 280 else "high",
            "riskArea": "Fatigue",
            "detail": f"GCT {int(gct)}ms suggests fatigue or inefficient contact",
        })
        risk_points += 22 if gct >= 280 else 14
        if primary_area == "None":
            primary_area = "Fatigue"

    if overstride > 6.0:
        flags.append({
            "category": "Overstriding",
            "detected": True,
            "severity": "high" if overstride > 8 else "medium",
            "riskArea": "Hamstring",
            "detail": f"Overstride angle {overstride}° detected",
        })
        risk_points += 28 if overstride > 8 else 16
        primary_area = "Hamstring"

    if oscillation > 9.0:
        flags.append({
            "category": "Excessive Vertical Oscillation",
            "detected": True,
            "severity": "low" if oscillation < 11 else "medium",
            "riskArea": "Efficiency",
            "detail": f"Vertical oscillation {oscillation}cm above optimal range",
        })
        risk_points += 12
        if primary_area == "None":
            primary_area = "Efficiency"

    if not flags:
        flags.append({
            "category": "Movement Quality",
            "detected": False,
            "severity": "none",
            "riskArea": "None",
            "detail": "No significant biomechanical risk flags detected",
        })

    injury_risk_score = min(max(risk_points, 5), 95)

    if injury_risk_score >= 55:
        risk_label = "High"
    elif injury_risk_score >= 30:
        risk_label = "Moderate"
    elif injury_risk_score >= 15:
        risk_label = "Low"
    else:
        risk_label = "Minimal"

    return {
        "injuryRisk": risk_label,
        "riskArea": primary_area,
        "injuryRiskScore": injury_risk_score,
        "injuryRisks": flags,
    }
