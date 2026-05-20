import numpy as np

def calculate_vertical_oscillation(l_hip_y: list) -> float:
    """
    Measures center-of-mass vertical bouncing (in centimeters)
    by measuring pelvis coordinate displacement ranges.
    """
    if len(l_hip_y) < 10:
        return 7.2

    min_y = np.min(l_hip_y)
    max_y = np.max(l_hip_y)
    range_y = max_y - min_y

    # Height scale heuristics: Hip height range * 90 yields real-world cm vertical bounds
    oscillation = round(range_y * 90, 1)
    return min(max(oscillation, 3.0), 15.0)
