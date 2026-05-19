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


def calculate_gct(foot_strikes: list[dict], tracker, fps: float) -> int:
    """
    Average ground contact time in milliseconds across all detected strikes.
    """
    if len(foot_strikes) < 2 or fps <= 0:
        return 0

    left_y = tracker.get_ankle_y_series("left")
    right_y = tracker.get_ankle_y_series("right")

    all_y = left_y + right_y
    y_min = min(all_y)
    y_max = max(all_y)
    rom = y_max - y_min
    if rom <= 0:
        return 0

    # Ground = lower 20% of ankle vertical range (near max Y)
    ground_threshold = y_min + 0.80 * rom
    max_contact_frames = max(int(fps * 0.5), 10)

    contact_durations_ms = []

    for strike in foot_strikes:
        idx = strike["index"]
        ankle_y = left_y if strike["foot"] == "left" else right_y
        frames = _contact_frames_for_strike(
            idx, ankle_y, ground_threshold, max_contact_frames
        )
        contact_durations_ms.append((frames / fps) * 1000)

    if not contact_durations_ms:
        return 0

    gct = int(np.mean(contact_durations_ms))
    print(f"[GCT] Average {gct} ms across {len(contact_durations_ms)} contacts")
    return gct
