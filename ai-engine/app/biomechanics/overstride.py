import numpy as np

def calculate_overstride_angle(l_heel_x: list, l_hip_x: list, posture_lean_deg: float) -> float:
    """
    Estimates heel strike overstride angle (displacement of foot strike coordinate ahead
    of pelvis vertical axis) adjusted with the posture lean parameter.
    """
    if len(l_heel_x) < 5 or len(l_hip_x) < 5:
        return 4.2

    # Ratio of foot-pelvis displacement
    disp = [abs(l_heel_x[i] - l_hip_x[i]) for i in range(min(len(l_heel_x), len(l_hip_x)))]
    avg_disp = float(np.mean(disp))
    
    # Overstride angle heuristic relative to posture lean
    overstride = round(avg_disp * 30 + posture_lean_deg * 0.2, 1)
    return min(max(overstride, 0.5), 12.0)
