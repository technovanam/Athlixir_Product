import numpy as np
from scipy.signal import savgol_filter

def smooth_trajectory(series: list[float], window_length: int = 5, polyorder: int = 2) -> list[float]:
    """
    Applies Savitzky-Golay filter to smooth a 1D time series (e.g. X or Y coordinates of a landmark).
    This drastically reduces jitter from MediaPipe and improves foot-strike timing determinism.
    """
    if len(series) < window_length:
        return series
    
    # Ensure window_length is odd
    if window_length % 2 == 0:
        window_length += 1
        
    if len(series) < window_length:
        return series
        
    smoothed = savgol_filter(series, window_length, polyorder)
    return smoothed.tolist()

def smooth_trajectory_2d(positions: list[list[float]], window_length: int = 5, polyorder: int = 2) -> list[list[float]]:
    """
    Applies Savitzky-Golay to a list of [x, y, (conf)] coordinates.
    """
    if len(positions) < window_length:
        return positions
        
    x_coords = [p[0] for p in positions]
    y_coords = [p[1] for p in positions]
    
    smoothed_x = smooth_trajectory(x_coords, window_length, polyorder)
    smoothed_y = smooth_trajectory(y_coords, window_length, polyorder)
    
    # If confidence exists, preserve it. Could smooth confidence too.
    has_conf = len(positions[0]) > 2
    if has_conf:
        conf_coords = [p[2] for p in positions]
        smoothed_conf = smooth_trajectory(conf_coords, window_length, polyorder)
    
    result = []
    for i in range(len(positions)):
        if has_conf:
            result.append([smoothed_x[i], smoothed_y[i], smoothed_conf[i]])
        else:
            result.append([smoothed_x[i], smoothed_y[i]])
            
    return result
