import cv2

from app.config import MAX_ANALYSIS_SECONDS, MAX_FRAME_WIDTH
from app.pose.landmark_tracker import LandmarkTracker
from app.pose.mediapipe_pose import extract_pose

_LEFT_SHOULDER = 11
_RIGHT_SHOULDER = 12
_LEFT_HIP = 23
_RIGHT_HIP = 24
_LEFT_KNEE = 25
_RIGHT_KNEE = 26
_LEFT_ANKLE = 27
_RIGHT_ANKLE = 28


def _resize_frame(frame):
    h, w = frame.shape[:2]
    if w <= MAX_FRAME_WIDTH:
        return frame
    scale = MAX_FRAME_WIDTH / w
    return cv2.resize(frame, (MAX_FRAME_WIDTH, int(h * scale)))


def process_landmarks(landmarks, frame_index: int, fps: float, tracker: LandmarkTracker, landmark_history: list):
    frame_data = {
        "frame": frame_index,
        "timestamp": round(frame_index / fps, 4),
        "left_ankle": [landmarks[_LEFT_ANKLE].x, landmarks[_LEFT_ANKLE].y],
        "right_ankle": [landmarks[_RIGHT_ANKLE].x, landmarks[_RIGHT_ANKLE].y],
        "left_knee": [landmarks[_LEFT_KNEE].x, landmarks[_LEFT_KNEE].y],
        "right_knee": [landmarks[_RIGHT_KNEE].x, landmarks[_RIGHT_KNEE].y],
        "left_hip": [landmarks[_LEFT_HIP].x, landmarks[_LEFT_HIP].y],
        "right_hip": [landmarks[_RIGHT_HIP].x, landmarks[_RIGHT_HIP].y],
        "left_shoulder": [landmarks[_LEFT_SHOULDER].x, landmarks[_LEFT_SHOULDER].y],
        "right_shoulder": [landmarks[_RIGHT_SHOULDER].x, landmarks[_RIGHT_SHOULDER].y],
    }
    tracker.add_frame(frame_data)
    landmark_history.append(frame_data)


def run_pose_extraction_pipeline(video_path: str) -> tuple[list, LandmarkTracker, float, int]:
    """
    Fast pose pass: first MAX_ANALYSIS_SECONDS of video, frames downscaled for speed.
    """
    print(f"[Pose Pipeline] Fast processing: {video_path}")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30.0

    max_frames = int(fps * MAX_ANALYSIS_SECONDS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"[Pose Pipeline] FPS={fps}, cap={max_frames} frames (~{MAX_ANALYSIS_SECONDS}s)")

    tracker = LandmarkTracker()
    landmark_history = []
    frame_index = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_index += 1
        if frame_index > max_frames:
            break

        frame = _resize_frame(frame)
        landmarks = extract_pose(frame)

        if landmarks:
            process_landmarks(landmarks, frame_index, fps, tracker, landmark_history)

    cap.release()

    print(f"[Pose Pipeline] Tracked {tracker.frame_count} frames in {frame_index} read")

    if tracker.frame_count < 6:
        raise ValueError(
            "Insufficient body landmarks tracked. Use stable side-view footage."
        )

    return landmark_history, tracker, fps, min(frame_index, max_frames)
