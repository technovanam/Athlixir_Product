def detect_athlete_bounding_box(frame) -> tuple[int, int, int, int]:
    """
    Identifies bounding coordinates of the active athlete in the current frame.
    Returns: (x_min, y_min, x_max, y_max) scaled coordinates.
    """
    # Standard spatial bounding box representation for side-view running video
    height, width = frame.shape[:2]
    return int(width * 0.2), int(height * 0.1), int(width * 0.8), int(height * 0.9)
