"""
ATHLIXIR Leaderboard Engine — athlete ranking and competition logic.
"""

from typing import Any

def generate_leaderboards(athletes_data: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    """
    Takes a list of athlete profiles and generates sorted leaderboards.
    athletes_data expects each dict to have:
    - athlete_id, name, performance_score, adaptation_score, consistency_score
    """
    
    top_overall = sorted(
        athletes_data, 
        key=lambda x: x.get("performance_score", 0), 
        reverse=True
    )[:10]
    
    most_improved = sorted(
        athletes_data, 
        key=lambda x: x.get("adaptation_score", 0), 
        reverse=True
    )[:10]
    
    most_consistent = sorted(
        athletes_data, 
        key=lambda x: x.get("consistency_score", 0), 
        reverse=True
    )[:10]
    
    return {
        "Top Overall Sprinters": top_overall,
        "Most Improved Athletes": most_improved,
        "Most Consistent Athletes": most_consistent
    }
