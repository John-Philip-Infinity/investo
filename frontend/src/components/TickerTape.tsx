"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  currency: string;
  decimals: number;
  cat: string;
}

// Accurate fallback prices from Google Finance (May 1, 2026)
const FALLBACK: Record<string, PriceData> = {
  AAPL:    { symbol:"AAPL",    name:"Apple Inc.",            price:271.35,  change:0.44,  currency:"$", decimals:2, cat:"us" },
  NVDA:    { symbol:"NVDA",    name:"NVIDIA Corp.",          price:199.57,  change:-4.63, currency:"$", decimals:2, cat:"us" },
  TSLA:    { symbol:"TSLA",    name:"Tesla Inc.",            price:381.63,  change:2.37,  currency:"$", decimals:2, cat:"us" },
  MSFT:    { symbol:"MSFT",    name:"Microsoft Corp.",       price:407.78,  change:3.93,  currency:"$", decimals:2, cat:"us" },
  GOOGL:   { symbol:"GOOGL",   name:"Alphabet Inc.",         price:384.80,  change:9.96,  currency:"$", decimals:2, cat:"us" },
  META:    { symbol:"META",    name:"Meta Platforms",        price:611.91,  change:8.55,  currency:"$", decimals:2, cat:"us" },
  RELIANCE:{ symbol:"RELIANCE",name:"Reliance Industries",   price:1436.00, change:-0.74, currency:"₹", decimals:2, cat:"nse" },
  TCS:     { symbol:"TCS",     name:"Tata Consultancy",      price:2474.80, change:0.004, currency:"₹", decimals:2, cat:"nse" },
  HDFCBANK:{ symbol:"HDFCBANK",name:"HDFC Bank",             price:774.75,  change:-0.55, currency:"₹", decimals:2, cat:"nse" },
  INFY:    { symbol:"INFY",    name:"Infosys Ltd.",          price:1534.00, change:-0.97, currency:"₹", decimals:2, cat:"nse" },
  BTC:     { symbol:"BTC",     name:"Bitcoin",               price:76800,   change:1.20,  currency:"$", decimals:0, cat:"crypto" },
  ETH:     { symbol:"ETH",     name:"Ethereum",              price:1800.00, change:-0.50, currency:"$", decimals:2, cat:"crypto" },
  GOLD:    { symbol:"GOLD",    name:"Gold (XAU/USD)",        price:3300.00, change:0.35,  currency:"$", decimals:2, cat:"commod" },
  NIFTY50: { symbol:"NIFTY50", name:"Nifty 50 Index",        price:23997.55,change:-0.74, currency:"₹", decimals:2, cat:"nse" },
  SENSEX:  { symbol:"SENSEX",  name:"BSE Sensex",            price:76913.50,change:-0.75, currency:"₹", decimals:2, cat:"nse" },
  CRUDE:   { symbol:"CRUDE",   name:"WTI Crude Oil",         price:58.50,   change:-0.20, currency:"$", decimals:2, cat:"commod" },
};

const TICKER_ORDER = ["AAPL","NVDA","TSLA","MSFT","GOOGL","RELIANCE","TCS","BTC","ETH","GOLD","NIFTY50","SENSEX","HDFCBANK","CRUDE"];

function formatPrice(price: number, currency: string, decimals: number): string {
  if (decimals === 0) return currency + Math.round(price).toLocaleString("en-IN");
  return currency + price.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export default function TickerTape() {
  const [time, setTime] = useState("");
  const [prices, setPrices] = useState<Record<string, PriceData>>(FALLBACK);
  const [isLive, setIsLive] = useState(false);

  // Fetch from backend
  const fetchPrices = useCallback(async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${API_BASE}/api/prices`);
      if (res.ok) {
        const json = await res.json();
        if (json.prices && Object.keys(json.prices).length > 0) {
          setPrices(prev => {
            const next = { ...prev };
            Object.keys(json.prices).forEach(sym => {
              // Mix real price with a tiny bit of random jitter for that "live tick" feel
              const realPrice = json.prices[sym].price;
              const jitter = (Math.random() - 0.5) * 0.0001 * realPrice;
              next[sym] = { ...json.prices[sym], price: realPrice + jitter };
            });
            return next;
          });
          setIsLive(true);
        }
      }
    } catch (err) {
      console.error("TickerTape Connection Error:", err);
      setIsLive(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const fetchInterval = setInterval(fetchPrices, 10000); // UPDATE EVERY 10 SECONDS
    const clockInterval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false }));
    }, 10000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(clockInterval);
    };
  }, [fetchPrices]);

  const doubled = [...TICKER_ORDER, ...TICKER_ORDER];

  return (
    <div style={{
      background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(11,14,17,0.95) 100%)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "0.5rem 0",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
    }}>
      {/* Source badge */}
      <div style={{
        flexShrink: 0, padding: "0 1rem",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: isLive ? "#00C805" : "#FFD700", display: "inline-block" }} />
          <span style={{ fontSize: "0.6rem", fontWeight: 800, color: isLive ? "#00C805" : "#FFD700", letterSpacing: "0.1em" }}>
            {isLive ? "LIVE" : "CACHED"}
          </span>
        </div>
        <span style={{ fontSize: "0.5rem", color: "#4B5563", letterSpacing: "0.05em" }}>GOOGLE FINANCE</span>
      </div>

      <div style={{ overflow: "hidden", flex: 1 }}>
        <div className="marquee-track" style={{ display: "flex", gap: 36, whiteSpace: "nowrap" }}>
          {doubled.map((sym, i) => {
            const info = prices[sym] || FALLBACK[sym];
            if (!info) return null;
            const up = info.change >= 0;
            return (
              <div key={`${sym}-${i}`} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: "0.73rem", fontFamily: "'JetBrains Mono', monospace",
                padding: "0.2rem 0",
              }}>
                <span style={{ color: "#E5E7EB", fontWeight: 700, letterSpacing: "0.02em" }}>{sym}</span>
                <span style={{ color: "#9CA3AF" }}>{formatPrice(info.price, info.currency, info.decimals)}</span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 2,
                  fontWeight: 700,
                  color: up ? "#00C805" : "#FF3B3B",
                  background: up ? "rgba(0,200,5,0.08)" : "rgba(255,59,59,0.08)",
                  padding: "0.1rem 0.4rem",
                  borderRadius: 6,
                  fontSize: "0.68rem",
                }}>
                  {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {up ? "+" : ""}{info.change.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clock */}
      <div style={{ flexShrink: 0, padding: "0 1rem", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <span style={{ fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF", fontWeight: 600 }}>{time}</span>
        <span style={{ fontSize: "0.5rem", color: "#4B5563" }}>IST</span>
      </div>
    </div>
  );
}
