import numpy as np

def smooth_landmark_coordinates(coords: list, window_length: int = 5, polyorder: int = 2) -> np.ndarray:
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
