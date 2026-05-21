"""
Ground Contact Time (GCT) in milliseconds.

GCT = frames on ground / FPS × 1000

Requires foot strike detection and ankle position tracking.
"""

import numpy as np


def _contact_frames_for_strike(
    strike_index: int,
    ankle_y: list[float],
    ground_threshold: float,
    max_contact_frames: int,
) -> int:
    """Count consecutive frames where ankle remains near ground after strike."""
    if strike_index >= len(ankle_y):
        return 0

    contact = 0
    for i in range(strike_index, min(strike_index + max_contact_frames, len(ankle_y))):
        if ankle_y[i] >= ground_threshold:
            contact += 1
        elif contact > 0:
            break

    return max(contact, 1)


def calculate_gct(foot_strikes: list[dict], tracker, fps: float) -> dict:
    """
    Average ground contact time in milliseconds across all detected strikes,
    and side-specific Ground Contact Times (GCT).
    """
    if fps < 60:
        print(f"[GCT WARNING] Low temporal resolution (FPS={fps:.1f} < 60). Millisecond GCT accuracy may be degraded.")

    if len(foot_strikes) < 2 or fps <= 0:
        return {"avg": 0, "left": 0, "right": 0}

    left_y = tracker.get_ankle_y_series("left")
    right_y = tracker.get_ankle_y_series("right")

    all_y = left_y + right_y
    y_min = min(all_y)
    y_max = max(all_y)
    rom = y_max - y_min
    if rom <= 0:
        return {"avg": 0, "left": 0, "right": 0}

    # Ground = bottom 15% of ankle vertical range of motion (near max Y)
    ground_threshold = y_min + 0.85 * rom
    max_contact_frames = max(int(fps * 0.5), 10)

    left_durations = []
    right_durations = []
    all_durations = []

    for strike in foot_strikes:
        idx = strike["index"]
        foot = strike["foot"]
        ankle_y = left_y if foot == "left" else right_y
        frames = _contact_frames_for_strike(
            idx, ankle_y, ground_threshold, max_contact_frames
        )
        duration_ms = (frames / fps) * 1000
        all_durations.append(duration_ms)
        if foot == "left":
            left_durations.append(duration_ms)
        else:
            right_durations.append(duration_ms)

    avg_gct = int(np.mean(all_durations)) if all_durations else 0
    left_gct = int(np.mean(left_durations)) if left_durations else avg_gct
    right_gct = int(np.mean(right_durations)) if right_durations else avg_gct

    print(f"[GCT] Average: {avg_gct} ms (Left: {left_gct} ms, Right: {right_gct} ms) across {len(all_durations)} contacts")
    return {"avg": avg_gct, "left": left_gct, "right": right_gct}
