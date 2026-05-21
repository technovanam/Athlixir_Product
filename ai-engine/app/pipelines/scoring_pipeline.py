"""
ATHLIXIR full Athlete Intelligence Pipeline.
"""

from __future__ import annotations

from typing import Any

from app.scoring.athlete_level import classify_athlete
from app.scoring.benchmarking import compare_against_norms
from app.scoring.insights import generate_insights
from app.scoring.injury_risk import evaluate_injury_risk
from app.scoring.performance_score import calculate_performance_scores
from app.scoring.progress_tracking import compute_progress
from app.scoring.recommendations import generate_biomechanics_recommendations
from app.scoring.report_generator import generate_html_report


def run_intelligence_pipeline(
    metrics: dict[str, Any],
    *,
    analysis_id: str = "",
    age_group: str | None = None,
    gender: str | None = None,
    event: str | None = None,
    previous_metrics: dict[str, Any] | None = None,
) -> dict[str, Any]:
    benchmarks = compare_against_norms(metrics)

    scores = calculate_performance_scores(metrics, benchmarks.get("percentiles", {}))
    classification = classify_athlete(scores, benchmarks)
    injury = evaluate_injury_risk(metrics)

    injury_payload = {
        "level": injury["injuryRisk"],
        "riskArea": injury["riskArea"],
        "score": injury["injuryRiskScore"],
    }

    insights = generate_insights(metrics, benchmarks, scores, injury_payload)
    recommendations = generate_biomechanics_recommendations(metrics, insights)
    progress = compute_progress(metrics, previous_metrics)

    report_html = ""
    if analysis_id:
        report_html = generate_html_report(
            analysis_id,
            {
                "metrics": metrics,
                "benchmarks": benchmarks,
                "scores": {**scores, **classification, "injuryRiskScore": injury["injuryRiskScore"]},
                "classification": classification,
                "injuryRisk": injury_payload,
                "insights": insights,
                "recommendations": recommendations,
                "progress": progress or {},
            },
        )

    return {
        "metrics": metrics,
        "benchmarks": benchmarks,
        "scores": {
            **scores,
            "injuryRiskScore": injury["injuryRiskScore"],
            **classification,
        },
        "classification": classification,
        "injuryRisk": injury_payload,
        "injuryRisks": injury["injuryRisks"],
        "insights": insights,
        "recommendations": recommendations,
        "progress": progress,
        "reportHtml": report_html,
    }
