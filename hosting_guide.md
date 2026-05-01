# Hosting Guide for Investora

To host **Investora**, you need to deploy two separate parts: the **Python Backend** and the **Next.js Frontend**.

## Phase 1: Deploying the Backend (Render.com)
Render is excellent for hosting FastAPI/Python applications.

1.  **Create a Render Account**: Sign up at [render.com](https://render.com).
2.  **New Web Service**: Click **New +** > **Web Service**.
3.  **Connect GitHub**: Connect your `Investora` repository.
4.  **Configure Settings**:
    *   **Name**: `investora-api`
    *   **Root Directory**: `backend`
    *   **Environment**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5.  **Deploy**: Click **Create Web Service**.
6.  **Copy URL**: Once deployed, copy the URL (e.g., `https://investora-api.onrender.com`).

---

## Phase 2: Deploying the Frontend (Vercel)
Vercel is the best platform for Next.js applications.

1.  **Create a Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **Add New Project**: Click **Add New** > **Project**.
3.  **Import Repository**: Select your `Investora` repository.
4.  **Configure Project**:
    *   **Framework Preset**: `Next.js`
    *   **Root Directory**: `frontend`
5.  **Environment Variables**:
    *   Add a variable named `NEXT_PUBLIC_API_URL`.
    *   Value: `https://investora-api.onrender.com` (Your Render URL).
    *   **⚠️ CRITICAL**: If you skip this, the website will load but it won't be able to fetch any market data!
6.  **Deploy**: Click **Deploy**.

---

## Phase 3: Critical Code Adjustments
Before these work together, we must stop using `http://127.0.0.1:8000` in the frontend code and use the environment variable instead.

### 1. Update Frontend API Calls
We will replace hardcoded URLs in:
- `frontend/src/components/GPSAnalyzer.tsx`
- `frontend/src/components/MarketExplorer.tsx`
- `frontend/src/components/TickerTape.tsx`

**Example Change:**
```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const res = await fetch(`${API_BASE}/api/analyze`, ...);
```

### 2. Update Backend CORS
Update `backend/main.py` to allow requests from your Vercel URL.
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.vercel.app", "http://localhost:3000"],
    ...
)
```
