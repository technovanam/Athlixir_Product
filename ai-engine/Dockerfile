FROM python:3.10-slim

WORKDIR /app

# Prevent Python from writing bytecode (.pyc) and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python \
    UV_HTTP_TIMEOUT=300 \
    UV_CONCURRENT_DOWNLOADS=2

# Install only minimal runtime system libraries for OpenCV & MediaPipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy uv installer for fast parallel installation
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency definition
COPY requirements.txt ./

# Install dependencies with BuildKit cache mount and clean up caches
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system -r requirements.txt && \
    find /usr/local/lib/python3.10/site-packages -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true && \
    rm -rf /tmp/* /bin/uv

# Copy source code files
COPY . .

EXPOSE 8000

# Start FastAPI application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
