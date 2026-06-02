import json
from pathlib import Path
from typing import Any, Dict

class AthlixirNormsEngine:
    """
    Athlixir proprietary Norms Engine that maps sprint/run events, gender, 
    and age groups to high-performance baseline benchmarks.
    """
    
    @staticmethod
    def get_norms(event: str, gender: str, age_group: str) -> Dict[str, Any]:
        event_clean = str(event or "100m").strip().lower()
        gender_clean = str(gender or "male").strip().lower()
        age_clean = str(age_group or "U18").strip().upper()
        
        # Default middle distance (e.g., 1500m) U18 male baseline
        cadence_state = 185
        stride_state = 1.85
        symmetry_state = 90
        gct_state = 145
        
        # Adjust based on event type
        is_sprint = any(x in event_clean for x in ["100m", "200m", "400m", "60m", "110m", "hurdles", "sprint"])
        is_long_dist = any(x in event_clean for x in ["3000m", "5000m", "10000m", "marathon", "cross"])
        
        if is_sprint:
            # Sprints require faster turnover, longer strides (relative to height), and short contact times
            cadence_state = 190
            stride_state = 2.10
            symmetry_state = 92
            gct_state = 120
        elif is_long_dist:
            # Long distance: moderate cadence, shorter strides, slightly longer contact times
            cadence_state = 180
            stride_state = 1.65
            symmetry_state = 90
            gct_state = 170
            
        # Gender adjustments
        if gender_clean.startswith("f"):
            # Female athletes have slightly different stride lengths due to height ratios
            stride_state = round(stride_state * 0.90, 2)
            # GCT is slightly adjusted
            gct_state = int(gct_state * 1.05)
            
        # Age group adjustments (e.g., U15/U18 vs Elite/Open)
        if "U15" in age_clean or "U14" in age_clean:
            stride_state = round(stride_state * 0.85, 2)
            cadence_state = int(cadence_state * 0.95)
            gct_state = int(gct_state * 1.10)
        elif "ELITE" in age_clean or "OPEN" in age_clean:
            # Elite athletes have superior stride parameters
            stride_state = round(stride_state * 1.08, 2)
            cadence_state = int(cadence_state * 1.03)
            gct_state = int(gct_state * 0.90)
            
        return {
            "cadence_state": cadence_state,
            "stride_state": stride_state,
            "symmetry_state": symmetry_state,
            "gct_state": gct_state
        }
