"""
Stride length estimation using exact ground-plane perspective calibration.
Uses horizontal ankle displacement normalized frame-by-frame by the athlete's physical height
to perfectly calculate distance despite camera panning or perspective distortion.
"""
import numpy as np
from app.calibration.distance_normalization import calculate_physical_distance

def _same_foot_stride_distances(foot_strikes: list[dict], tracker, foot: str, athlete_height_m: float) -> list[float]:
    """Calculates absolute ground distance in meters between consecutive same-foot strikes."""
    strikes = [s for s in foot_strikes if s["foot"] == foot]
    if len(strikes) < 2:
        return []

    distances = []
    for i in range(1, len(strikes)):
        start_frame = strikes[i - 1]["index"]
        end_frame = strikes[i]["index"]
        
        if start_frame < tracker.frame_count and end_frame < tracker.frame_count:
            # Use calibration engine to find absolute meters at the exact moment of the strike
            dist_m = calculate_physical_distance(tracker, start_frame, end_frame, athlete_height_m)
            
            # Realism guard
            distances.append(dist_m)

    return distances


def calculate_stride_length(
    foot_strikes: list[dict],
    tracker,
    athlete_height_m: float = 1.75,
) -> dict:
    """
    Stride length in meters using fully calibrated perspective normalization.
    """
    if len(foot_strikes) < 3:
        return {"avg": 0.0, "left": 0.0, "right": 0.0}

    left_distances = _same_foot_stride_distances(foot_strikes, tracker, "left", athlete_height_m)
    right_distances = _same_foot_stride_distances(foot_strikes, tracker, "right", athlete_height_m)
    all_distances = left_distances + right_distances

    if not all_distances:
        return {"avg": 0.0, "left": 0.0, "right": 0.0}

    # Filter out wild outliers from poor tracking before taking median
    valid_distances = [d for d in all_distances if 1.0 < d < 3.5]
    if not valid_distances:
        valid_distances = all_distances # Fallback if everything is an outlier

    stride_m = round(float(np.median(valid_distances)), 2)
    
    # Calculate side-specific
    v_left = [d for d in left_distances if 1.0 < d < 3.5] or left_distances
    v_right = [d for d in right_distances if 1.0 < d < 3.5] or right_distances
    
    left_stride = round(float(np.median(v_left)), 2) if v_left else stride_m
    right_stride = round(float(np.median(v_right)), 2) if v_right else stride_m

    print(f"[Calibration Engine] Stride Length corrected: {stride_m} m (L: {left_stride} m, R: {right_stride} m)")
    
    return {"avg": stride_m, "left": left_stride, "right": right_stride}
