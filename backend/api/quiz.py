from fastapi import APIRouter
from models.quiz import QuizInput
from services.ai_model import generate_style
from services.hm_client import hm_list_products

router = APIRouter()


@router.post("/submit")
async def submit_quiz(data: QuizInput):
    """Submit quiz answers and get AI-generated style recommendations with products."""
    print("\n📋 QUIZ RECEIVED:")
    print(data, "\n")

    # Generate AI recommendations and product categories
    ai_result = await generate_style(data.model_dump())
    
    # Fetch products from H&M based on AI-suggested categories
    all_products = []
    for category in ai_result['categories']:
        try:
            products_data = await hm_list_products(category, page=0, size=8)
            products = products_data.get('results', [])
            all_products.extend(products)
        except Exception as e:
            print(f"⚠️ Failed to fetch products for {category}: {e}")
    
    # Limit to 12 total products
    all_products = all_products[:12]

    return {
        "status": "success",
        "input": data,
        "recommendation": ai_result['text'],
        "products": all_products,
        "categories_searched": ai_result['categories']
    }

