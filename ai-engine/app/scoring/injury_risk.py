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

    if overstride > 6.0:
        flags.append({
            "category": "Overstriding",
            "detected": True,
            "severity": "high" if overstride > 8 else "medium",
            "riskArea": "Hamstring",
            "detail": f"Overstride detected, increased hamstring load",
        })
        risk_points += 28 if overstride > 8 else 16
        if primary_area == "None":
            primary_area = "Hamstring"

    if gct > 150:  # User defined realistic GCT is 70-150ms. High GCT -> fatigue
        flags.append({
            "category": "Prolonged Ground Contact",
            "detected": True,
            "severity": "medium" if gct < 180 else "high",
            "riskArea": "Fatigue",
            "detail": f"High GCT ({int(gct)}ms) suggests fatigue risk",
        })
        risk_points += 22 if gct >= 180 else 14
        if primary_area == "None":
            primary_area = "Fatigue"

    if oscillation > 10.0:
        flags.append({
            "category": "Excessive Vertical Oscillation",
            "detected": True,
            "severity": "medium",
            "riskArea": "Shin Splints",
            "detail": f"High impact vertical oscillation ({oscillation}cm)",
        })
        risk_points += 15
        if primary_area == "None":
            primary_area = "Lower Leg"

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
