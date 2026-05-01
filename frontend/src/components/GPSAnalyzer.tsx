"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Target, TrendingUp, TrendingDown, Shield, AlertTriangle, BrainCircuit, Activity, Newspaper, Zap, Info, ArrowRight, RefreshCw, Globe } from "lucide-react";
import RadarChart from "./RadarChart";

interface AnalysisData {
  ticker: string;
  name: string;
  gps_score: number;
  technical_score: number;
  fundamental_score: number;
  sentiment_score: number;
  macro_score: number;
  short_term_bullish_prob: number;
  long_term_growth_prob: number;
  risk_profile: string;
  volatility_rating: string;
  mathematical_justification: string;
  actionable_news: string;
  entry_zone: string;
  stop_loss: string;
  fair_value: string;
  current_price: number;
  currency: string;
  sector_avg_gps: number;
  case_study: {
    thesis: string;
    key_strengths: string[];
    key_risks: string[];
    bottom_line: string;
  };
  detailed_ratings: Array<{
    category: string;
    score: number;
    label: string;
  }>;
  financials: {
    pe_ratio: number;
    market_cap: string;
    dividend_yield: string;
    roe: string;
    debt_to_equity: number;
  };
}

const PILLARS = [
  { key: "fundamental_score", label: "Fundamental", weight: "35%", color: "#00E5FF", bg: "rgba(0,229,255,0.8)" },
  { key: "technical_score",   label: "Technical",   weight: "30%", color: "#00C805", bg: "rgba(0,200,5,0.8)"   },
  { key: "sentiment_score",   label: "Sentiment",   weight: "20%", color: "#A78BFA", bg: "rgba(167,139,250,0.8)"},
  { key: "macro_score",       label: "Macro",       weight: "15%", color: "#FFD700", bg: "rgba(255,215,0,0.8)" },
];

const RISK_CHIP: Record<string, string> = { 
  Momentum: "stat-chip-green", 
  Growth: "stat-chip-blue", 
  Value: "stat-chip-gold", 
  Speculative: "stat-chip-red" 
};

