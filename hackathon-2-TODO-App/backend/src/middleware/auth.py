"""JWT Authentication Middleware"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import os
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

security = HTTPBearer()
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Extract and validate user_id from JWT token.

    Args:
        credentials: HTTP Bearer token from Authorization header

    Returns:
        user_id: The authenticated user's ID

    Raises:
        HTTPException: 401 if token is invalid or expired
    """
    if not SECRET_KEY:
        raise RuntimeError("BETTER_AUTH_SECRET environment variable is required")

    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": {
                        "code": "AUTH_TOKEN_INVALID",
                        "message": "Invalid authentication token",
                        "details": {},
                        "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                    }
                }
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "AUTH_TOKEN_INVALID",
                    "message": "Invalid or expired authentication token",
                    "details": {},
                    "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                }
            }
        )
