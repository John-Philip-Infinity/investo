"use client";

import { use } from "react";
import Navbar from "@/components/Navbar";
import TickerTape from "@/components/TickerTape";
import GPSAnalyzer from "@/components/GPSAnalyzer";

export default function AnalyzePage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);
  const decodedTicker = decodeURIComponent(ticker);

  return (
    <div className="bg-grid" style={{ minHeight: "100vh", backgroundColor: "#0B0E11" }}>
      <Navbar />
      <TickerTape />
      
      <div className="container-responsive" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="card" style={{ padding: "1rem", marginBottom: "2rem", background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.1)" }}>
          <p style={{ fontSize: "0.8rem", color: "#00E5FF", fontWeight: 700 }}>
            Deep Research Mode: <span style={{ color: "#F3F4F6" }}>{decodedTicker}</span>
          </p>
        </div>
        
        <GPSAnalyzer initialTicker={decodedTicker} />
      </div>
    </div>
  );
}
