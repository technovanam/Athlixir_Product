"""
Reject videos that do not show recognizable running / sprint gait.

Used before full biomechanics scoring so dancing, functional drills, and
stationary exercises are not treated as running analyses.
"""

from __future__ import annotations

import numpy as np


def _raw_cadence_spm(foot_strikes: list[dict], duration_sec: float) -> float:
    if duration_sec <= 0 or len(foot_strikes) < 2:
        return 0.0
    return (len(foot_strikes) / duration_sec) * 60.0


def _active_strike_window_sec(foot_strikes: list[dict]) -> float:
    if len(foot_strikes) < 2:
        return 0.0
    return max(
        foot_strikes[-1]["timestamp"] - foot_strikes[0]["timestamp"],
        0.0,
    )


def _interval_cadence_spm(foot_strikes: list[dict]) -> float:
    """Steps per minute from median time between consecutive foot strikes."""
    if len(foot_strikes) < 2:
        return 0.0
    intervals = np.diff([s["timestamp"] for s in foot_strikes])
    intervals = intervals[intervals > 0.05]
    if len(intervals) == 0:
        return 0.0
    median_interval = float(np.median(intervals))
    if median_interval <= 0:
        return 0.0
    return 60.0 / median_interval


def _stride_based_cadence_spm(foot_strikes: list[dict], foot: str) -> float:
    """
    Estimate cadence from same-foot strike spacing (full stride cycle).
    More stable when alternate-foot detections are sparse (common at 30 FPS).
    """
    strikes = [s for s in foot_strikes if s["foot"] == foot]
    if len(strikes) < 2:
        return 0.0
    intervals = np.diff([s["timestamp"] for s in strikes])
    intervals = intervals[intervals > 0.12]
    if len(intervals) == 0:
        return 0.0
    stride_period = float(np.median(intervals))
    if stride_period <= 0:
        return 0.0
    return 120.0 / stride_period


def _effective_running_cadence(
    foot_strikes: list[dict],
    tracker_duration_sec: float,
) -> float:
    strike_window = _active_strike_window_sec(foot_strikes)
    estimates = [
        _interval_cadence_spm(foot_strikes),
        _stride_based_cadence_spm(foot_strikes, "left"),
        _stride_based_cadence_spm(foot_strikes, "right"),
    ]
    if strike_window >= 0.2:
        estimates.append(_raw_cadence_spm(foot_strikes, strike_window))
    elif tracker_duration_sec > 0:
        estimates.append(_raw_cadence_spm(foot_strikes, tracker_duration_sec))

    valid = [e for e in estimates if e > 0]
    if not valid:
        return 0.0
    return float(np.median(valid))


def _alternating_gait_ratio(foot_strikes: list[dict]) -> float:
    if len(foot_strikes) < 2:
        return 0.0
    alternations = sum(
        1
        for i in range(1, len(foot_strikes))
        if foot_strikes[i]["foot"] != foot_strikes[i - 1]["foot"]
    )
    return alternations / (len(foot_strikes) - 1)


def _max_consecutive_same_foot(foot_strikes: list[dict]) -> int:
    if not foot_strikes:
        return 0
    max_run = 1
    current = 1
    for i in range(1, len(foot_strikes)):
        if foot_strikes[i]["foot"] == foot_strikes[i - 1]["foot"]:
            current += 1
            max_run = max(max_run, current)
        else:
            current = 1
    return max_run


def _stride_interval_cv(foot_strikes: list[dict]) -> float:
    if len(foot_strikes) < 3:
        return 1.0
    intervals = np.diff([s["timestamp"] for s in foot_strikes])
    intervals = intervals[intervals > 0]
    if len(intervals) == 0:
        return 1.0
    mean = float(np.mean(intervals))
    if mean <= 0:
        return 1.0
    return float(np.std(intervals) / mean)


def _minor_foot_share(foot_strikes: list[dict]) -> float:
    if not foot_strikes:
        return 0.0
    left = sum(1 for s in foot_strikes if s["foot"] == "left")
    right = len(foot_strikes) - left
    return min(left, right) / len(foot_strikes)


