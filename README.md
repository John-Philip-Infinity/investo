# Investora 📈

Investora is a premium AI-driven financial research platform designed for real-time asset tracking and quantitative analysis.

## Features
- **GPS Analyzer**: Growth Probability Score based on Technical, Fundamental, Sentiment, and Macro pillars.
- **Market Explorer**: Real-time price tracking for US Equities, NSE (India), Crypto, and Commodities.
- **Ticker Tape**: Live scrolling price feed sourced from Google Finance.
- **Bento Grid UI**: Obsidian-style dark theme with high-density data visualization.

## Project Structure
- `/frontend`: Next.js (TypeScript) + Vanilla CSS + Framer Motion.
- `/backend`: FastAPI (Python) + Google Finance Scraper.

## Getting Started

### Local Development
1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Hosting & Deployment
For full instructions on how to host Investora on **Vercel** and **Render**, see the [Hosting Guide](./hosting_guide.md).
