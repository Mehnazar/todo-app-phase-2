"""Authentication routes for user registration and login"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timezone
from src.db import get_session
from src.models import User
from src.utils.auth_utils import hash_password, verify_password, create_access_token, generate_user_id

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


# Request/Response Models
class RegisterRequest(BaseModel):
    """User registration request"""
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    name: str = Field(min_length=1, max_length=255)


class LoginRequest(BaseModel):
    """User login request"""
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Authentication response with user info and token"""
    user: dict
    token: str


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_session)
) -> AuthResponse:
    """
    Register a new user account.

    Args:
        request: Registration data (email, password, name)
        db: Database session

    Returns:
        User object and JWT token

    Raises:
        HTTPException: 400 if email already exists
    """
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "AUTH_EMAIL_EXISTS",
                    "message": "An account with this email already exists",
                    "details": {"email": request.email},
                    "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                }
            }
        )

    # Generate user ID
    user_id = generate_user_id()

    # Hash password
    hashed_password = hash_password(request.password)

    # Create user
    user = User(
        id=user_id,
        email=request.email,
        name=request.name,
        password_hash=hashed_password
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Generate JWT token
    token = create_access_token(user.id)

    # Return user data (without password hash)
    return AuthResponse(
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "created_at": user.created_at.isoformat().replace('+00:00', 'Z')
        },
        token=token
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_session)
) -> AuthResponse:
    """
    Login with email and password.

    Args:
        request: Login credentials (email, password)
        db: Database session

    Returns:
        User object and JWT token

    Raises:
        HTTPException: 401 if credentials are invalid
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    user = result.scalar_one_or_none()

    # Verify user exists and password is correct
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "AUTH_INVALID_CREDENTIALS",
                    "message": "Invalid email or password",
                    "details": {},
                    "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                }
            }
        )

    # Generate JWT token
    token = create_access_token(user.id)

    # Return user data (without password hash)
    return AuthResponse(
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "created_at": user.created_at.isoformat().replace('+00:00', 'Z')
        },
        token=token
    )
