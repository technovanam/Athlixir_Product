import cv2
import mediapipe as mp

mp_pose = mp.solutions.pose

# We must initialize this dynamically or provide a reset so that
# repeated video processing runs in the same process don't leak state.
pose = None

def _get_pose():
    global pose
    if pose is None:
        pose = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
    return pose

def reset_pose_tracker():
    """Forces a complete reset of the MediaPipe tracker state for determinism."""
    global pose
    if pose is not None:
        pose.close()
    pose = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        smooth_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

def extract_pose(frame):
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = _get_pose().process(frame_rgb)

    if not results.pose_landmarks:
        return None

    return results.pose_landmarks.landmark