export default function GPSAnalyzer({ initialTicker = "" }: { initialTicker?: string }) {
  const [ticker, setTicker] = useState(initialTicker);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"summary" | "casestudy" | "ratings">("summary");
  const [researchPhase, setResearchPhase] = useState<string | null>(null);

  const AGENTS = [
    { id: "quant", label: "Quantitative Agent", icon: <TrendingUp size={16}/>, msg: "Analyzing technical breakout patterns and volume delta..." },
    { id: "fund",  label: "Fundamental Bot",   icon: <Target size={16}/>,     msg: "Scanning quarterly earnings and balance sheet health..." },
    { id: "sent",  label: "Sentiment Engine",  icon: <BrainCircuit size={16}/>, msg: "Aggregating news sentiment and social velocity..." },
    { id: "macro", label: "Macro Strategist",  icon: <Globe size={16}/>,     msg: "Evaluating interest rate sensitivity and sector rotation..." },
  ];

  const analyze = async (e?: React.FormEvent, searchTicker?: string) => {
    if (e) e.preventDefault();
    const t = (searchTicker || ticker).trim().toUpperCase();
    if (!t) return;
    
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      // Simulate Multi-Agent Collaboration
      for (const agent of AGENTS) {
        setResearchPhase(agent.label);
        await new Promise(r => setTimeout(r, 600)); // Shortened
      }
      setResearchPhase("Synthesizing agent reports...");
      await new Promise(r => setTimeout(r, 400));

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${API_BASE}/api/analyze`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ ticker: t }) 
      });
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      setData(json);
      setActiveView("summary");
    } catch (err) {
      console.error(err);
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
      setError(`Analysis failed. The AI engine at ${API_BASE} is unreachable. Check your Vercel Environment Variables.`);
    }
    setLoading(false);
    setResearchPhase(null);
  };

  useEffect(() => {
    if (initialTicker) {
      setTicker(initialTicker);
      analyze(undefined, initialTicker);
    }
  }, [initialTicker]);

  // Poll for price updates if we have an active analysis
  useEffect(() => {
    const id = setInterval(async () => {
      if (data && data.ticker) {
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
          const res = await fetch(`${API_BASE}/api/prices/${data.ticker}`);
          if (res.ok) {
            const json = await res.json();
            setData(prev => prev ? { ...prev, current_price: json.price } : null);
          }
        } catch {}
      }
    }, 10000);
    return () => clearInterval(id);
  }, [data?.ticker]);

  const gpsCol  = data ? (data.gps_score >= 75 ? "#00C805" : data.gps_score >= 50 ? "#00E5FF" : "#FF3B3B") : "#00E5FF";

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Search Header */}
      <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto", padding: "1rem 0" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "1rem", color: "#F3F4F6", letterSpacing: "-0.02em" }}>
          AI Quantitative <span className="gradient-text-brand">GPS Analysis</span>
        </h1>
        <p style={{ color: "#9CA3AF", fontSize: "1rem", marginBottom: "2rem", lineHeight: 1.6 }}>
          Search for any stock or crypto ticker globally. Our AI engine computes a Growth Probability Score 
          based on real-time data from Google Finance.
        </p>

        <form onSubmit={analyze} style={{ position: "relative", marginBottom: "1.5rem" }}>
          <style>{styles}</style>
          <Search size={20} className="hide-on-mobile" style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", color: "#4B5563", pointerEvents: "none" }} />
          <input 
            type="text" 
            value={ticker} 
            onChange={e => setTicker(e.target.value)}
            placeholder="Search e.g. NVDA, RELIANCE, BTC, TCS..."
            className="search-input"
            style={{ borderRadius: "16px" }}
          />
          <button 
            type="submit" 
            disabled={loading || !ticker.trim()} 
            className="btn-primary"
            style={{ position: "absolute", right: "8px", top: "8px", height: "calc(100% - 16px)", borderRadius: "10px" }}
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <><span style={{ marginRight: "8px" }}>Analyze</span> <ArrowRight size={16} /></>}
          </button>
        </form>

        <AnimatePresence>
          {researchPhase && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ padding: "1.5rem", background: "rgba(0,229,255,0.05)", borderRadius: "16px", border: "1px solid rgba(0,229,255,0.1)", textAlign: "center" }}
            >
              <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1rem" }}>
                {AGENTS.map(a => (
                  <div key={a.id} style={{ 
                    padding: "8px", borderRadius: "8px", 
                    background: researchPhase === a.label ? "rgba(0,229,255,0.2)" : "rgba(255,255,255,0.05)",
                    color: researchPhase === a.label ? "#00E5FF" : "#4B5563",
                    transform: researchPhase === a.label ? "scale(1.1)" : "scale(1)",
                    transition: "all 0.3s"
                  }}>
                    {a.icon}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <RefreshCw size={14} className="animate-spin" color="#00E5FF" />
                {researchPhase}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "6px", maxWidth: "300px", margin: "6px auto 0" }}>
                {AGENTS.find(a => a.label === researchPhase)?.msg || "Generating final GPS intelligence report..."}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div style={{ color: "#FF3B3B", fontSize: "0.85rem", background: "rgba(255,59,59,0.1)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(255,59,59,0.2)" }}>
            <AlertTriangle size={14} style={{ marginRight: "8px", verticalAlign: "middle" }} />
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem", marginTop: "1rem" }}>
          {["AAPL", "RELIANCE", "NVDA", "BTC", "TCS", "GOLD"].map(t => (
            <button 
              key={t} 
              onClick={() => { setTicker(t); analyze(undefined, t); }}
              style={{ 
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
                borderRadius: "8px", padding: "0.4rem 0.8rem", cursor: "pointer", 
                color: "#6B7280", fontSize: "0.8rem", transition: "all 0.2s" 
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#00E5FF"; e.currentTarget.style.borderColor = "#00E5FF44"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {data && (
          <motion.div 
            key={data.ticker} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* View Switcher */}
            <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1rem" }}>
              {[
                { id: "summary", label: "Quick Summary", icon: <Activity size={14}/> },
                { id: "casestudy", label: "Research Case Study", icon: <Newspaper size={14}/> },
                { id: "ratings", label: "Detailed Ratings", icon: <Zap size={14}/> }
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id as any)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    background: activeView === v.id ? "rgba(0,229,255,0.1)" : "transparent",
                    color: activeView === v.id ? "#00E5FF" : "#6B7280",
                    border: "none", padding: "0.5rem 1rem", borderRadius: "8px",
                    cursor: "pointer", fontSize: "0.85rem", fontWeight: 700, transition: "all 0.2s"
                  }}
                >
                  {v.icon} {v.label}
                </button>
              ))}
            </div>

            {activeView === "summary" && (
              <>
                {/* Summary Hero Card */}
                <div className="card summary-hero-grid" style={{ padding: "2rem", background: "linear-gradient(145deg, #151A20 0%, #1C2228 100%)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ background: "rgba(0,229,255,0.1)", padding: "12px", borderRadius: "16px" }}>
                        <Activity size={24} color="#00E5FF" />
                      </div>
                      <div>
                        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#F3F4F6" }}>{data.name}</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem" }}>
                          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace" }}>
                            {data.currency}{data.current_price.toLocaleString("en-IN")}
                          </span>
                          <span className={RISK_CHIP[data.risk_profile]} style={{ fontSize: "0.65rem", padding: "2px 8px" }}>
                            {data.risk_profile}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="summary-prob-grid" style={{ gap: "1rem", marginTop: "0.5rem" }}>
                      <style>{`
                        .summary-prob-grid {
                          display: grid;
                          grid-template-columns: 1fr 1fr;
                        }
                        @media (max-width: 640px) {
                          .summary-prob-grid {
                            grid-template-columns: 1fr;
                          }
                        }
                      `}</style>
                      <div style={{ background: "rgba(0,200,5,0.05)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(0,200,5,0.1)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#00C805", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>
                          <TrendingUp size={12}/> Bullish Probability
                        </div>
                        <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#F3F4F6" }}>{data.short_term_bullish_prob}%</div>
                      </div>
                      <div style={{ background: "rgba(167,139,250,0.05)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(167,139,250,0.1)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#A78BFA", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>
                          <BrainCircuit size={12}/> Growth Outlook
                        </div>
                        <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#F3F4F6" }}>{data.long_term_growth_prob}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="summary-chart-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <div style={{ position: "relative", width: "160px", height: "160px" }}>
                      <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                        <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
                        <circle 
                          cx="100" cy="100" r="85" fill="none" 
                          stroke={gpsCol} strokeWidth="12" strokeLinecap="round" 
                          strokeDasharray="534" strokeDashoffset={534 - (data.gps_score / 100) * 534}
                          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)" }}
                        />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "2.5rem", fontWeight: 900, color: gpsCol }}>{data.gps_score}</span>
                        <span style={{ fontSize: "0.7rem", color: "#6B7280", fontWeight: 700 }}>GPS SCORE</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>Sector Average: <b style={{ color: "#F3F4F6" }}>{data.sector_avg_gps}</b></div>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${data.name} Analysis Summary:\nGPS Score: ${data.gps_score}\nFair Value: ${data.currency}${data.fair_value}\nSentiment: ${data.sentiment_score}/100`);
                        alert("Research summary copied to clipboard!");
                      }}
                      style={{ marginTop: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9CA3AF", padding: "6px 12px", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Copy Research
                    </button>
                  </div>
                </div>

                {/* Detailed Analysis Grid */}
                <div className="grid-responsive-2">
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {/* Pillars Card */}
                    <div className="card" style={{ padding: "1.5rem" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Info size={16} color="#00E5FF" /> Pillar Distribution
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        {PILLARS.map(p => {
                          const val = (data as any)[p.key] as number;
                          return (
                            <div key={p.key}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: p.color }}>{p.label} <small style={{ color: "#4B5563", fontWeight: 400 }}>({p.weight})</small></span>
                                <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#F3F4F6", fontFamily: "'JetBrains Mono', monospace" }}>{val} <small style={{ color: "#4B5563" }}>/ 100</small></span>
                              </div>
                              <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "99px", overflow: "hidden" }}>
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  animate={{ width: `${val}%` }} 
                                  transition={{ duration: 1, delay: 0.2 }}
                                  style={{ height: "100%", background: p.bg, borderRadius: "99px" }} 
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ marginTop: "1.5rem", padding: "1rem", borderRadius: "10px", background: "rgba(0,0,0,0.2)", borderLeft: "4px solid #00E5FF" }}>
                        <p style={{ fontSize: "0.8rem", color: "#9CA3AF", lineHeight: 1.6 }}>{data.mathematical_justification}</p>
                      </div>
                    </div>

                    {/* News Card */}
                    <div className="card" style={{ padding: "1.5rem" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Newspaper size={16} color="#A78BFA" /> Actionable Sentiment
                      </h3>
                      <p style={{ fontSize: "0.9rem", color: "#D1D5DB", lineHeight: 1.7 }}>{data.actionable_news}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {/* Zones Card */}
                    <div className="card" style={{ padding: "1.5rem" }}>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: "1.25rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Predictive Zones</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {[
                          { label: "Accumulation Zone", val: data.entry_zone, color: "#00C805", icon: <Target size={14}/> },
                          { label: "Fair Value (Target)", val: data.fair_value, color: "#00E5FF", icon: <TrendingUp size={14}/> },
                          { label: "Stop Loss Zone", val: data.stop_loss, color: "#FF3B3B", icon: <Shield size={14}/> }
                        ].map(zone => (
                          <div key={zone.label}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#9CA3AF", marginBottom: "4px" }}>
                              {zone.icon} {zone.label}
                            </div>
                            <div style={{ fontSize: "1rem", fontWeight: 700, color: zone.color, fontFamily: "'JetBrains Mono', monospace" }}>{zone.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Radar Card */}
                    <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#6B7280", textTransform: "uppercase" }}>Radar Profile</h3>
                      <RadarChart 
                        technical={data.technical_score} 
                        fundamental={data.fundamental_score} 
                        sentiment={data.sentiment_score} 
                        macro={data.macro_score} 
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeView === "casestudy" && (
              <div className="card" style={{ padding: "2.5rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div style={{ borderLeft: "4px solid #00E5FF", paddingLeft: "1.5rem" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Investment Thesis</h2>
                  <p style={{ fontSize: "1.1rem", color: "#D1D5DB", lineHeight: 1.6, fontStyle: "italic" }}>
                    "{data.case_study.thesis}"
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  <div style={{ background: "rgba(0,200,5,0.03)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(0,200,5,0.1)" }}>
                    <h3 style={{ color: "#00C805", fontSize: "1rem", fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <TrendingUp size={18}/> Key Strengths
                    </h3>
                    <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: 0, listStyle: "none" }}>
                      {data.case_study.key_strengths.map((s, i) => (
                        <li key={i} style={{ fontSize: "0.9rem", color: "#9CA3AF", display: "flex", gap: "0.75rem" }}>
                          <span style={{ color: "#00C805", fontWeight: 900 }}>•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: "rgba(255,59,59,0.03)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,59,59,0.1)" }}>
                    <h3 style={{ color: "#FF3B3B", fontSize: "1rem", fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <AlertTriangle size={18}/> Risk Factors
                    </h3>
                    <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: 0, listStyle: "none" }}>
                      {data.case_study.key_risks.map((r, i) => (
                        <li key={i} style={{ fontSize: "0.9rem", color: "#9CA3AF", display: "flex", gap: "0.75rem" }}>
                          <span style={{ color: "#FF3B3B", fontWeight: 900 }}>•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ background: "linear-gradient(90deg, rgba(167,139,250,0.1), transparent)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(167,139,250,0.1)" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.5rem", color: "#A78BFA" }}>Bottom Line</h3>
                  <p style={{ fontSize: "1rem", color: "#F3F4F6", fontWeight: 500 }}>{data.case_study.bottom_line}</p>
                </div>
              </div>
            )}

            {activeView === "ratings" && (
              <div className="grid-responsive-2">
                <div className="card" style={{ padding: "2rem" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "2rem" }}>Factor Rating Matrix</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                    {data.detailed_ratings.map(r => (
                      <div key={r.category}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", alignItems: "flex-end" }}>
                          <div>
                            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</span>
                            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F3F4F6" }}>{r.category}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: r.score > 70 ? "#00C805" : r.score > 40 ? "#FFD700" : "#FF3B3B" }}>{r.label}</span>
                            <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#F3F4F6", fontFamily: "'JetBrains Mono', monospace" }}>{r.score.toFixed(1)}</div>
                          </div>
                        </div>
                        <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${r.score}%` }}
                            transition={{ duration: 1 }}
                            style={{ 
                              height: "100%", 
                              background: r.score > 70 ? "linear-gradient(90deg, #00C805, #00FF88)" : r.score > 40 ? "linear-gradient(90deg, #FFD700, #FFAA00)" : "linear-gradient(90deg, #FF3B3B, #FF8888)",
                              borderRadius: "4px"
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: "1.5rem", color: "#6B7280", textTransform: "uppercase" }}>Financial Health</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {[
                      { label: "P/E Ratio", val: data.financials.pe_ratio, sub: "Trailing 12m" },
                      { label: "Market Cap", val: data.financials.market_cap, sub: "Valuation" },
                      { label: "Div. Yield", val: data.financials.dividend_yield, sub: "Annualized" },
                      { label: "ROE", val: data.financials.roe, sub: "Return on Equity" },
                      { label: "D/E Ratio", val: data.financials.debt_to_equity, sub: "Leverage" }
                    ].map(f => (
                      <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#F3F4F6" }}>{f.label}</div>
                          <div style={{ fontSize: "0.65rem", color: "#6B7280" }}>{f.sub}</div>
                        </div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace" }}>{f.val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                    <button className="btn-primary" style={{ width: "100%", fontSize: "0.75rem", padding: "0.5rem" }}>Download Full Report</button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

const styles = `
  .summary-hero-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    align-items: center;
  }
  @media (min-width: 1024px) {
    .summary-hero-grid {
      grid-template-columns: 1fr 280px;
    }
  }
  
  .summary-chart-container {
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 2rem;
    width: 100%;
  }
  @media (min-width: 1024px) {
    .summary-chart-container {
      border-top: none;
      border-left: 1px solid rgba(255,255,255,0.05);
      padding-top: 0;
      padding-left: 2rem;
      width: auto;
    }
  }

  @media (max-width: 768px) {
    .search-input {
      padding: 0.8rem 1rem !important;
      font-size: 0.85rem !important;
    }
    .btn-primary {
      position: relative !important;
      top: 0 !important;
      right: 0 !important;
      width: 100% !important;
      margin-top: 0.5rem !important;
      height: auto !important;
    }
  }
`;
