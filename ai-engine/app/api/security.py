import os
from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader

API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=False)

INTERNAL_API_SECRET = os.environ.get("INTERNAL_API_SECRET")

async def check_internal_secret(api_key: str = Security(API_KEY_HEADER)):
    if not INTERNAL_API_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal API secret is not configured on the server.",
        )
    if not api_key or api_key != f"Bearer {INTERNAL_API_SECRET}":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing secret token.",
        )
