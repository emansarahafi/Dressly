"""
Pydantic models for quiz input validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class Height(BaseModel):
    """User height in feet and inches."""
    ft: int = Field(..., ge=3, le=8, description="Height in feet")
    in_: int | None = Field(None, ge=0, le=11, description="Height in inches")


class Sizes(BaseModel):
    """User clothing sizes."""
    tops: str = Field(..., min_length=1, description="Top size (e.g., S, M, L, XL)")
    bottoms: str = Field(..., min_length=1, description="Bottom size (e.g., 28, 30, 32)")


class Budget(BaseModel):
    """Price range per item in user's preferred currency."""
    min: float = Field(..., ge=0, description="Minimum price")
    max: float = Field(..., gt=0, description="Maximum price")


class QuizInput(BaseModel):
    """Complete quiz input from the user."""
    occasion: List[str] = Field(..., min_length=1, description="Shopping occasions")
    style_vibe: List[str] = Field(..., min_length=1, description="Style preferences")
    colors_like: Optional[List[str]] = Field(None, description="Preferred colors")
    height: Optional[Height] = None
    sizes: Sizes
    budget: Budget
