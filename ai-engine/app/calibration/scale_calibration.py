"""
Calculates dynamic meters_per_pixel scale based on athlete's physical height
and their varying pixel span across the frame.
"""
import numpy as np

def estimate_body_span_pixels(tracker, frame_index: int) -> float:
    """
    Estimates the vertical height in normalized MediaPipe coordinates (0.0 - 1.0)
    for a specific frame by measuring shoulder to ankle distance.
    """
    if frame_index >= tracker.frame_count:
        return 0.5
        
    l_shoulder = tracker.left_shoulder_positions[frame_index]
    l_ankle = tracker.left_ankle_positions[frame_index]
    r_shoulder = tracker.right_shoulder_positions[frame_index]
    r_ankle = tracker.right_ankle_positions[frame_index]

    l_span = abs(l_ankle[1] - l_shoulder[1])
    r_span = abs(r_ankle[1] - r_shoulder[1])
    
    # We take the maximum to avoid issues when one leg is raised high (which shortens the span)
    return max(l_span, r_span)

def get_scale_for_frame(tracker, frame_index: int, athlete_height_m: float = 1.75) -> float:
    """
    Returns meters_per_unit for a specific frame.
    Because MediaPipe outputs normalized coordinates (0.0 to 1.0), 
    we determine how much of the frame the athlete occupies.
    """
    span = estimate_body_span_pixels(tracker, frame_index)
    if span <= 0.05: # safety catch
        return athlete_height_m / 0.5
        
    return athlete_height_m / span
