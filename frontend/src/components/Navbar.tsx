"use client";
import { useState, useEffect } from "react";
import { Activity, Menu, X, Search, BarChart2, BrainCircuit, TrendingUp, Globe } from "lucide-react";
import Link from "next/link";

const NAV = [
  { href: "/", label: "Analyzer",  icon: Search },
  { href: "/markets", label: "Markets", icon: Globe },
  { href: "#", label: "Screeners", icon: BarChart2 },
  { href: "#", label: "AI Coach",  icon: BrainCircuit },
];

export default function Navbar({ onLaunch }: { onLaunch: () => void }) {
  const [open, setOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    const check = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${API_BASE}/api/prices`);
        setApiStatus(res.ok ? "online" : "offline");
      } catch {
        setApiStatus("offline");
      }
    };
    check();
    const id = setInterval(check, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="glass-nav" style={{ position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.25rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ background: "linear-gradient(135deg,#00E5FF,#0077AA)", padding: 6, borderRadius: 8, display: "flex" }}>
            <Activity size={18} color="#000" />
          </div>
          <span style={{ fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-0.03em", color: "#F3F4F6" }}>
            INVESTORA<span style={{ color: "#00E5FF" }}>.AI</span>
          </span>
          <span style={{ background: "rgba(0,200,5,0.15)", color: "#00C805", border: "1px solid rgba(0,200,5,0.3)", borderRadius: 4, fontSize: "0.6rem", fontWeight: 800, padding: "1px 5px", letterSpacing: "0.08em" }}>
            BETA
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: "flex", gap: 2, alignItems: "center" }} className="desktop-nav">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={label} href={href}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.45rem 0.85rem", borderRadius: 8, textDecoration: "none", fontSize: "0.82rem", fontWeight: 500, color: "#9CA3AF", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#F3F4F6"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="hide-on-mobile" style={{ display: "flex", alignItems: "center", gap: 6, background: apiStatus === "online" ? "rgba(0,200,5,0.08)" : "rgba(255,59,59,0.08)", border: `1px solid ${apiStatus === "online" ? "rgba(0,200,5,0.2)" : "rgba(255,59,59,0.2)"}`, borderRadius: 9999, padding: "0.3rem 0.75rem" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: apiStatus === "online" ? "#00C805" : "#FF3B3B", display: "inline-block" }} className={apiStatus === "online" ? "pulse-dot" : ""} />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: apiStatus === "online" ? "#00C805" : "#FF3B3B", letterSpacing: "0.05em" }}>
              API: {apiStatus.toUpperCase()}
            </span>
          </div>
          <button 
            onClick={onLaunch}
            className="btn-primary" 
            style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}
          >
            <span className="hide-on-mobile">Launch Research</span>
            <span className="display-on-mobile" style={{ display: "none" }}>Research</span>
          </button>
          <button onClick={() => setOpen(!open)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 6, cursor: "pointer", color: "#9CA3AF" }} className="mobile-menu-btn">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={label} href={href} onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.6rem 0.75rem", borderRadius: 8, textDecoration: "none", fontSize: "0.875rem", color: "#9CA3AF" }}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`@media(max-width:768px){.desktop-nav{display:none!important}.mobile-menu-btn{display:flex!important}}`}</style>
    </header>
  );
}
