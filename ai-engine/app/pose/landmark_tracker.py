"""
Sequential landmark tracker across all video frames.
Powers foot strike, cadence, GCT, and stride length calculations.
"""


class LandmarkTracker:
    def __init__(self):
        self.left_ankle_positions = []
        self.right_ankle_positions = []
        self.left_knee_positions = []
        self.right_knee_positions = []
        self.left_hip_positions = []
        self.right_hip_positions = []
        self.left_shoulder_positions = []
        self.right_shoulder_positions = []

        self.timestamps = []
        self.frame_indices = []

    def add_frame(self, frame_data: dict):
        """Append one frame of normalized [x, y] landmarks."""
        self.frame_indices.append(frame_data["frame"])
        self.timestamps.append(frame_data["timestamp"])

        self.left_ankle_positions.append(frame_data["left_ankle"])
        self.right_ankle_positions.append(frame_data["right_ankle"])
        self.left_knee_positions.append(frame_data["left_knee"])
        self.right_knee_positions.append(frame_data["right_knee"])
        self.left_hip_positions.append(frame_data["left_hip"])
        self.right_hip_positions.append(frame_data["right_hip"])
        self.left_shoulder_positions.append(frame_data["left_shoulder"])
        self.right_shoulder_positions.append(frame_data["right_shoulder"])

    @property
    def frame_count(self) -> int:
        return len(self.timestamps)

    @property
    def duration_sec(self) -> float:
        if len(self.timestamps) < 2:
            return 0.0
        return self.timestamps[-1] - self.timestamps[0]

    def get_ankle_y_series(self, side: str) -> list[float]:
        positions = (
            self.left_ankle_positions
            if side == "left"
            else self.right_ankle_positions
        )
        return [p[1] for p in positions]

    def get_ankle_x_series(self, side: str) -> list[float]:
        positions = (
            self.left_ankle_positions
            if side == "left"
            else self.right_ankle_positions
        )
        return [p[0] for p in positions]
