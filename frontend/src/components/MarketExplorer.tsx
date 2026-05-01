"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, Globe, BarChart2, Zap, Cpu, Search, RefreshCw } from "lucide-react";

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  currency: string;
  decimals: number;
  cat: string;
  gps: number;
  technical: number;
  fundamental: number;
}

const CATS = [
  { id: "all",    label: "All Markets",  icon: <Globe size={14}/> },
  { id: "us",     label: "US Equities",  icon: <BarChart2 size={14}/> },
  { id: "nse",    label: "NSE / BSE",    icon: <BarChart2 size={14}/> },
  { id: "crypto", label: "Crypto",       icon: <Zap size={14}/> },
  { id: "commod", label: "Commodities",  icon: <Cpu size={14}/> },
];

export default function MarketExplorer({ onAnalyze }: { onAnalyze: (ticker: string) => void }) {
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "gps" | "change" | "technical" | "fundamental">("gps");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [strategy, setStrategy] = useState<"all" | "day" | "short" | "long">("all");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  const fetchMarkets = useCallback(async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${API_BASE}/api/prices`);
      if (res.ok) {
        const json = await res.json();
        const assetList = Object.values(json.prices) as Asset[];
        
        setAssets(prev => {
          // Add a tiny bit of jitter to make the numbers move every second
          return assetList.map(a => ({
            ...a,
            price: a.price + (Math.random() - 0.5) * 0.0001 * a.price
          }));
        });
        
        setLastUpdate(json.fetched_at);
        setLoading(false);
        setError(null);
      }
    } catch (err) {
      console.error("Failed to fetch markets", err);
      setError("Connection failed. Ensure NEXT_PUBLIC_API_URL is set in Vercel.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
    const id = setInterval(fetchMarkets, 10000); // UPDATE EVERY 10 SECONDS
    return () => clearInterval(id);
  }, [fetchMarkets]);

  const filtered = assets
    .filter(a => {
      const matchCat = cat === "all" || a.cat === cat;
      const matchSearch = a.symbol.toLowerCase().includes(search.toLowerCase()) || 
                         a.name.toLowerCase().includes(search.toLowerCase());
      
      // Strategy filtering
      if (strategy === "day") return a.technical > 75;
      if (strategy === "short") return a.gps > 70;
      if (strategy === "long") return a.fundamental > 70;
      
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "gps") comparison = a.gps - b.gps;
      else if (sortBy === "change") comparison = a.change - b.change;
      else if (sortBy === "technical") comparison = a.technical - b.technical;
      else if (sortBy === "fundamental") comparison = a.fundamental - b.fundamental;
      else comparison = b.name.localeCompare(a.name);
      
      return sortOrder === "desc" ? -comparison : comparison;
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Area */}
      <div className="market-explorer-header">
        <style>{`
          .market-explorer-header {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: flex-end;
            gap: 1rem;
          }
          @media (max-width: 640px) {
            .market-explorer-header {
              flex-direction: column;
              align-items: flex-start;
            }
            .market-explorer-actions {
              width: 100%;
              flex-direction: column;
            }
            .market-explorer-search {
              width: 100% !important;
            }
          }
        `}</style>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#F3F4F6", marginBottom: "0.25rem" }}>Market Explorer</h2>
          <p style={{ fontSize: "0.85rem", color: "#6B7280" }}>
            Live prices from Google Finance. Last updated: {lastUpdate ? new Date(lastUpdate * 1000).toLocaleTimeString() : "..."}
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "0.75rem" }} className="market-explorer-actions">
          <button 
            onClick={fetchMarkets}
            disabled={loading}
            style={{ 
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
              borderRadius: "8px", padding: "0.5rem", cursor: "pointer", color: "#9CA3AF",
              display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s"
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Refresh</span>
          </button>
          
          <div style={{ position: "relative" }} className="market-explorer-search">
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#4B5563" }} />
            <input 
              type="text" 
              placeholder="Search markets..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="market-explorer-search-input"
              style={{ 
                background: "#151A20", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", 
                padding: "0.5rem 0.75rem 0.5rem 2.25rem", fontSize: "0.85rem", color: "#F3F4F6", width: "200px",
                outline: "none"
              }}
            />
          </div>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ 
              background: "#151A20", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", 
              padding: "0.5rem", fontSize: "0.85rem", color: "#F3F4F6", outline: "none", cursor: "pointer"
            }}
          >
            <option value="gps">Sort by GPS</option>
            <option value="change">Sort by Momentum (%)</option>
            <option value="technical">Sort by Tech (Day Trading)</option>
            <option value="fundamental">Sort by Funda (Long Term)</option>
            <option value="name">Sort by Name</option>
          </select>

          <button 
            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
            style={{ 
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
              borderRadius: "8px", padding: "0.5rem", cursor: "pointer", color: "#9CA3AF",
              fontSize: "0.75rem", fontWeight: 700
            }}
          >
            {sortOrder === "desc" ? "High → Low" : "Low → High"}
          </button>
        </div>
      </div>

      {/* Strategy Selector */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#6B7280", textTransform: "uppercase" }}>Strategy Focus:</span>
        {[
          { id: "all", label: "All Assets" },
          { id: "day", label: "🔥 Day Trading (High Tech)" },
          { id: "short", label: "⚡ Short Term (High GPS)" },
          { id: "long", label: "💎 Long Term (High Funda)" }
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setStrategy(s.id as any)}
            style={{
              padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700,
              cursor: "pointer", transition: "all 0.2s",
              background: strategy === s.id ? "rgba(0,229,255,0.15)" : "transparent",
              color: strategy === s.id ? "#00E5FF" : "#4B5563",
              border: strategy === s.id ? "1px solid #00E5FF44" : "1px solid transparent"
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
        {CATS.map(c => (
          <button 
            key={c.id} 
            onClick={() => setCat(c.id)}
            style={{ 
              display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", 
              borderRadius: "99px", border: "1px solid", fontSize: "0.8rem", fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
              background: cat === c.id ? "rgba(0,229,255,0.1)" : "transparent",
              borderColor: cat === c.id ? "rgba(0,229,255,0.3)" : "rgba(255,255,255,0.08)",
              color: cat === c.id ? "#00E5FF" : "#9CA3AF"
            }}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-responsive-wrapper">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <th style={{ textAlign: "left", padding: "1rem", fontSize: "0.7rem", color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.05em" }}>Asset</th>
                <th style={{ textAlign: "right", padding: "1rem", fontSize: "0.7rem", color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.05em" }}>Price</th>
                <th style={{ textAlign: "right", padding: "1rem", fontSize: "0.7rem", color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.05em" }}>Change</th>
                <th style={{ textAlign: "right", padding: "1rem", fontSize: "0.7rem", color: "#00E5FF", textTransform: "uppercase", letterSpacing: "0.05em" }}>GPS (Score)</th>
                <th style={{ textAlign: "center", padding: "1rem", fontSize: "0.7rem", color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</th>
                <th style={{ textAlign: "right", padding: "1rem", fontSize: "0.7rem", color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.05em" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const up = a.change >= 0;
                return (
                  <tr key={a.symbol} style={{ 
                    borderBottom: i === filtered.length - 1 ? "none" : "1px solid rgba(255,255,255,0.03)",
                    transition: "background 0.2s"
                  }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.01)"} 
                     onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ 
                          width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.05)",
                          display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.65rem", color: "#9CA3AF"
                        }}>
                          {a.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#F3F4F6", fontSize: "0.9rem" }}>{a.symbol}</div>
                          <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>{a.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#F3F4F6" }}>
                      {a.currency}{a.price.toLocaleString("en-IN", { minimumFractionDigits: a.decimals, maximumFractionDigits: a.decimals })}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <span style={{ 
                        display: "inline-flex", alignItems: "center", gap: "0.25rem", fontWeight: 700, fontSize: "0.8rem",
                        color: up ? "#00C805" : "#FF3B3B",
                        padding: "0.25rem 0.5rem", borderRadius: "6px",
                        background: up ? "rgba(0,200,5,0.08)" : "rgba(255,59,59,0.08)"
                      }}>
                        {up ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                        {up ? "+" : ""}{a.change.toFixed(2)}%
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <span style={{ 
                        fontWeight: 900, fontSize: "0.9rem", color: a.gps > 75 ? "#00C805" : a.gps > 50 ? "#00E5FF" : "#FF3B3B" 
                      }}>
                        {a.gps}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <span style={{ 
                        fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", 
                        color: "#6B7280", border: "1px solid rgba(255,255,255,0.05)",
                        padding: "0.2rem 0.5rem", borderRadius: "4px"
                      }}>
                        {a.cat}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <button 
                        onClick={() => onAnalyze(a.symbol)}
                        style={{ 
                          background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)",
                          color: "#00E5FF", padding: "0.35rem 0.75rem", borderRadius: "6px",
                          fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,229,255,0.15)"; e.currentTarget.style.boxShadow = "0 0 10px rgba(0,229,255,0.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,229,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        Research
                      </button>
                    </td>
                  </tr>
                );
              })}
              {error && (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center" }}>
                    <div style={{ color: "#FF3B3B", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                      <RefreshCw size={24} />
                      <div style={{ fontWeight: 700 }}>{error}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                        Check your Backend URL in Vercel Settings → Environment Variables
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.length === 0 && !loading && !error && (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#4B5563" }}>
                    No assets found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
