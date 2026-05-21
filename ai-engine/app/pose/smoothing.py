import numpy as np

class KalmanFilter:
    """
    Standard 1D Kalman Filter for smoothing individual coordinate streams.
    """
    def __init__(self, process_noise: float = 1e-4, measurement_noise: float = 1e-2, estimated_error: float = 1e-1):
        self.q = process_noise  # Process noise covariance
        self.r = measurement_noise  # Measurement noise covariance
        self.p = estimated_error  # Estimation error covariance
        self.x = 0.0  # Value estimate
        self.initialized = False

    def filter(self, measurement: float) -> float:
        if not self.initialized:
            self.x = measurement
            self.initialized = True
            return self.x

        # Time update (prediction)
        p_prior = self.p + self.q

        # Measurement update (correction)
        k = p_prior / (p_prior + self.r)
        self.x = self.x + k * (measurement - self.x)
        self.p = (1.0 - k) * p_prior

        return self.x


def smooth_landmark_coordinates(coords: list | np.ndarray, window_length: int = 5, polyorder: int = 2) -> np.ndarray:
    """
    Applies Savitzky-Golay filtering or moving average to smooth landmark coordinates.
    Input 'coords' is a list of floats (coordinates over frames).
    """
    arr = np.array(coords, dtype=float)
    if len(arr) < window_length:
        return arr  # Too short to smooth, return raw coordinates

    try:
        from scipy.signal import savgol_filter
        # Savitzky-Golay filter preserves vertical velocity peaks while clearing high-frequency pose jitter
        return savgol_filter(arr, window_length=window_length, polyorder=polyorder)
    except ImportError:
        # Graceful fallback: Simple moving average filter
        smoothed = np.copy(arr)
        for i in range(len(arr)):
            start = max(0, i - window_length // 2)
            end = min(len(arr), i + window_length // 2 + 1)
            smoothed[i] = np.mean(arr[start:end])
        return smoothed


def smooth_trajectory_2d(positions: list[list[float]] | list[tuple[float, float]], window_length: int = 5, polyorder: int = 2) -> list[list[float]]:
    """
    Applies both Kalman Filtering (temporal) and Savitzky-Golay Filtering (spatial)
    sequentially to x and y coordinates of a 2D landmark trajectory.
    """
    if len(positions) < 3:
        return [list(p) for p in positions]

    x_coords = [p[0] for p in positions]
    y_coords = [p[1] for p in positions]

    # 1. Temporal Smoothing: Kalman Filter
    kf_x = KalmanFilter(process_noise=1e-5, measurement_noise=1e-3, estimated_error=1e-2)
    kf_y = KalmanFilter(process_noise=1e-5, measurement_noise=1e-3, estimated_error=1e-2)

    kalman_x = [kf_x.filter(x) for x in x_coords]
    kalman_y = [kf_y.filter(y) for y in y_coords]

    # 2. Spatial/Trend Smoothing: Savitzky-Golay
    smoothed_x = smooth_landmark_coordinates(kalman_x, window_length=window_length, polyorder=polyorder)
    smoothed_y = smooth_landmark_coordinates(kalman_y, window_length=window_length, polyorder=polyorder)

    # 3. Combine back
    return [[float(x), float(y)] for x, y in zip(smoothed_x, smoothed_y)]
