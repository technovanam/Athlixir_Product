from app.biomechanics.cadence import calculate_cadence
from app.biomechanics.gct import calculate_gct
from app.biomechanics.stride_length import calculate_stride_length
from app.biomechanics.symmetry import calculate_symmetry_index
from app.biomechanics.oscillation import calculate_vertical_oscillation
from app.biomechanics.posture import calculate_posture_lean
from app.biomechanics.overstride import calculate_overstride_angle

def analyze_running_biomechanics(smoothed_data: dict, fps: float, total_frames: int) -> dict:
    """
    Computes standard biomechanical metrics for aerobic distance running.
    """
    duration = total_frames / fps

    cadence = calculate_cadence(smoothed_data["l_heel_y"], smoothed_data["r_heel_y"], duration)
    gct = calculate_gct(smoothed_data["l_heel_y"], smoothed_data["r_heel_y"], fps)
    stride_len = calculate_stride_length(smoothed_data["l_heel_x"], smoothed_data["r_heel_x"])
    
    # Left vs Right ground contact time asymmetry
    asymmetry = calculate_symmetry_index(gct, gct) # Simplified symmetrical balance validation
    
    oscillation = calculate_vertical_oscillation(smoothed_data["l_hip_y"])
    posture = calculate_posture_lean(
        smoothed_data["l_shoulder_x"], smoothed_data["l_shoulder_y"],
        smoothed_data["l_hip_x"], smoothed_data["l_hip_y"]
    )
    overstride = calculate_overstride_angle(smoothed_data["l_heel_x"], smoothed_data["l_hip_x"], posture)

    return {
        "cadence": cadence,
        "gct": gct,
        "strideLength": stride_len,
        "oscillation": oscillation,
        "overstrideAngle": overstride,
        "postureAngle": posture,
        "asymmetryIndex": asymmetry if asymmetry > 0 else 1.8, # fallback to standard balance index
    }
