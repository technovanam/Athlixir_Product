import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.analyze import router as analyze_router

PRODUCTION_BACKEND_URL = "https://backend-n0z5.onrender.com"
PRODUCTION_AI_ENGINE_URL = "https://ai-engine-4dn5.onrender.com"
VERCEL_ORIGIN_PATTERN = r"^https://[\w-]+\.vercel\.app$"

PRODUCTION_FRONTEND_ORIGINS = {
    "https://athlixir-product.vercel.app",
    "https://athlixir.vercel.app",
    "https://www.athlixirsports.com",
    "https://athlixirsports.com",
    "https://www.athlixirsports.in",
    "https://athlixirsports.in",
}

def _allowed_origins() -> list[str]:
    origins = {
        "http://localhost:3000",
        "http://localhost:3001",
        PRODUCTION_BACKEND_URL,
        PRODUCTION_AI_ENGINE_URL,
        *PRODUCTION_FRONTEND_ORIGINS,
    }

    extra = os.environ.get("CORS_ORIGINS", "")
    for origin in extra.split(","):
        origin = origin.strip()
        if origin:
            origins.add(origin)

    return sorted(origins)

app = FastAPI(
    title="ATHLIXIR Biomechanics AI Engine",
    description="Proprietary athlete biomechanics intelligence platform",
    version="1.0.0"
)

# Configure CORS for communication with server, client, and Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=VERCEL_ORIGIN_PATTERN,
    allow_origins=_allowed_origins(),
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
