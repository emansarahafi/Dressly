"""
H&M API client using RapidAPI.
Provides functions to fetch product listings from H&M.
"""

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

# Configuration
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "apidojo-hm-hennes-mauritz-v1.p.rapidapi.com")
HM_COUNTRY = os.getenv("HM_COUNTRY", "us")
HM_LANG = os.getenv("HM_LANG", "en")

if not RAPIDAPI_KEY:
    raise RuntimeError("RAPIDAPI_KEY is missing. Add it in backend/.env")

HEADERS = {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": RAPIDAPI_HOST,
    "Accept": "application/json",
}

BASE_URL = f"https://{RAPIDAPI_HOST}"


async def hm_list_products(
    categories: str, 
    page: int = 0, 
    size: int = 30
) -> dict:
    \"\"\"
    Fetch product listings from H&M API.
    
    Args:
        categories: Category ID (e.g., 'men_trousers', 'women_dresses')
        page: Page number for pagination (default: 0)
        size: Number of products per page (default: 30)
        
    Returns:
        Dictionary containing product results and metadata
        
    Raises:
        httpx.HTTPStatusError: If the API request fails
    \"\"\"
    params = {
        "country": HM_COUNTRY,
        "lang": HM_LANG,
        "page": page,
        "pageSize": size,
        "categoryId": categories,
        "sort": "RELEVANCE",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            f"{BASE_URL}/products/v2/list", 
            headers=HEADERS, 
            params=params
        )
        response.raise_for_status()
        return response.json()
