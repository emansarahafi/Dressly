import google.generativeai as genai
from google.api_core import exceptions as gcloud_exceptions
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is missing. Add it in backend/.env")

genai.configure(api_key=api_key)

async def generate_style(data: dict) -> dict:
    """
    Generate personalized style recommendations using Google's Gemini AI.
    Returns both text recommendations and product search terms.
    
    Args:
        data: Quiz input data containing user preferences
        
    Returns:
        Dictionary with 'text' (recommendations) and 'categories' (product search terms)
    """
    prompt = f"""
    You are a professional fashion stylist.

    Here are the user's quiz answers:
    {data}

    Based on this, generate:
    1. A complete outfit suggestion for their occasion
    2. 3 personalized styling tips
    3. A color palette recommendation
    4. Clothing items to avoid
    
    Then, list 3-5 specific H&M product categories to search for (like "men_trousers", "women_dresses", "men_shirts", "women_tops", etc.)
    
    Format your response as:
    RECOMMENDATIONS:
    [Your style recommendations here]
    
    CATEGORIES:
    category1, category2, category3
    
    Make it short & practical.
    """

    try:
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        response = model.generate_content(prompt)
        text = response.text

        # Parse categories from response
        categories = []
        if "CATEGORIES:" in text:
            parts = text.split("CATEGORIES:")
            recommendations = parts[0].replace("RECOMMENDATIONS:", "").strip()
            categories_text = parts[1].strip()
            categories = [cat.strip() for cat in categories_text.split(",")]
        else:
            recommendations = text
            # Default categories based on occasion
            occasions = data.get('occasion', [])
            if 'Work' in occasions or 'Formal' in occasions:
                categories = ['men_blazerssuits', 'women_blazerssuits', 'men_trousers']
            elif 'Casual' in occasions:
                categories = ['men_jeans', 'women_jeans', 'men_tshirtstanks']
            else:
                categories = ['men_clothing', 'women_clothing']

        return {
            "text": recommendations,
            "categories": categories[:3]  # Limit to 3 categories
        }
    except gcloud_exceptions.NotFound as e:
        # Model not found for this API version — provide a safe deterministic fallback
        print(f"⚠️ Gemini model not available: {e}. Returning fallback recommendations.")
        occasions = data.get('occasion', [])
        if 'Work' in occasions or 'Formal' in occasions:
            categories = ['women_blazerssuits', 'men_blazerssuits', 'men_trousers']
            recommendations = "Classic tailored outfit: blazer, crisp shirt, and tailored trousers. Colors: neutrals with a pop of color. Avoid overly casual items."
        elif 'Casual' in occasions:
            categories = ['women_jeans', 'men_jeans', 'women_tops']
            recommendations = "Casual outfit: well-fitted jeans, comfortable top, and layered outerwear. Colors: denim and earth tones. Avoid formal fabrics."
        else:
            categories = ['women_clothing', 'men_clothing', 'women_tops']
            recommendations = "Versatile outfit suggestion: mix basics with one statement piece. Stick to a coherent color palette and consider proportion."

        return {
            "text": recommendations,
            "categories": categories[:3]
        }
    except Exception as e:
        print(f"❌ AI generation error: {e}")
        raise
