import os
import shutil
import subprocess

import cv2
import mediapipe as mp

from app.config import MAX_ANALYSIS_SECONDS, MAX_FRAME_WIDTH
from app.pose.mediapipe_pose import _get_pose

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

_LANDMARK_STYLE = mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2)
_CONNECTION_STYLE = mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=2)


def _reencode_for_browser(src_path: str) -> str:
    """
    Re-encode to H.264 so the overlay plays in Chrome/Edge <video> tags.
    OpenCV mp4v output often fails in browsers without transcoding.
    """
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg or not os.path.exists(src_path):
        return src_path

    dst_path = src_path.replace(".mp4", "_h264.mp4")
    try:
        subprocess.run(
            [
                ffmpeg,
                "-y",
                "-i",
                src_path,
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-movflags",
                "+faststart",
                "-preset",
                "ultrafast",
                dst_path,
            ],
            check=True,
            capture_output=True,
            timeout=30,
        )
        if os.path.getsize(dst_path) > 1024:
            os.remove(src_path)
            return dst_path
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as err:
        print(f"[Skeleton Overlay] ffmpeg re-encode skipped: {err}")

    return src_path


def render_skeleton_overlay_video(video_path: str, output_path: str, foot_strikes: list[int] = None) -> str:
    """
    Render skeleton overlay on every frame for visual validation.
    Returns path to the output MP4 file (browser-playable when ffmpeg is available).
    """
    print(f"[Skeleton Overlay] Rendering debug video -> {output_path}")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video for overlay: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30.0

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    if width > MAX_FRAME_WIDTH:
        scale = MAX_FRAME_WIDTH / width
        width = MAX_FRAME_WIDTH
        height = int(height * scale)

    max_frames = int(fps * MAX_ANALYSIS_SECONDS)
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    temp_path = output_path.replace(".mp4", "_raw.mp4")
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(temp_path, fourcc, fps, (width, height))

    if not writer.isOpened():
        raise ValueError("Could not create skeleton overlay video writer")

    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count > max_frames:
            break

        if frame.shape[1] != width:
            frame = cv2.resize(frame, (width, height))

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = _get_pose().process(frame_rgb)

        if results.pose_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                _LANDMARK_STYLE,
                _CONNECTION_STYLE,
            )

        if foot_strikes and frame_count in foot_strikes:
            cv2.putText(
                frame,
                "FOOT STRIKE DETECTED",
                (50, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.5,
                (0, 0, 255),
                3,
                cv2.LINE_AA,
            )

        writer.write(frame)

    cap.release()
    writer.release()

    if frame_count == 0 or not os.path.exists(temp_path) or os.path.getsize(temp_path) < 1024:
        raise ValueError("Skeleton overlay video is empty — no frames were written")

    print(f"[Skeleton Overlay] Wrote {frame_count} raw frames, re-encoding for browser…")
    final_path = _reencode_for_browser(temp_path)
    if final_path != temp_path and os.path.exists(temp_path):
        try:
            os.remove(temp_path)
        except OSError:
            pass

    if final_path != output_path:
        if os.path.exists(output_path):
            os.remove(output_path)
        os.rename(final_path, output_path)

    print(f"[Skeleton Overlay] Final file: {output_path} ({os.path.getsize(output_path)} bytes)")
    return output_path
