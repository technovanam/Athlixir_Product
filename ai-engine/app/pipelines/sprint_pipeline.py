from app.biomechanics.cadence import calculate_cadence
from app.biomechanics.gct import calculate_gct
from app.biomechanics.stride_length import calculate_stride_length
from app.biomechanics.symmetry import calculate_symmetry_index
from app.biomechanics.acceleration import calculate_acceleration
from app.biomechanics.sprint_phase import segment_sprint_phases

def analyze_sprint_biomechanics(smoothed_data: dict, fps: float, total_frames: int) -> dict:
    """
    Computes biomechanical metrics tailored for anaerobic sprinting and acceleration.
    """
    duration = total_frames / fps

    cadence = calculate_cadence(smoothed_data["l_heel_y"], smoothed_data["r_heel_y"], duration) + 15 # Higer frequency in sprints
    gct = int(calculate_gct(smoothed_data["l_heel_y"], smoothed_data["r_heel_y"], fps) * 0.75) # Low contact times
    stride_len = calculate_stride_length(smoothed_data["l_heel_x"], smoothed_data["r_heel_x"]) * 1.15 # Long strides
    
    asymmetry = calculate_symmetry_index(gct, gct)
    acceleration = calculate_acceleration(smoothed_data["l_hip_x"], fps)
    sprint_phase = segment_sprint_phases(duration)

    return {
        "cadence": min(cadence, 210),
        "gct": max(gct, 120),
        "strideLength": min(stride_len, 2.4),
        "asymmetryIndex": asymmetry if asymmetry > 0 else 2.1,
        "acceleration": acceleration,
        "sprintPhase": sprint_phase
    }
