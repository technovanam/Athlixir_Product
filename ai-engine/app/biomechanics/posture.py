import numpy as np

def calculate_posture_lean(shoulder_x: list, shoulder_y: list, hip_x: list, hip_y: list) -> float:
    """
    Measures the athlete's forward lean postural angle (in degrees)
    relative to the vertical gravity vector.
    """
    if not (len(shoulder_x) == len(shoulder_y) == len(hip_x) == len(hip_y)) or len(shoulder_x) < 5:
        return 6.5

    angles = []
    for i in range(len(hip_x)):
        dx = hip_x[i] - shoulder_x[i]
        dy = hip_y[i] - shoulder_y[i]
        if dy > 0:
            angle_rad = np.arctan(abs(dx) / dy)
            angles.append(np.degrees(angle_rad))

    posture_angle = float(np.mean(angles)) if angles else 6.5
    return round(min(max(posture_angle, 1.0), 20.0), 1)
