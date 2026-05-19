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

    duration_sec = min(total_frames / fps if fps > 0 else 0, MAX_ANALYSIS_SECONDS)

    foot_strikes = detect_foot_strikes(tracker)

    if len(foot_strikes) < 2:
        raise ValueError(
            f"Insufficient foot strikes detected ({len(foot_strikes)}). "
            "Use stable side-view sprint footage."
        )

    cadence = calculate_cadence(foot_strikes, duration_sec)
    gct = calculate_gct(foot_strikes, tracker, fps)
    stride_length = calculate_stride_length(
        foot_strikes, tracker, athlete_height_m=athlete_height_m
    )

    left_strikes = sum(1 for s in foot_strikes if s.get("foot") == "left")
    right_strikes = sum(1 for s in foot_strikes if s.get("foot") == "right")
    asymmetry_index = calculate_symmetry_index(
        float(left_strikes), float(right_strikes)
    )

    hip_y = [p[1] for p in tracker.left_hip_positions]
    shoulder_x = [p[0] for p in tracker.left_shoulder_positions]
    shoulder_y = [p[1] for p in tracker.left_shoulder_positions]
    hip_x = [p[0] for p in tracker.left_hip_positions]
    ankle_x = tracker.get_ankle_x_series("left")

    oscillation = calculate_vertical_oscillation(hip_y)
    posture_angle = calculate_posture_lean(shoulder_x, shoulder_y, hip_x, hip_y)
    overstride_angle = calculate_overstride_angle(ankle_x, hip_x, posture_angle)

    return {
        "metrics": {
            "cadence": cadence,
            "gct": gct,
            "strideLength": round(stride_length, 2),
            "asymmetryIndex": asymmetry_index,
            "symmetry": round(max(0, 100 - asymmetry_index * 4), 1),
            "oscillation": oscillation,
            "overstrideAngle": overstride_angle,
            "postureAngle": posture_angle,
        },
        "footStrikes": foot_strikes,
        "landmarkFrameCount": tracker.frame_count,
        "fps": fps,
        "durationSec": round(duration_sec, 3),
        "landmarkHistory": landmark_history,
    }
