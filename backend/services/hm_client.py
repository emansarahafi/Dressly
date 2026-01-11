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
    page: int = 1,  # RapidAPI uses 1-indexed pages
    size: int = 30
) -> dict:
    """
    Fetch product listings from H&M API.
    
    Args:
        categories: Category ID (e.g., 'men_trousers', 'women_dresses')
        page: Page number for pagination (default: 0)
        size: Number of products per page (default: 30)
        
    Returns:
        Dictionary containing product results and metadata
        
    Raises:
        httpx.HTTPStatusError: If the API request fails
    """
    params = {
        "country": HM_COUNTRY,
        "lang": HM_LANG,
        "currentPage": page,
        "pageSize": size,
        "categoryId": categories,  # API requires 'categoryId'
    }

    url = f"{BASE_URL}/products/v2/list"
    print(f"Calling H&M API: {url}")
    print(f"Parameters: {params}")

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(url, headers=HEADERS, params=params)
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            # Print response body for debugging
            text = None
            try:
                text = response.text
            except Exception:
                text = '<unreadable response body>'
            print(f"H&M API error {response.status_code} for category={categories}: {text}")
            raise

        data = response.json()
        print(f"H&M API OK: returned keys={list(data.keys()) if isinstance(data, dict) else type(data)}")
        return data
