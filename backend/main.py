"""
Dressly Backend API - FastAPI application for AI-powered personal styling.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from api.quiz import router as quiz_router
from api.auth import router as auth_router
from api.wishlist import router as wishlist_router

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Dressly API",
    description="AI-powered personal styling assistant",
    version="2.0.0"
)

# Configure CORS
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(wishlist_router, prefix="/wishlist", tags=["Wishlist"])
app.include_router(quiz_router, prefix="/quiz", tags=["Quiz"])


@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "h2.0.0",
        "features": [
            "AI Style Recommendations",
            "H&M Product Integration",
            "User Authentication",
            "Wishlist Management"
        ],
        "message": "Dressly API is running",
        "version": "1.0.0"
    }
