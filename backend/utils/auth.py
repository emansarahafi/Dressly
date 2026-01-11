"""
Authentication utilities: password hashing, JWT tokens, etc.
"""

import os
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

# Password hashing
# Use PBKDF2-SHA256 to avoid native bcrypt backend issues in some environments.
# This provides secure hashing and does not require the optional `bcrypt` package.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def hash_password(password: str) -> str:
    """Hash a password."""
    # bcrypt has a 72-byte input limit. Truncate the UTF-8 bytes to avoid errors
    # while preserving as much of the user's password as possible.
    if password is None:
        password = ""
    encoded = password.encode("utf-8")
    if len(encoded) > 72:
        encoded = encoded[:72]
        # decode with ignore to avoid cutting a multi-byte char in half
        safe_password = encoded.decode("utf-8", "ignore")
    else:
        safe_password = password

    return pwd_context.hash(safe_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    if plain_password is None:
        plain_password = ""
    encoded = plain_password.encode("utf-8")
    if len(encoded) > 72:
        encoded = encoded[:72]
        plain_password = encoded.decode("utf-8", "ignore")

    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
