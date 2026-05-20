import numpy as np

def calculate_acceleration(hip_x: list, fps: float) -> float:
    """
    Computes horizontal center-of-mass velocity and forward acceleration
    over successive frames.
    """
    if len(hip_x) < 5 or fps <= 0:
        return 0.0

    # Differentiate coordinates to get velocities
    velocities = np.diff(hip_x) * fps
    
    # Differentiate velocity to get accelerations
    accelerations = np.diff(velocities) * fps
    
    # Return average absolute acceleration scaled to m/s^2 representation
    avg_acc = float(np.mean(np.abs(accelerations)) * 9.8)
    return round(min(max(avg_acc, 0.5), 8.5), 2)
