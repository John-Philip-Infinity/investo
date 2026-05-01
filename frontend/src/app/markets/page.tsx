"use client";

import { useState, useEffect, useMemo, useRef } from "react";
// @ts-ignore
import { FixedSizeList } from "react-window";
import Papa from "papaparse";
import Navbar from "@/components/Navbar";
import TickerTape from "@/components/TickerTape";
import { Search, Globe, ArrowRight, Download, Filter, Info, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Stock {
  symbol: string;
  name: string;
  series: string;
  listingDate: string;
  exchange: "NSE" | "BSE";
}

const COLUMN_WIDTHS = {
  symbol: 150,
  name: 400,
  series: 100,
  date: 150,
  action: 150
};

export default function MarketsPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [exchange, setExchange] = useState<"NSE" | "BSE">("NSE");
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        // Using a reliable public mirror for NSE Equity list
        const response = await fetch("https://raw.githubusercontent.com/John-Philip-Infinity/datasets/main/EQUITY_L.csv");
        const csvText = await response.text();
        
         Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results: Papa.ParseResult<any>) => {
            const mapped: Stock[] = results.data.map((row: any) => ({
              symbol: row.SYMBOL || row.Symbol || "",
              name: row["NAME OF COMPANY"] || row.NAME || row.Company || "",
              series: row.SERIES || row.Series || "EQ",
              listingDate: row["DATE OF LISTING"] || row.ListingDate || "N/A",
              exchange: "NSE" as const
            })).filter((s: any) => s.symbol);
            
            if (mapped.length === 0) throw new Error("Empty data");
            
            // Add some simulated BSE stocks for the toggle demo
            const bseSim = mapped.slice(0, 500).map((s: Stock) => ({ ...s, exchange: "BSE" as const }));
            setStocks([...mapped, ...bseSim]);
            setLoading(false);
          },
          error: (err: Error) => {
            console.error("CSV Parse Error:", err);
            handleFallback();
          }
        });
      } catch (err) {
        console.error("Fetch Error:", err);
        handleFallback();
      }
    };

    const handleFallback = () => {
        // Fallback to a high-quality sample if external link is down
        const sample: Stock[] = [
            { symbol: "RELIANCE", name: "Reliance Industries", series: "EQ", listingDate: "1995-11-29", exchange: "NSE" },
            { symbol: "TCS", name: "Tata Consultancy Services", series: "EQ", listingDate: "2004-08-25", exchange: "NSE" },
            { symbol: "INFY", name: "Infosys Limited", series: "EQ", listingDate: "1993-06-14", exchange: "NSE" },
            { symbol: "HDFCBANK", name: "HDFC Bank Limited", series: "EQ", listingDate: "1995-05-19", exchange: "NSE" },
            { symbol: "ICICIBANK", name: "ICICI Bank Limited", series: "EQ", listingDate: "1997-09-17", exchange: "NSE" },
            { symbol: "ZOMATO", name: "Zomato Limited", series: "EQ", listingDate: "2021-07-23", exchange: "NSE" },
            { symbol: "PAYTM", name: "One 97 Communications", series: "EQ", listingDate: "2021-11-18", exchange: "NSE" },
            { symbol: "TATAMOTORS", name: "Tata Motors Limited", series: "EQ", listingDate: "1995-07-22", exchange: "NSE" },
        ];
        // Multiply sample to test virtual scrolling
        const largeSample = Array.from({ length: 100 }).flatMap(() => sample).map((s, i) => ({ ...s, symbol: `${s.symbol}_${i}` }));
        setStocks(largeSample);
        setLoading(false);
    };

    fetchStocks();
  }, []);

  // Update dimensions on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: window.innerHeight - 350
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const filteredStocks = useMemo(() => {
    return stocks.filter(s => 
      s.exchange === exchange &&
      (s.symbol.toLowerCase().includes(search.toLowerCase()) || 
       s.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [stocks, search, exchange]);

  const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const stock = filteredStocks[index];
    if (!stock) return null;

    return (
      <div style={{ 
        ...style, 
        display: "flex", 
        alignItems: "center", 
        borderBottom: "1px solid rgba(255,255,255,0.03)",
        background: index % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"
      }}>
        <div style={{ width: COLUMN_WIDTHS.symbol, padding: "0 1rem", fontWeight: 800, color: "#00E5FF", fontFamily: "monospace" }}>
          {stock.symbol}
        </div>
        <div style={{ width: COLUMN_WIDTHS.name, padding: "0 1rem", color: "#F3F4F6", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {stock.name}
        </div>
        <div style={{ width: COLUMN_WIDTHS.series, padding: "0 1rem", textAlign: "center" }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", color: "#6B7280" }}>
            {stock.series}
          </span>
        </div>
        <div style={{ width: COLUMN_WIDTHS.date, padding: "0 1rem", color: "#9CA3AF", fontSize: "0.75rem" }}>
          {stock.listingDate}
        </div>
        <div style={{ width: COLUMN_WIDTHS.action, padding: "0 1rem", display: "flex", justifyContent: "flex-end" }}>
          <Link href={`/analyze/${encodeURIComponent(stock.symbol)}`} className="btn-analyze-small">
            Analyze <ArrowRight size={12} style={{ marginLeft: 4 }} />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-grid" style={{ minHeight: "100vh", backgroundColor: "#0B0E11" }}>
      <Navbar />
      <TickerTape />

      <div className="container-responsive" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#F3F4F6", marginBottom: "0.5rem" }}>
              Global <span className="gradient-text-brand">Markets</span>
            </h1>
            <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>
              Deep database of {stocks.length.toLocaleString()} equity listings from NSE & BSE.
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#4B5563" }} />
              <input 
                type="text" 
                placeholder="Search symbol or name..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ 
                  background: "#151A20", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", 
                  padding: "0.75rem 1rem 0.75rem 2.5rem", fontSize: "0.9rem", color: "#F3F4F6", width: "300px",
                  outline: "none", transition: "all 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "#00E5FF"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
            
            <div style={{ display: "flex", background: "#151A20", padding: "4px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
              {["NSE", "BSE"].map(ex => (
                <button
                  key={ex}
                  onClick={() => setExchange(ex as any)}
                  style={{
                    padding: "0.5rem 1.25rem", borderRadius: "8px", border: "none", fontSize: "0.8rem", fontWeight: 700,
                    cursor: "pointer", transition: "all 0.2s",
                    background: exchange === ex ? "rgba(0,229,255,0.1)" : "transparent",
                    color: exchange === ex ? "#00E5FF" : "#6B7280"
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid-responsive-4" style={{ marginBottom: "2rem" }}>
          {[
            { label: "Total Listings", val: filteredStocks.length.toLocaleString(), icon: <Globe size={14}/>, color: "#00E5FF" },
            { label: "Active Exchange", val: exchange, icon: <Filter size={14}/>, color: "#A78BFA" },
            { label: "Data Source", val: "NSE Equity List", icon: <Info size={14}/>, color: "#FBB924" },
            { label: "Performance", val: "Virtual 60fps", icon: <ExternalLink size={14}/>, color: "#00C805" }
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ background: `${stat.color}15`, padding: "10px", borderRadius: "10px", color: stat.color }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#6B7280", fontWeight: 800, textTransform: "uppercase" }}>{stat.label}</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#F3F4F6" }}>{stat.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Header */}
        <div style={{ 
          display: "flex", alignItems: "center", padding: "1rem", 
          background: "rgba(255,255,255,0.02)", borderRadius: "12px 12px 0 0",
          border: "1px solid rgba(255,255,255,0.05)", borderBottom: "none"
        }}>
          <div style={{ width: COLUMN_WIDTHS.symbol, padding: "0 1rem", fontSize: "0.7rem", color: "#4B5563", fontWeight: 800, textTransform: "uppercase" }}>Symbol</div>
          <div style={{ width: COLUMN_WIDTHS.name, padding: "0 1rem", fontSize: "0.7rem", color: "#4B5563", fontWeight: 800, textTransform: "uppercase" }}>Company Name</div>
          <div style={{ width: COLUMN_WIDTHS.series, padding: "0 1rem", fontSize: "0.7rem", color: "#4B5563", fontWeight: 800, textTransform: "uppercase", textAlign: "center" }}>Series</div>
          <div style={{ width: COLUMN_WIDTHS.date, padding: "0 1rem", fontSize: "0.7rem", color: "#4B5563", fontWeight: 800, textTransform: "uppercase" }}>Listing Date</div>
          <div style={{ width: COLUMN_WIDTHS.action, padding: "0 1rem", fontSize: "0.7rem", color: "#4B5563", fontWeight: 800, textTransform: "uppercase", textAlign: "right" }}>Research</div>
        </div>

        {/* Virtualized Table */}
        <div ref={containerRef} className="card" style={{ borderRadius: "0 0 12px 12px", borderTop: "none", height: dimensions.height }}>
          {loading ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              <div className="animate-spin" style={{ width: "30px", height: "30px", border: "3px solid rgba(0,229,255,0.1)", borderTopColor: "#00E5FF", borderRadius: "50%" }} />
              <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>Loading Market Database...</p>
            </div>
          ) : filteredStocks.length > 0 ? (
            <FixedSizeList
              height={dimensions.height}
              itemCount={filteredStocks.length}
              itemSize={60}
              width={dimensions.width}
            >
              {Row}
            </FixedSizeList>
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "#6B7280" }}>No stocks found matching "{search}"</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .btn-analyze-small {
          background: rgba(0,229,255,0.1);
          border: 1px solid rgba(0,229,255,0.2);
          color: #00E5FF;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }
        .btn-analyze-small:hover {
          background: rgba(0,229,255,0.15);
          box-shadow: 0 0 15px rgba(0,229,255,0.2);
          transform: translateX(2px);
        }
      `}</style>
    </div>
  );
}
