"""
Cadence (steps per minute) from detected foot strikes.

Formula: Cadence = (Steps / Time) × 60
"""


def calculate_cadence(foot_strikes: list[dict], duration_sec: float) -> int:
    """
    Compute cadence from foot strike events and video duration.
    Each foot strike counts as one step.
    """
    if duration_sec <= 0 or len(foot_strikes) < 2:
        return 0

    steps = len(foot_strikes)
    cadence = int((steps / duration_sec) * 60)

    print(f"[Cadence] {steps} strikes / {duration_sec:.2f}s = {cadence} spm")
    return cadence
