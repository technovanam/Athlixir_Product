def calibrate_camera_scale(track_width_pixels: float, standard_track_width_m: float = 1.22) -> float:
    """
    Computes spatial scale calibration factor (meters per pixel)
    using the standard international track lane width of 1.22m.
    """
    if track_width_pixels <= 0:
        return 0.005 # Standard safe scale factor fallback (0.5cm per pixel)
    return standard_track_width_m / track_width_pixels
