"""
Foot strike detection — foundation for cadence, GCT, and stride length.

Strike occurs when the ankle reaches its lowest vertical position (max y in
MediaPipe normalized coordinates) with decreasing vertical velocity.
"""

import numpy as np


def _ankle_velocity(y_series: list[float]) -> np.ndarray:
    if len(y_series) < 2:
        return np.array([])
    return np.diff(np.array(y_series, dtype=float))


def _find_strike_peaks(
    y_series: list[float],
    timestamps: list[float],
    frame_indices: list[int],
    foot: str,
    min_stride_frames: int = 5,
) -> list[dict]:
    """
    Detect foot strikes as local maxima in ankle Y (foot at lowest screen position).
    Velocity must be near zero or transitioning at the strike frame.
    """
    if len(y_series) < 5:
        return []

    y = np.array(y_series, dtype=float)
    velocity = _ankle_velocity(y_series)

    strikes = []
    last_strike_idx = -min_stride_frames

    for i in range(1, len(y) - 1):
        # Local maximum in Y = foot at lowest point
        is_peak = y[i] > y[i - 1] and y[i] >= y[i + 1]
        if not is_peak:
            continue

        # Velocity decreasing toward ground contact
        if i < len(velocity):
            vel_before = velocity[i - 1] if i > 0 else 0.0
            vel_at = velocity[i]
            if vel_at > 0.002 and vel_before > 0.002:
                continue

        if i - last_strike_idx < min_stride_frames:
            continue

        strikes.append(
            {
                "frame": frame_indices[i],
                "timestamp": timestamps[i],
                "foot": foot,
                "ankle_y": float(y[i]),
                "index": i,
            }
        )
        last_strike_idx = i

    return strikes


def detect_foot_strikes(tracker) -> list[dict]:
    """
    Detect left and right foot strikes across the full run sequence.
    Returns sorted list of strike events.
    """
    min_stride_frames = max(3, int(len(tracker.timestamps) * 0.02))

    left_strikes = _find_strike_peaks(
        tracker.get_ankle_y_series("left"),
        tracker.timestamps,
        tracker.frame_indices,
        "left",
        min_stride_frames=min_stride_frames,
    )
    right_strikes = _find_strike_peaks(
        tracker.get_ankle_y_series("right"),
        tracker.timestamps,
        tracker.frame_indices,
        "right",
        min_stride_frames=min_stride_frames,
    )

    all_strikes = left_strikes + right_strikes
    all_strikes.sort(key=lambda s: s["timestamp"])

    print(
        f"[Foot Strike] Detected {len(left_strikes)} left, "
        f"{len(right_strikes)} right ({len(all_strikes)} total)"
    )

    return all_strikes
