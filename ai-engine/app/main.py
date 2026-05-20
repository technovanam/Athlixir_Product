import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.analyze import router as analyze_router

app = FastAPI(
    title="ATHLIXIR Biomechanics AI Engine",
    description="Proprietary athlete biomechanics intelligence platform",
    version="1.0.0"
)

# Configure CORS for communication with local server and client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure outputs directory exists at runtime
os.makedirs("outputs", exist_ok=True)

# Mount outputs folder to serve media static content
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Register endpoints
app.include_router(analyze_router, prefix="/api")

@app.get("/health")
def health_check():

    return {"status": "healthy", "service": "athlixir-ai-engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
