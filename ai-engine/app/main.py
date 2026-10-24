import os

from app.env import get_internal_secret, load_env_file

# Must run before importing modules that read os.environ at import time.
load_env_file()

import re

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from app.api.analyze import router as analyze_router
from app.api.security import check_internal_secret

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

if not get_internal_secret():
    print(
        "[SECURITY] INTERNAL_API_SECRET is not set — internal endpoints will "
        "reject all requests and callbacks to the backend will fail."
    )

# Ensure outputs directory exists at runtime
os.makedirs("outputs", exist_ok=True)

_OVERLAY_NAME = re.compile(r"^[A-Za-z0-9-]{1,64}_overlay\.mp4$")


# Overlays are only kept here when the Firebase upload failed; the backend
# proxies them to the owning user. Internal-auth only — this used to be a
# public static mount that also exposed outputs/debug/ landmark dumps.
@app.get("/outputs/{name}", dependencies=[Depends(check_internal_secret)])
def get_overlay(name: str):
    if not _OVERLAY_NAME.match(name):
        raise HTTPException(status_code=404, detail="Not found")
    path = os.path.join("outputs", name)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(path, media_type="video/mp4")

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
