from typing import Any, Dict, List, Tuple

def validate_gct(gct: float) -> bool:
    return 50 <= gct <= 500

def validate_cadence(cadence: float) -> bool:
    return 100 <= cadence <= 300

def validate_stride(stride: float) -> bool:
    return 0.3 <= stride <= 5.0

def validate_symmetry(symmetry: float) -> bool:
    return 0 <= symmetry <= 100

def validate_oscillation(value: float) -> bool:
    return 0 <= value <= 50

def validate_biomechanics_metrics(metrics: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Validates biomechanics metrics.
    Replaces invalid metrics with None, and returns a list of metricFlags.
    """
    validated = metrics.copy()
    flags = []

    # Cadence
    cadence = metrics.get("cadence")
    if cadence is not None:
        try:
            cadence_val = float(cadence)
            if not validate_cadence(cadence_val):
                validated["cadence"] = None
                flags.append("cadence_unreliable")
        except (ValueError, TypeError):
            validated["cadence"] = None
            flags.append("cadence_unreliable")

    # GCT
    gct = metrics.get("gct")
    if gct is not None:
        try:
            gct_val = float(gct)
            if not validate_gct(gct_val):
                validated["gct"] = None
                flags.append("gct_unreliable")
        except (ValueError, TypeError):
            validated["gct"] = None
            flags.append("gct_unreliable")

    # Stride Length
    stride = metrics.get("strideLength") or metrics.get("stride_length")
    stride_key = "strideLength" if "strideLength" in metrics else "stride_length" if "stride_length" in metrics else "strideLength"
    if stride is not None:
        try:
            stride_val = float(stride)
            if not validate_stride(stride_val):
                validated[stride_key] = None
                flags.append("stride_unreliable")
        except (ValueError, TypeError):
            validated[stride_key] = None
            flags.append("stride_unreliable")

    # Symmetry
    symmetry = metrics.get("symmetry")
    if symmetry is not None:
        try:
            symmetry_val = float(symmetry)
            if not validate_symmetry(symmetry_val):
                validated["symmetry"] = None
                flags.append("symmetry_unreliable")
        except (ValueError, TypeError):
            validated["symmetry"] = None
            flags.append("symmetry_unreliable")

    # Oscillation
    oscillation = metrics.get("oscillation") or metrics.get("verticalOscillation") or metrics.get("vertical_oscillation")
    osc_key = "oscillation" if "oscillation" in metrics else "verticalOscillation" if "verticalOscillation" in metrics else "vertical_oscillation" if "vertical_oscillation" in metrics else "oscillation"
    if oscillation is not None:
        try:
            osc_val = float(oscillation)
            if not validate_oscillation(osc_val):
                validated[osc_key] = None
                flags.append("oscillation_unreliable")
        except (ValueError, TypeError):
            validated[osc_key] = None
            flags.append("oscillation_unreliable")

    return validated, flags
