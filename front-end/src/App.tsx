import { Sparkles, Heart, User, LogOut } from 'lucide-react'
import QuizForm from "./components/QuizForm"
import Results from "./components/Results"
import Login from "./components/Login"
import Wishlist from "./components/Wishlist"
import { useState, useEffect } from "react"
import { useToast } from "./hooks/useToast"
import api from "./lib/api"

interface RecommendationData {
  recommendation: string;
  products: any[];
}

function App() {
  const [view, setView] = useState("")
  const [user, setUser] = useState<any>(null)
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null)
  const { showToast, ToastContainer } = useToast();
  
  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleStartQuiz = () => {
    setView('quiz');
  }
  
  const handleQuizComplete = (result: RecommendationData) => {
    setRecommendation(result);
    setView('results');
  }

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setView('');
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setView('');
  }

  const handleSaveToWishlist = async (product: any) => {
    if (!user) {
      // Fallback to localStorage for guests
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      if (!wishlist.find((p: any) => p.code === product.code)) {
        wishlist.push(product);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        showToast("Added to wishlist!", "success");
      } else {
        showToast("Already in wishlist", "info");
      }
      return;
    }

    // Save to backend for authenticated users
    try {
      await api.post("/wishlist/add", {
        code: product.code,
        name: product.name,
        price: product.price?.formattedValue || "N/A",
        image_url: product.images?.[0]?.url || "",
        link_url: `https://www2.hm.com/en_us/productpage.${product.code}.html`,
      });
      showToast("Added to wishlist!", "success");
    } catch (error: any) {
      if (error.response?.status === 400) {
        showToast("Already in wishlist", "info");
      } else {
        showToast("Failed to add to wishlist", "error");
      }
    }
  }

  // Route to different views
  if (view === 'login') {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} onSkip={() => setView('')} />
        <ToastContainer />
      </>
    );
  }

  if (view === 'quiz') {
    return (
      <>
        <QuizForm 
          onComplete={handleQuizComplete}
          onError={(msg) => showToast(msg, "error")}
        />
        <ToastContainer />
      </>
    );
  }

  if (view === 'results' && recommendation) {
    return (
      <>
        <Results
          recommendation={recommendation.recommendation}
          products={recommendation.products}
          onBack={() => setView('')}
          onSaveToWishlist={handleSaveToWishlist}
        />
        <ToastContainer />
      </>
    );
  }

  if (view === 'wishlist') {
    return (
      <>
        <Wishlist onBack={() => setView('')} />
        <ToastContainer />
      </>
    );
  }

  // Home page
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-lavender-100 flex items-center justify-center">
      <ToastContainer />
      {/* Header Navigation */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
        <button
          onClick={() => setView('wishlist')}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:text-rose-600 transition-colors shadow-md"
        >
          <Heart className="w-5 h-5" />
          <span className="font-medium">Wishlist</span>
        </button>
        
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <User className="w-5 h-5 text-rose-600" />
              <span className="font-medium text-gray-700">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:text-rose-600 transition-colors shadow-md"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setView('login')}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:text-rose-600 transition-colors shadow-md"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Login</span>
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl w-full text-center space-y-8 py-12 px-4">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full text-rose-600 text-base font-semibold shadow-lg mb-6 border border-rose-200">
            <span>AI-Powered Personal Styling</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-500 to-orange-400 tracking-tight drop-shadow-sm">
              Dressly
            </h1>

            <div className="flex items-center justify-center gap-3 text-2xl md:text-3xl font-bold text-gray-800">
              <span>Your AI Stylist Awaits</span>
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
            Discover perfectly curated outfits that match your unique style, body type, and budget.
            <span className="text-rose-600"> Let AI transform your wardrobe.</span>
          </p>
        </div>

        <div className="space-y-6 pt-8">
          <button
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            onClick={handleStartQuiz}
          >
            <span>Start Your Style Quiz</span>
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>

          <p className="text-sm text-gray-500">Takes only 2 minutes</p>
        </div>
      </div>
    </div>
  );
}

export default App
