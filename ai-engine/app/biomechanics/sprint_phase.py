def segment_sprint_phases(duration_sec: float) -> str:
    """
    Classifies the sprint cycle phase depending on the temporal frame timeline.
    Phases: Drive (Acceleration), Transition (Erect positioning), Max Velocity (Terminal maintenance)
    """
    if duration_sec < 2.0:
        return "Acceleration (Drive Phase)"
    elif duration_sec < 5.5:
        return "Transition Phase"
    else:
        return "Max Velocity Maintenance"
