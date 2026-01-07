import { useState } from "react";
import { Sparkles, ShoppingBag, Heart, Share2, ArrowLeft } from "lucide-react";

interface Product {
  code: string;
  name: string;
  price: {
    formattedValue: string;
    currencyIso: string;
  };
  images: Array<{ url: string }>;
  articleCodes?: string[];
}

interface ResultsProps {
  recommendation: string;
  products: Product[];
  onBack: () => void;
  onSaveToWishlist?: (product: Product) => void;
}

export default function Results({ recommendation, products, onBack, onSaveToWishlist }: ResultsProps) {
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());

  const handleSave = (product: Product) => {
    setSavedItems(prev => new Set(prev).add(product.code));
    onSaveToWishlist?.(product);
  };

  const parseRecommendation = (text: string) => {
    const sections = text.split('\n\n');
    return sections.map((section, idx) => ({
      id: idx,
      content: section.trim()
    }));
  };

  const sections = parseRecommendation(recommendation);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Quiz</span>
          </button>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-500">
            Dressly
          </h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* AI Recommendations Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-amber-500" />
            <h2 className="text-3xl font-bold text-gray-900">Your Personal Style Guide</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            {sections.map((section) => (
              <div key={section.id} className="prose prose-rose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Products Section */}
        {products && products.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="w-8 h-8 text-rose-500" />
              <h2 className="text-3xl font-bold text-gray-900">Recommended Products</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.code}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <img
                      src={product.images[0]?.url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleSave(product)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                          savedItems.has(product.code)
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/90 text-gray-700 hover:bg-rose-500 hover:text-white'
                        }`}
                        title="Save to Wishlist"
                      >
                        <Heart className={`w-5 h-5 ${savedItems.has(product.code) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-rose-500 transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold text-rose-600 mb-3">
                      {product.price.formattedValue}
                    </p>
                    <a
                      href={`https://www2.hm.com/en_us/productpage.${product.code}.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 px-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-center font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      Shop Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!products || products.length === 0) && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Products Coming Soon
            </h3>
            <p className="text-gray-600">
              We're curating the perfect products based on your style preferences.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
