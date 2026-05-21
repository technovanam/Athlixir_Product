"""
Perspective correction using an assumed ground plane and the athlete's vertical position in frame.
"""

def normalize_to_ground_plane(x_norm: float, y_norm: float, scale_factor: float) -> tuple[float, float]:
    """
    Given a normalized coordinate (x,y) from MediaPipe, and the current scale factor for that frame,
    projects it onto a flattened 2D ground plane in meters relative to an arbitrary center.
    """
    # Without camera matrices, a robust proxy is:
    # Physical horizontal movement = normalized pixel movement * instantaneous scale
    # This prevents the athlete "shrinking" as they run away from skewing distance measurements.
    
    physical_x = x_norm * scale_factor
    physical_y = y_norm * scale_factor
    
    return physical_x, physical_y
