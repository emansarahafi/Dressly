# 👗 Dressly - AI-Powered Personal Stylist

Dressly is a modern web application that uses artificial intelligence to act as your virtual personal stylist. It helps you discover and build outfits that match your unique style, body type, color preferences, and budget.

## ✨ Features

- **🎯 AI-Powered Style Quiz** - Answer 6 quick questions about your style preferences
- **🤖 Personalized Recommendations** - Get AI-generated outfit suggestions and styling tips using Google Gemini
- **🛍️ Product Integration** - Browse real H&M products matching your style (up to 12 curated items)
- **🔐 User Authentication** - Sign up/login with JWT authentication to save preferences
- **❤️ Wishlist** - Save your favorite products for later shopping
- **📱 Responsive Design** - Works beautifully on desktop, tablet, and mobile
- **🎨 Modern UI** - Clean interface built with React 19 + TypeScript + TailwindCSS
- **💾 Data Persistence** - All data stored securely in MongoDB

## Tech Stack

### Frontend

- React 19 + TypeScript
- Vite
- TailwindCSS
- Axios

### Backend

- FastAPI (Python)
- MongoDB
- Google Gemini AI
- H&M API (RapidAPI)

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB account

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file (use `.env.example` as template):

   ```bash
   cp .env.example .env
   ```

5. Fill in your environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `GEMINI_API_KEY`: Google Gemini API key
   - `RAPIDAPI_KEY`: RapidAPI key for H&M integration

6. Run the server:

   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd front-end
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 📂 Project Structure

```text
Dressly/
├── backend/
│   ├── api/                 # HTTP route handlers
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── quiz.py          # Quiz & recommendations
│   │   └── wishlist.py      # Wishlist management
│   ├── models/              # Data models
│   │   ├── quiz.py          # Quiz input models (Pydantic)
│   │   └── database.py      # Database models (MongoDB)
│   ├── services/            # Business logic & integrations
│   │   ├── ai_model.py      # Google Gemini AI
│   │   ├── database.py      # MongoDB connection
│   │   └── hm_client.py     # H&M API client
│   ├── utils/               # Utilities
│   │   └── auth.py          # JWT & password hashing
│   ├── main.py              # FastAPI app entry point
│   └── requirements.txt     # Python dependencies
└── front-end/
    ├── src/
    │   ├── components/
    │   │   ├── Login.tsx    # Login/Signup page
    │   │   ├── QuizForm.tsx # 6-step quiz interface
    │   │   ├── Results.tsx  # AI recommendations & products
    │   │   └── Wishlist.tsx # Saved products page
    │   ├── lib/
    │   │   ├── api.ts       # Axios API client
    │   │   └── quizSteps.tsx # Quiz configuration
    │   └── App.tsx          # Main app with routing
    └── package.json
```

## 🔌 API Endpoints

Note: Backend routers are mounted with prefixes in `backend/main.py`:

- Authentication routes are available under `/auth`
- Quiz routes are available under `/quiz`
- Wishlist routes are available under `/wishlist`

### Authentication

- `POST /auth/signup` - Create a new user account
- `POST /auth/login` - Authenticate user and get JWT token
- `GET /auth/me` - Get current user profile (requires auth)

### Quiz & Recommendations

- `POST /quiz/submit` - Submit quiz answers, receive AI recommendations and product suggestions

### Wishlist

- `POST /wishlist` - Add product to authenticated user's wishlist (body: product details)
- `GET /wishlist` - Get authenticated user's saved products
- `DELETE /wishlist/{product_code}` - Remove item from authenticated user's wishlist

### Health

- `GET /` - API health check and version info

## 🔒 Security Notes

⚠️ **Important**: Never commit your `.env` file to version control. It contains sensitive credentials.

## License

[MIT](LICENSE)
