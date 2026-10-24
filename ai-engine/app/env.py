"""
Minimal .env loader for local development.

Reads KEY=VALUE pairs from ai-engine/.env into os.environ without overriding
variables that are already set (deployed environments such as Render inject
their own values, which always win).
"""

import os
from pathlib import Path

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


def load_env_file(path: Path = _ENV_FILE) -> None:
    if not path.is_file():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        if key.startswith("export "):
            key = key[len("export "):].strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
            value = value[1:-1]
        if key and key not in os.environ:
            os.environ[key] = value


def get_internal_secret() -> str:
    """Shared server<->engine secret. Empty string means not configured."""
    return os.environ.get("INTERNAL_API_SECRET", "").strip()
