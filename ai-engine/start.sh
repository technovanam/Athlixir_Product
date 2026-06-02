#!/bin/bash

# Start the Redis worker in the background
python -m app.worker &

# Start the FastAPI server in the foreground
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
