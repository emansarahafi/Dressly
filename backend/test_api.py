"""
Test script for H&M API integration.
Run with: python test_api.py
"""

import asyncio
from hm_client import hm_list_products


async def test_hm_api():
    """Test H&M API connectivity and product fetching."""
    print("🧪 Testing H&M API...\n")
    
    try:
        # Test 1: Fetch men's trousers
        print("1️⃣ Fetching men's trousers...")
        result = await hm_list_products("men_trousers", page=0, size=5)
        
        products = result.get('results', [])
        print(f"✅ Found {len(products)} products")
        
        # Display first product
        if products:
            product = products[0]
            print(f"\n📦 First product:")
            print(f"  Name: {product.get('name')}")
            print(f"  Price: {product.get('price', {}).get('formattedValue')}")
            print(f"  Code: {product.get('code')}")
            image_url = product.get('images', [{}])[0].get('url', 'N/A')
            print(f"  Image: {image_url[:80]}...")
        
        # Test 2: Different category
        print("\n2️⃣ Fetching men's shirts...")
        result2 = await hm_list_products("men_shirts", page=0, size=3)
        print(f"✅ Found {len(result2.get('results', []))} products")
        
        print("\n🎉 All tests passed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(test_hm_api())