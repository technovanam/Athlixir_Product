"""
Stride length estimation using foot strike spacing and athlete height calibration.

Uses horizontal ankle displacement between consecutive same-foot strikes,
scaled by estimated body height in normalized coordinates.
"""

import numpy as np


def _estimate_body_height_normalized(tracker) -> float:
    """Estimate vertical body span (shoulder to ankle) in normalized coordinates."""
    if tracker.frame_count < 1:
        return 0.5

    spans = []
    for i in range(tracker.frame_count):
        l_shoulder = tracker.left_shoulder_positions[i]
        l_ankle = tracker.left_ankle_positions[i]
        r_shoulder = tracker.right_shoulder_positions[i]
        r_ankle = tracker.right_ankle_positions[i]

        spans.append(abs(l_ankle[1] - l_shoulder[1]))
        spans.append(abs(r_ankle[1] - r_shoulder[1]))

    return float(np.median(spans)) if spans else 0.5


def _same_foot_stride_distances(foot_strikes: list[dict], tracker, foot: str) -> list[float]:
    """Horizontal ankle displacement between consecutive strikes of the same foot."""
    strikes = [s for s in foot_strikes if s["foot"] == foot]
    if len(strikes) < 2:
        return []

    x_series = tracker.get_ankle_x_series(foot)
    distances = []

    for i in range(1, len(strikes)):
        prev_idx = strikes[i - 1]["index"]
        curr_idx = strikes[i]["index"]
        if prev_idx < len(x_series) and curr_idx < len(x_series):
            distances.append(abs(x_series[curr_idx] - x_series[prev_idx]))

    return distances


def calculate_stride_length(
    foot_strikes: list[dict],
    tracker,
    athlete_height_m: float = 1.75,
) -> float:
    """
    Stride length in meters from same-foot strike spacing and height calibration.

    Normalized horizontal displacement is scaled using:
    meters_per_unit = athlete_height_m / body_height_normalized
    """
    if len(foot_strikes) < 3:
        return 0.0

    body_height_norm = _estimate_body_height_normalized(tracker)
    if body_height_norm <= 0.01:
        return 0.0

    meters_per_unit = athlete_height_m / body_height_norm

    left_distances = _same_foot_stride_distances(foot_strikes, tracker, "left")
    right_distances = _same_foot_stride_distances(foot_strikes, tracker, "right")
    all_distances = left_distances + right_distances

    if not all_distances:
        return 0.0

    avg_normalized_stride = float(np.median(all_distances))
    stride_m = round(avg_normalized_stride * meters_per_unit, 2)

    print(
        f"[Stride Length] {stride_m} m "
        f"(calibration {meters_per_unit:.3f} m/unit, height {athlete_height_m} m)"
    )
    return stride_m
