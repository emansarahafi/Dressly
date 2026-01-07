"""
Authentication routes: signup, login, profile.
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from services.database import client
from utils.auth import hash_password, verify_password, create_access_token, decode_token
from typing import Optional

router = APIRouter()

# Database collections
db = client["dressly"]
users_collection = db["users"]


class SignupRequest(BaseModel):
    """Request model for user signup."""
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    """Request model for user login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Response model for user data."""
    id: str
    name: str
    email: str


async def get_current_user(authorization: Optional[str] = Header(None)):
    """Dependency to get current user from JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("sub")
    user = users_collection.find_one({"_id": user_id})
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


@router.post("/signup")
async def signup(request: SignupRequest):
    """Register a new user."""
    # Check if user already exists
    existing_user = users_collection.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_data = {
        "name": request.name,
        "email": request.email,
        "password_hash": hash_password(request.password),
    }
    
    result = users_collection.insert_one(user_data)
    user_id = str(result.inserted_id)
    
    # Create access token
    token = create_access_token({"sub": user_id})
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": request.name,
            "email": request.email
        }
    }


@router.post("/login")
async def login(request: LoginRequest):
    """Authenticate a user."""
    # Find user
    user = users_collection.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = str(user["_id"])
    
    # Create access token
    token = create_access_token({"sub": user_id})
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"]
        }
    }


@router.get("/me")
async def get_profile(user = Depends(get_current_user)):
    """Get current user profile."""
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"]
    }
