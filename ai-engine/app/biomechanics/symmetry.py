def calculate_symmetry_index(left_val: float, right_val: float) -> float:
    """
    Computes standard biomechanical Asymmetry percentage using maximum value bounds.
    Asymmetry = (abs(Left - Right) / max(Left, Right)) * 100
    Perfect symmetry = 0% asymmetry.
    """
    if left_val <= 0 or right_val <= 0:
        return 0.0
    
    max_val = max(left_val, right_val)
    diff = abs(left_val - right_val)
    
    asymmetry = round((diff / max_val) * 100, 1)
    return min(max(asymmetry, 0.0), 100.0)