def _knee_correlation(tracker) -> float:
    left_y = [p[1] for p in tracker.left_knee_positions]
    right_y = [p[1] for p in tracker.right_knee_positions]
    if len(left_y) < 12 or len(right_y) < 12:
        return 0.0
    return float(np.corrcoef(left_y, right_y)[0, 1])


def _ankle_vertical_range(tracker) -> float:
    left_y = tracker.get_ankle_y_series("left")
    right_y = tracker.get_ankle_y_series("right")
    if not left_y and not right_y:
        return 0.0
    all_y = left_y + right_y
    return float(max(all_y) - min(all_y))


def validate_running_activity(tracker, foot_strikes: list[dict], fps: float) -> tuple[bool, str]:
    """
    Return (True, "") when the clip looks like running/sprinting, else (False, reason).
    """
    duration_sec = tracker.duration_sec
    if len(foot_strikes) < 4:
        return False, (
            "This video does not show clear running foot strikes. "
            "Upload stable side-view sprint or running footage only."
        )

    alternating = _alternating_gait_ratio(foot_strikes)
    if alternating < 0.5:
        return False, (
            "Foot strike pattern does not match running gait. "
            "Only side-view running or sprint videos are accepted."
        )

    if _max_consecutive_same_foot(foot_strikes) > 4:
        return False, (
            "Repeated same-foot contacts detected — this does not look like running. "
            "Upload a side-view running or sprint clip."
        )

    minor_foot = _minor_foot_share(foot_strikes)
    if minor_foot < 0.18:
        return False, (
            "Both feet must alternate during a run. "
            "This video appears to be a non-running activity."
        )

    interval_cv = _stride_interval_cv(foot_strikes)
    ankle_rom = _ankle_vertical_range(tracker)
    raw_cadence = _effective_running_cadence(foot_strikes, duration_sec)

    gait_strong = (
        alternating >= 0.6
        and minor_foot >= 0.22
        and interval_cv <= 0.55
        and ankle_rom >= 0.025
    )

    # Clear alternating gait with visible leg motion — accept even if cadence is noisy
    # (common for portrait / 30 FPS social clips with sparse pose detections).
    if gait_strong and len(foot_strikes) >= 4:
        knee_corr = _knee_correlation(tracker)
        if knee_corr <= 0.82:
            return True, ""

    cadence_lo = 42 if gait_strong else 55
    cadence_hi = 390 if fps < 45 else 360
    cadence_ok = cadence_lo <= raw_cadence <= cadence_hi if raw_cadence > 0 else False

    if not cadence_ok:
        print(
            f"[Running Validator] Rejected cadence={raw_cadence:.1f} spm "
            f"(alt={alternating:.2f}, cv={interval_cv:.2f}, fps={fps:.1f})"
        )
        return False, (
            "Step rate is outside a running range. "
            "Upload side-view sprint or running footage (not dance or gym drills)."
        )

    cv_limit = 0.58 if fps < 45 else 0.48
    if interval_cv > cv_limit:
        return False, (
            "Stride timing is too irregular for running analysis. "
            "Use continuous side-view running or sprint video."
        )

    knee_corr = _knee_correlation(tracker)
    if knee_corr > 0.82:
        return False, (
            "Leg movement pattern matches bilateral exercise, not running. "
            "Only running or sprint videos are analyzed."
        )

    if ankle_rom < 0.025:
        return False, (
            "Not enough running stride motion detected. "
            "Use side-view footage with visible leg swing and foot contacts."
        )

    if fps >= 45:
        from app.biomechanics.gct import calculate_gct

        gct = calculate_gct(foot_strikes, tracker, fps)
        avg_gct = float(gct.get("avg") or 0)
        if avg_gct > 0 and (avg_gct < 60 or avg_gct > 480):
            return False, (
                "Ground contact timing does not match running mechanics. "
                "Upload side-view sprint or running video only."
            )

    return True, ""
