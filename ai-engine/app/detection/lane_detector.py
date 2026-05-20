import cv2
import numpy as np

def detect_running_track_lanes(frame) -> list:
    """
    Finds running track boundaries or lane markings in the bottom half of the frame.
    """
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    
    # Use Hough line transform to isolate long linear track markers
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, 50, minLineLength=80, maxLineGap=10)
    return lines if lines is not None else []
