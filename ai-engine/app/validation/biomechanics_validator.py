from typing import Any, Dict, List, Optional, Tuple

from app.config import MIN_REQUIRED_FPS

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


def _check(
    validated: Dict[str, Any],
    flags: List[str],
    key: str,
    flag: str,
    validator,
    dependent_keys: Tuple[str, ...] = (),
) -> None:
    value = validated.get(key)
    if value is None:
        return
    try:
        ok = validator(float(value))
    except (ValueError, TypeError):
        ok = False
    if not ok:
        validated[key] = None
        for dep in dependent_keys:
            if dep in validated:
                validated[dep] = None
        flags.append(flag)


def _symmetry_from_asymmetry(asymmetry: float) -> float:
    return round(max(0.0, 100.0 - asymmetry * 4.0), 1)


def validate_biomechanics_metrics(
    metrics: Dict[str, Any],
    fps: Optional[float] = None,
) -> Tuple[Dict[str, Any], List[str]]:
    """
    Validates biomechanics metrics.
    Replaces invalid metrics (and the per-side values they were averaged from)
    with None, and returns a list of metricFlags.
    """
    validated = metrics.copy()
    flags: List[str] = []

    # Normalise legacy key spellings onto the canonical ones.
    if "strideLength" not in validated and "stride_length" in validated:
        validated["strideLength"] = validated.pop("stride_length")
    for legacy in ("verticalOscillation", "vertical_oscillation"):
        if "oscillation" not in validated and legacy in validated:
            validated["oscillation"] = validated.pop(legacy)

    _check(validated, flags, "cadence", "cadence_unreliable", validate_cadence)
    _check(validated, flags, "gct", "gct_unreliable", validate_gct,
           ("leftGct", "rightGct", "gctAsymmetry"))
    _check(validated, flags, "strideLength", "stride_unreliable", validate_stride,
           ("leftStride", "rightStride", "strideAsymmetry"))
    _check(validated, flags, "oscillation", "oscillation_unreliable", validate_oscillation)

    # GCT is kept at low frame rates but marked low-confidence: one frame at
    # 30 fps is ~33 ms, a large fraction of a 100–250 ms contact.
    if validated.get("gct") is not None and fps and fps < MIN_REQUIRED_FPS:
        flags.append("gct_low_frame_rate")

    # Asymmetry is the mean of the GCT and stride asymmetries; recompute it
    # from the components that survived validation.
    if "gctAsymmetry" in metrics or "strideAsymmetry" in metrics:
        parts = [
            float(validated[k])
            for k in ("gctAsymmetry", "strideAsymmetry")
            if validated.get(k) is not None
        ]
        if parts:
            asymmetry = round(sum(parts) / len(parts), 1)
            validated["asymmetryIndex"] = asymmetry
            validated["symmetry"] = _symmetry_from_asymmetry(asymmetry)
        else:
            validated["asymmetryIndex"] = None
            validated["symmetry"] = None
            flags.append("symmetry_unreliable")

    if "symmetry_unreliable" not in flags:
        _check(validated, flags, "symmetry", "symmetry_unreliable", validate_symmetry,
               ("asymmetryIndex",))

    return validated, flags
