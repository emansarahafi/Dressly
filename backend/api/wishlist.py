"""
Wishlist routes: save, retrieve, remove items.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.database import client
from api.auth import get_current_user
from typing import List

router = APIRouter()

# Database collections
db = client["dressly"]
wishlist_collection = db["wishlist"]


class WishlistItemRequest(BaseModel):
    """Request model for adding to wishlist."""
    code: str
    name: str
    price: dict
    images: List[dict]


@router.post("")
async def add_to_wishlist(item: WishlistItemRequest, user = Depends(get_current_user)):
    """Add a product to user's wishlist."""
    user_id = str(user["_id"])
    
    # Check if already in wishlist
    existing = wishlist_collection.find_one({
        "user_id": user_id,
        "product_code": item.code
    })
    
    if existing:
        return {"message": "Item already in wishlist"}
    
    # Add to wishlist
    wishlist_item = {
        "user_id": user_id,
        "product_code": item.code,
        "product_name": item.name,
        "product_price": item.price.get('formattedValue', ''),
        "product_image": item.images[0].get('url', '') if item.images else '',
    }
    
    wishlist_collection.insert_one(wishlist_item)
    
    return {"message": "Item added to wishlist"}


@router.get("")
async def get_wishlist(user = Depends(get_current_user)):
    """Get user's wishlist."""
    user_id = str(user["_id"])
    
    items = list(wishlist_collection.find({"user_id": user_id}))
    
    # Convert to product format
    products = []
    for item in items:
        products.append({
            "code": item["product_code"],
            "name": item["product_name"],
            "price": {"formattedValue": item["product_price"]},
            "images": [{"url": item["product_image"]}]
        })
    
    return {"items": products}


@router.delete("/{product_code}")
async def remove_from_wishlist(product_code: str, user = Depends(get_current_user)):
    """Remove a product from user's wishlist."""
    user_id = str(user["_id"])
    
    result = wishlist_collection.delete_one({
        "user_id": user_id,
        "product_code": product_code
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")
    
    return {"message": "Item removed from wishlist"}
