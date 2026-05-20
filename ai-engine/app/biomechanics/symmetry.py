def calculate_symmetry_index(left_val: float, right_val: float) -> float:
    """
    Computes standard biomechanical Symmetry Index (SI) percentage.
    SI = (abs(Left - Right) / (0.5 * (Left + Right))) * 100
    Perfect symmetry = 0%.
    """
    if left_val <= 0 or right_val <= 0:
        return 0.0
    
    diff = abs(left_val - right_val)
    mean_val = (left_val + right_val) / 2
    
    si = round((diff / mean_val) * 100, 1)
    return min(max(si, 0.0), 25.0)
