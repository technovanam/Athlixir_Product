import os

# Fast-path limits — analysis window and frame size trade accuracy for speed
# on small instances. Override per deployment via environment variables.

MAX_ANALYSIS_SECONDS = float(os.environ.get("MAX_ANALYSIS_SECONDS", "5"))
MAX_FRAME_WIDTH = 640
DOWNLOAD_CHUNK_SIZE = 65536

# Stabilization & Debug Engine — raw landmark dumps to outputs/debug/ are
# opt-in; they are large and contain per-frame body tracking data.
DEBUG_MODE = os.environ.get("ATHLIXIR_DEBUG_DUMPS", "").lower() in ("1", "true", "yes")
MIN_REQUIRED_FPS = 60
TARGET_FPS = 120
