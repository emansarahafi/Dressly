import { useState, useEffect } from "react";
import { Heart, Trash2, ShoppingBag, Sparkles } from "lucide-react";
import api from "../lib/api";

interface Product {
  code: string;
  name: string;
  price: {
    formattedValue: string;
  };
  images: Array<{ url: string }>;
}

interface WishlistProps {
  onBack: () => void;
}

export default function Wishlist({ onBack }: WishlistProps) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await api.get("/wishlist", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItems(response.data.items || []);
      } else {
        // Load from localStorage for guest users
        const saved = localStorage.getItem("wishlist");
        setItems(saved ? JSON.parse(saved) : []);
      }
    } catch (error) {
      console.error("Failed to load wishlist", error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productCode: string) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await api.delete(`/wishlist/${productCode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        const updated = items.filter(item => item.code !== productCode);
        localStorage.setItem("wishlist", JSON.stringify(updated));
      }
      setItems(items.filter(item => item.code !== productCode));
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-rose-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-rose-500 fill-current" />
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-rose-600 transition-colors font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-6">
              Start adding items you love to keep track of them!
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.code}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={item.images[0]?.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => removeItem(item.code)}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-xl font-bold text-rose-600 mb-3">
                    {item.price.formattedValue}
                  </p>
                  <a
                    href={`https://www2.hm.com/en_us/productpage.${item.code}.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 px-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-center font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    <ShoppingBag className="w-4 h-4 inline mr-2" />
                    Shop Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
