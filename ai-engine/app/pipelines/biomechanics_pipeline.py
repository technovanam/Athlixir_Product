"""
Core biomechanics extraction — metrics first (fast path).
Skeleton overlay is generated separately after metrics complete.
"""

from app.biomechanics.cadence import calculate_cadence
from app.biomechanics.foot_strike import detect_foot_strikes
from app.biomechanics.gct import calculate_gct
from app.biomechanics.oscillation import calculate_vertical_oscillation
from app.biomechanics.overstride import calculate_overstride_angle
from app.biomechanics.posture import calculate_posture_lean
from app.biomechanics.stride_length import calculate_stride_length
from app.biomechanics.symmetry import calculate_symmetry_index
from app.config import MAX_ANALYSIS_SECONDS
from app.pipelines.pose_pipeline import run_pose_extraction_pipeline


def run_biomechanics_extraction_pipeline(
    video_path: str,
    athlete_height_m: float = 1.75,
) -> dict:
    landmark_history, tracker, fps, total_frames = run_pose_extraction_pipeline(video_path)

    # Smooth all joint coordinates to eliminate tracking jitter and noise
    tracker.smooth_all_trajectories()

    duration_sec = min(total_frames / fps if fps > 0 else 0, MAX_ANALYSIS_SECONDS)

    foot_strikes = detect_foot_strikes(tracker)

    if len(foot_strikes) < 2:
        raise ValueError(
            f"Insufficient foot strikes detected ({len(foot_strikes)}). "
            "Use stable side-view sprint footage."
        )

    cadence = calculate_cadence(foot_strikes, duration_sec)
    gct_data = calculate_gct(foot_strikes, tracker, fps)
    stride_data = calculate_stride_length(
        foot_strikes, tracker, athlete_height_m=athlete_height_m
    )

    gct_asymmetry = calculate_symmetry_index(float(gct_data["left"]), float(gct_data["right"]))
    stride_asymmetry = calculate_symmetry_index(float(stride_data["left"]), float(stride_data["right"]))
    asymmetry_index = round((gct_asymmetry + stride_asymmetry) / 2, 1)

    hip_y = [p[1] for p in tracker.left_hip_positions]
    shoulder_x = [p[0] for p in tracker.left_shoulder_positions]
    shoulder_y = [p[1] for p in tracker.left_shoulder_positions]
    hip_x = [p[0] for p in tracker.left_hip_positions]
    ankle_x = tracker.get_ankle_x_series("left")

    oscillation = calculate_vertical_oscillation(hip_y)
    posture_angle = calculate_posture_lean(shoulder_x, shoulder_y, hip_x, hip_y)
    overstride_angle = calculate_overstride_angle(ankle_x, hip_x, posture_angle)

    result_payload = {
        "metrics": {
            "cadence": cadence,
            "gct": gct_data["avg"],
            "strideLength": round(stride_data["avg"], 2),
            "asymmetryIndex": asymmetry_index,
            "symmetry": round(max(0.0, 100.0 - asymmetry_index * 4.0), 1),
            "oscillation": oscillation,
            "overstrideAngle": overstride_angle,
            "postureAngle": posture_angle,
            "leftGct": gct_data["left"],
            "rightGct": gct_data["right"],
            "leftStride": stride_data["left"],
            "rightStride": stride_data["right"],
        },
        "footStrikes": foot_strikes,
        "landmarkFrameCount": tracker.frame_count,
        "fps": fps,
        "durationSec": round(duration_sec, 3),
        "landmarkHistory": landmark_history,
    }

    from app.config import DEBUG_MODE
    if DEBUG_MODE:
        import json
        import os
        os.makedirs("outputs/debug", exist_ok=True)
        with open("outputs/debug/metrics.json", "w") as f:
            json.dump(result_payload["metrics"], f, indent=2)
        with open("outputs/debug/foot_strikes.json", "w") as f:
            json.dump(result_payload["footStrikes"], f, indent=2)
        with open("outputs/debug/landmarks.json", "w") as f:
            json.dump(result_payload["landmarkHistory"], f, indent=2)
        print("[DEBUG] Wrote raw metrics and landmarks to outputs/debug/")

    return result_payload
