import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.validation.running_activity_validator import (
    _alternating_gait_ratio,
    _effective_running_cadence,
    _interval_cadence_spm,
    _max_consecutive_same_foot,
    validate_running_activity,
)


class _FakeTracker:
    def __init__(
        self,
        duration_sec: float,
        left_knee_y: list[float],
        right_knee_y: list[float],
        left_ankle_y: list[float],
        right_ankle_y: list[float],
    ):
        self.timestamps = list(range(len(left_knee_y)))
        self.left_knee_positions = [[0.0, y] for y in left_knee_y]
        self.right_knee_positions = [[0.0, y] for y in right_knee_y]
        self._left_ankle_y = left_ankle_y
        self._right_ankle_y = right_ankle_y
        self.duration_sec = duration_sec

    def get_ankle_y_series(self, side: str) -> list[float]:
        return self._left_ankle_y if side == "left" else self._right_ankle_y


class TestRunningActivityValidator(unittest.TestCase):
    def test_interval_cadence_not_diluted_by_full_clip(self):
        strikes = [
            {"foot": "left", "timestamp": 3.0, "index": 0},
            {"foot": "right", "timestamp": 3.35, "index": 5},
            {"foot": "left", "timestamp": 3.7, "index": 10},
            {"foot": "right", "timestamp": 4.05, "index": 15},
            {"foot": "left", "timestamp": 4.4, "index": 20},
            {"foot": "right", "timestamp": 4.75, "index": 25},
        ]
        # Full clip is 5s but only ~1.75s of strikes -> old density was ~206 spm over 5s = fail
        diluted = (len(strikes) / 5.0) * 60.0
        self.assertLess(diluted, 110)
        self.assertGreaterEqual(_interval_cadence_spm(strikes), 150)
        self.assertGreaterEqual(_effective_running_cadence(strikes, 5.0), 150)

    def test_sparse_30fps_portrait_running_passes(self):
        """Simulates missed detections common in portrait 30 FPS track clips."""
        strikes = [
            {"foot": "left", "timestamp": 0.5, "index": 0},
            {"foot": "right", "timestamp": 0.95, "index": 4},
            {"foot": "left", "timestamp": 1.85, "index": 10},
            {"foot": "right", "timestamp": 2.3, "index": 14},
            {"foot": "left", "timestamp": 3.2, "index": 20},
            {"foot": "right", "timestamp": 3.65, "index": 24},
        ]
        n = 40
        tracker = _FakeTracker(
            4.5,
            left_knee_y=[0.5 + (i % 7) * 0.025 for i in range(n)],
            right_knee_y=[0.52 - (i % 7) * 0.025 for i in range(n)],
            left_ankle_y=[0.68 + (i % 9) * 0.035 for i in range(n)],
            right_ankle_y=[0.70 - (i % 9) * 0.035 for i in range(n)],
        )
        ok, reason = validate_running_activity(tracker, strikes, 30.0)
        self.assertTrue(ok, reason)

    def test_alternating_running_strikes_pass_helper_metrics(self):
        strikes = [
            {"foot": "left", "timestamp": 0.0, "index": 0},
            {"foot": "right", "timestamp": 0.35, "index": 5},
            {"foot": "left", "timestamp": 0.7, "index": 10},
            {"foot": "right", "timestamp": 1.05, "index": 15},
            {"foot": "left", "timestamp": 1.4, "index": 20},
            {"foot": "right", "timestamp": 1.75, "index": 25},
        ]
        self.assertGreaterEqual(_alternating_gait_ratio(strikes), 0.9)
        self.assertLessEqual(_max_consecutive_same_foot(strikes), 1)

    def test_same_foot_hops_fail(self):
        strikes = [
            {"foot": "left", "timestamp": 0.0, "index": 0},
            {"foot": "left", "timestamp": 0.3, "index": 4},
            {"foot": "left", "timestamp": 0.6, "index": 8},
            {"foot": "left", "timestamp": 0.9, "index": 12},
            {"foot": "right", "timestamp": 1.2, "index": 16},
        ]
        n = 30
        tracker = _FakeTracker(
            2.0,
            left_knee_y=[0.5 + (i % 6) * 0.02 for i in range(n)],
            right_knee_y=[0.5 - (i % 6) * 0.02 for i in range(n)],
            left_ankle_y=[0.7 + (i % 8) * 0.03 for i in range(n)],
            right_ankle_y=[0.7 - (i % 8) * 0.03 for i in range(n)],
        )
        ok, reason = validate_running_activity(tracker, strikes, 60.0)
        self.assertFalse(ok)
        self.assertIn("running", reason.lower())

    def test_bilateral_knee_pattern_fails(self):
        strikes = [
            {"foot": "left", "timestamp": 0.0, "index": 0},
            {"foot": "right", "timestamp": 0.35, "index": 5},
            {"foot": "left", "timestamp": 0.7, "index": 10},
            {"foot": "right", "timestamp": 1.05, "index": 15},
            {"foot": "left", "timestamp": 1.4, "index": 20},
            {"foot": "right", "timestamp": 1.75, "index": 25},
        ]
        n = 30
        shared = [0.5 + (i % 10) * 0.02 for i in range(n)]
        tracker = _FakeTracker(
            2.0,
            left_knee_y=shared,
            right_knee_y=shared,
            left_ankle_y=[0.7 + (i % 8) * 0.04 for i in range(n)],
            right_ankle_y=[0.7 + (i % 8) * 0.04 for i in range(n)],
        )
        ok, reason = validate_running_activity(tracker, strikes, 60.0)
        self.assertFalse(ok)
        self.assertIn("bilateral", reason.lower())


if __name__ == "__main__":
    unittest.main()
