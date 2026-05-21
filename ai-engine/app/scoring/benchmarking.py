"""
ATHLIXIR Norm Comparison Engine — benchmarks biomechanics against scientific distributions.
"""

from __future__ import annotations
import json
from pathlib import Path
from typing import Any

_NORMS_DIR = Path(__file__).resolve().parent.parent / "norms"

def load_norm(metric: str) -> dict[str, Any]:
    path = _NORMS_DIR / f"{metric}_norms.json"
    if not path.exists():
        return {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def _assign_level_from_norm(value: float, norm_data: dict[str, Any]) -> dict[str, Any]:
    levels = norm_data.get("levels", [])
    if not levels:
        return {"level": "Beginner", "percentile": 0}
        
    higher_is_better = norm_data.get("is_higher_better", True)
    
    # Sort levels by 'min' to easily compute percentiles
    levels = sorted(levels, key=lambda x: x["min"])
    
    achieved_level = "Beginner"
    percentile = 0
    
    for i, lvl in enumerate(levels):
        vmin = lvl["min"]
        vmax = lvl["max"]
        
        if (value >= vmin and value <= vmax) or (value > vmax and i == len(levels)-1):
            achieved_level = lvl["level"]
            # basic linear interpolation for percentile
            # A bit rough but good enough for scoring
            if higher_is_better:
                base_pct = (i / len(levels)) * 100
                range_pct = (100 / len(levels))
                pct = base_pct + ((value - vmin) / max((vmax - vmin), 0.01)) * range_pct
            else:
                # lower is better, so flip percentile calculation
                base_pct = ((len(levels) - i - 1) / len(levels)) * 100
                range_pct = (100 / len(levels))
                pct = base_pct + ((vmax - value) / max((vmax - vmin), 0.01)) * range_pct
                
            percentile = min(max(int(pct), 1), 99)
            if value >= vmax and higher_is_better:
                percentile = 99
            if value <= vmin and not higher_is_better:
                percentile = 99
            break
            
    return {"level": achieved_level, "percentile": percentile}

def compare_against_norms(metrics: dict[str, Any]) -> dict[str, Any]:
    """
    Compare cadence, GCT, stride length, etc against scientifically validated JSON norms.
    """
    cadence = float(metrics.get("cadence") or 0)
    gct = float(metrics.get("gct") or 1000)
    stride = float(metrics.get("strideLength") or metrics.get("stride_length") or 0)
    symmetry = float(metrics.get("symmetry") or 100)
    
    cadence_norm = load_norm("cadence")
    gct_norm = load_norm("gct")
    stride_norm = load_norm("stride")
    symmetry_norm = load_norm("symmetry")
    
    c_res = _assign_level_from_norm(cadence, cadence_norm)
    g_res = _assign_level_from_norm(gct, gct_norm)
    s_res = _assign_level_from_norm(stride, stride_norm)
    sym_res = _assign_level_from_norm(symmetry, symmetry_norm)
    
    return {
        "cadenceLevel": c_res["level"],
        "gctLevel": g_res["level"],
        "strideLevel": s_res["level"],
        "symmetryLevel": sym_res["level"],
        "percentiles": {
            "cadence": c_res["percentile"],
            "gct": g_res["percentile"],
            "stride": s_res["percentile"],
            "symmetry": sym_res["percentile"],
        }
    }
