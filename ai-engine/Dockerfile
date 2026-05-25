FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for OpenCV and MediaPipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency configuration file
COPY requirements.txt ./

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code files
COPY . .

EXPOSE 8080

# Set environment variable to allow MediaPipe to coexist with newer Protobuf versions
ENV PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python

# Run FastAPI app
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
