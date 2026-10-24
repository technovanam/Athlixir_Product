import hmac

from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader

from app.env import get_internal_secret

API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=False)


async def check_internal_secret(api_key: str = Security(API_KEY_HEADER)):
    secret = get_internal_secret()
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal API secret is not configured on the server.",
        )
    if not api_key or not hmac.compare_digest(api_key, f"Bearer {secret}"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing secret token.",
        )
