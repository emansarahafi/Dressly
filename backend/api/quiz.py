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
    print("\n🔎 AI result dump:", ai_result)
    
    # Fetch products from H&M using generic "ladies/shop-by-product/view-all" category
    # This ensures we always get products regardless of AI-generated category names
    all_products = []
    
    # Try multiple category formats to find one that works
    categories_to_try = [
        "ladies_all",  # Simplified format
        "ladies/shop-by-product/view-all",  # Full path format
        "ladies",  # Minimal format
    ]
    
    category = categories_to_try[0]  # Start with first one
    print(f"Fetching products from category: {category}")
    
    try:
        products_data = await hm_list_products(category, page=1, size=30)
        print(f"Products API response: keys={list(products_data.keys()) if isinstance(products_data, dict) else type(products_data)}")        
        # Check for error response
        if isinstance(products_data, dict) and 'error' in products_data:
            print(f"❌ API Error: {products_data.get('message', 'Unknown error')}")
            print(f"Full error response: {products_data}")
        # H&M RapidAPI returns products nested in plpList.productList structure
        raw_list = []
        if isinstance(products_data, dict):
            # The API returns: { plpList: { productList: [...products...], sortOptions: {...}, ... } }
            if 'plpList' in products_data:
                plp_data = products_data['plpList']
                print(f"plpList type: {type(plp_data)}")
                
                # plpList is an object containing productList array
                if isinstance(plp_data, dict):
                    print(f"plpList keys: {list(plp_data.keys())}")
                    if 'productList' in plp_data:
                        raw_list = plp_data['productList']
                        print(f"Extracted {len(raw_list)} products from plpList.productList")
                        
                        # Check numberOfHits to see if API has products available
                        if 'numberOfHits' in plp_data:
                            print(f"numberOfHits: {plp_data['numberOfHits']}")
                    else:
                        print(f"Warning: plpList doesn't contain productList key")
                else:
                    print(f"Warning: plpList is not a dict")
            
            # Fallback: check for productList at root level
            elif 'productList' in products_data:
                raw_list = products_data['productList']
                print(f"Extracted {len(raw_list)} products from root productList")
            
            # Fallback: check for results array
            elif 'results' in products_data:
                raw_list = products_data['results']
                print(f"Extracted {len(raw_list)} products from results")
        
        # Normalize items to the shape expected by the frontend
        normalized = []
        skipped_count = 0
        for item in (raw_list or []):
            try:
                # Check if item is a string (likely product ID/code) instead of a dict
                if isinstance(item, str):
                    print(f"Item is a string: {item}")
                    # Treat the string as the product code
                    code = item
                    # We'll need to construct a minimal product object
                    normalized.append({
                        'code': code,
                        'name': f'Product {code}',
                        'price': {'formattedValue': 'See H&M', 'currencyIso': 'USD'},
                        'images': [{'url': f'https://image.hm.com/assets/hm/productpage/{code}.jpg'}],
                    })
                    continue
                
                # Common H&M fields: 'articleCode' or 'productCode'
                code = str(item.get('articleCode') or item.get('productCode') or item.get('code') or item.get('id') or '')

                # Name fields may vary
                name = item.get('productName') or item.get('name') or item.get('articleName') or ''

                # Price may be in 'prices' array, 'price' object, or 'articlePrice'
                price_obj = {}
                if isinstance(item.get('prices'), list) and item.get('prices'):
                    # H&M API returns prices as array - use first price
                    first_price = item['prices'][0]
                    price_obj = {
                        'formattedValue': first_price.get('formattedPrice', ''),
                        'currencyIso': 'USD'
                    }
                elif isinstance(item.get('price'), dict):
                    price_obj = {
                        'formattedValue': item['price'].get('formattedValue') or item['price'].get('formatted') or '',
                        'currencyIso': item['price'].get('currency') or item['price'].get('currencyIso') or ''
                    }
                elif isinstance(item.get('articlePrice'), dict):
                    price_obj = {
                        'formattedValue': item['articlePrice'].get('formatted') or '',
                        'currencyIso': item['articlePrice'].get('currency') or ''
                    }
                else:
                    # Fallbacks
                    price_obj = {'formattedValue': item.get('price', '') or item.get('formattedPrice', ''), 'currencyIso': ''}

                # Images: try several possible keys
                images = []
                # H&M API has productImage as main image
                if item.get('productImage'):
                    images.append({'url': item['productImage']})
                
                # Also check images array
                if isinstance(item.get('images'), list) and item.get('images'):
                    for img in item['images']:
                        if isinstance(img, dict):
                            url = img.get('url') or img.get('imageUrl') or img.get('src')
                            if url and not any(i['url'] == url for i in images):
                                images.append({'url': url})
                
                # Fallbacks for other structures
                if not images:
                    if item.get('image'):
                        images = [{'url': item['image']}]
                    elif item.get('mainImage'):
                        images = [{'url': item['mainImage']}]
                    elif isinstance(item.get('plpImage'), dict):
                        url = item['plpImage'].get('url') or item['plpImage'].get('src')
                        if url:
                            images.append({'url': url})

                if not code:
                    skipped_count += 1
                    print(f"Skipping item (no code): {list(item.keys())[:5] if isinstance(item, dict) else type(item)}")
                    continue

                normalized.append({
                    'code': code,
                    'name': name,
                    'price': price_obj,
                    'images': images or [{'url': ''}],
                    'raw': item,
                })
            except Exception as e:
                skipped_count += 1
                print(f"Exception normalizing item: {e}")
                continue

        print(f"Normalized {len(normalized)} products, skipped {skipped_count}")
        all_products.extend(normalized)
    except Exception as e:
        print(f"⚠️ Failed to fetch products: {e}")

    print(f"Total products found: {len(all_products)}")
    
    # Limit to 12 total products
    all_products = all_products[:12]

    return {
        "status": "success",
        "input": data,
        "recommendation": ai_result['text'],
        "products": all_products,
        "categories_searched": ai_result['categories']
    }

