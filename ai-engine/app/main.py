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
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001"
    ],
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
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
