"""
backend/auth_router.py
───────────────────────
FastAPI router exposing:
  POST /api/auth/register  → create account
  POST /api/auth/login     → get JWT token
  GET  /api/auth/me        → get current user info
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, field_validator
import re

from Auth.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    db_create_user,
    db_get_user_by_email,
    db_get_user_by_id,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
bearer = HTTPBearer()


# ── Request / Response models ─────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email:    EmailStr
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters.")
        if len(v) > 30:
            raise ValueError("Username must be 30 characters or fewer.")
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError("Username may only contain letters, numbers, _ and -.")
        return v

    @field_validator("password")
    @classmethod
    def password_strong(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user: dict


# ── Dependency: extract & verify JWT from Authorization header ─────────────────
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    user = db_get_user_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists.")
    return user


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.post("/register", response_model=AuthResponse, status_code=201)
def register(req: RegisterRequest):
    """Create a new account and return a JWT token immediately."""
    try:
        user = db_create_user(
            email=req.email,
            username=req.username,
            hashed_pw=hash_password(req.password),
        )
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

    token = create_access_token(user["id"], user["email"])
    # Remove sensitive fields before returning
    safe_user = {k: v for k, v in user.items() if k != "hashed_pw"}
    return AuthResponse(access_token=token, user=safe_user)


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    """Verify credentials and return a JWT token."""
    user = db_get_user_by_email(req.email)
    if not user or not verify_password(req.password, user["hashed_pw"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token(user["id"], user["email"])
    safe_user = {k: v for k, v in user.items() if k != "hashed_pw"}
    return AuthResponse(access_token=token, user=safe_user)


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user