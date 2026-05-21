"""
Distance normalization engine. Uses scale calibration to compute actual physical distances
between two tracked events (e.g. foot strikes).
"""

from app.calibration.scale_calibration import get_scale_for_frame
from app.calibration.perspective_correction import normalize_to_ground_plane

def calculate_physical_distance(tracker, start_frame: int, end_frame: int, athlete_height_m: float = 1.75) -> float:
    """
    Calculates the physical absolute ground distance in meters of a stride.
    Since cameras often pan, temporal tracking of one foot against the ground fails.
    Instead, we measure the maximum physical separation between the front and back ankle 
    DURING the stride cycle (which occurs at toe-off / early flight phase).
    """
    max_separation = 0.0
    
    for frame in range(start_frame, end_frame):
        left_x_norm = tracker.left_ankle_positions[frame][0]
        right_x_norm = tracker.right_ankle_positions[frame][0]
        
        scale = get_scale_for_frame(tracker, frame, athlete_height_m)
        
        physical_l, _ = normalize_to_ground_plane(left_x_norm, 0, scale)
        physical_r, _ = normalize_to_ground_plane(right_x_norm, 0, scale)
        
        separation = abs(physical_l - physical_r)
        if separation > max_separation:
            max_separation = separation
            
    # The true stride length is slightly longer than the max ankle-to-ankle separation
    # because of the body's forward travel during the flight phase after the back foot leaves.
    # Standard biomechanics multiplier for max ankle separation to stride length is ~1.5x.
    return max_separation * 1.5
