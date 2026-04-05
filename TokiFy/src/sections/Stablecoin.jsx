import { useState, useEffect } from "react";
import { stablecoinCards } from "../data/content";
import { TokiMockBackend } from "../backend/mockBackend";

function TransferCalc() {
  const [amt, setAmt] = useState(500);
  const [cur, setCur] = useState("USD");

  const fee      = (amt * 0.02).toFixed(2);
  const afterFee = (amt - fee).toFixed(2);
  const inr      = (afterFee * TokiMockBackend.getRate(cur)).toFixed(2);
  const currencies = ["USD", "GBP", "EUR", "AED", "SGD"];

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
      <div style={{ flex: 1, minWidth: 160 }}>
        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Syne',sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 8 }}>You send (INR)</label>
        <input type="number" min={10} max={100000} value={amt} onChange={(e) => setAmt(Number(e.target.value))} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontFamily: "'Syne',sans-serif", fontSize: 16, padding: "12px 14px", outline: "none", boxSizing: "border-box" }} />
      </div>
      <div style={{ minWidth: 120 }}>
        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Syne',sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 8 }}>To currency</label>
        <select value={cur} onChange={(e) => setCur(e.target.value)} style={{ background: "rgba(20,20,20,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontFamily: "'Syne',sans-serif", fontSize: 14, padding: "12px 14px", outline: "none", cursor: "pointer" }}>
          {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ flex: 2, minWidth: 200, background: "rgba(232,33,10,0.08)", border: "1px solid rgba(232,33,10,0.22)", borderRadius: 8, padding: "12px 18px" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'Syne',sans-serif", marginBottom: 6 }}>
          TokiFy fee: ₹{fee} (2%) · Via TokiUSD settlement
        </div>
        <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, letterSpacing: "0.06em", color: "#fff" }}>
          Recipient gets: <span style={{ color: "#f56a00" }}>{afterFee} {cur}</span>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Syne',sans-serif", marginTop: 4 }}>
          ≈ ₹{Number(inr).toLocaleString()} at ₹{TokiMockBackend.getRate(cur)}/{cur} · settles in ~28s
        </div>
      </div>
    </div>
  );
}

export default function Stablecoin() {
  const [rate,      setRate]      = useState(83.12);
  const [vol,       setVol]       = useState(412.8);
  const [transfers, setTransfers] = useState(14832);
  const [pulse,     setPulse]     = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRate((r) => parseFloat((r + (Math.random() - 0.5) * 0.08).toFixed(2)));
      setVol((v) => parseFloat((v + (Math.random() - 0.5) * 2).toFixed(1)));
      setTransfers((t) => t + Math.floor(Math.random() * 3));
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const stat = (val, label, hi) => (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: "clamp(32px,5vw,48px)", background: "linear-gradient(135deg,#fff 30%,#f56a00 90%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", transition: "transform 0.3s", transform: hi && pulse ? "scale(1.05)" : "scale(1)" }}>{val}</div>
      <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.32)", textTransform: "uppercase", marginTop: 6, fontFamily: "'Syne',sans-serif" }}>{label}</div>
    </div>
  );

  return (
    <section id="stablecoin" style={{ padding: "clamp(60px,8vw,120px) clamp(24px,8vw,140px)" }}>
      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto" }}>
        <p className="sec-label">Stablecoin Infrastructure</p>
        <h2 className="sec-title">TokiUSD —<br/><span style={{ WebkitTextStroke: "1px rgba(255,255,255,0.28)", color: "transparent" }}>Stable. Fast. Yours.</span></h2>
        <p className="sec-body">Our internal stablecoin powers every TokiFy transfer. Zero volatility, instant cross-border settlement, and full regulatory compliance.</p>

        {/* Live ticker */}
        <div style={{ background: "rgba(232,33,10,0.08)", border: "1px solid rgba(232,33,10,0.25)", borderRadius: 12, padding: "20px 28px", marginBottom: 48, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: pulse ? "#4ade80" : "#22c55e", boxShadow: pulse ? "0 0 10px #4ade80" : "none", transition: "all 0.3s" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Syne',sans-serif", textTransform: "uppercase", letterSpacing: "0.15em" }}>Live</span>
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
            <strong style={{ color: "#f56a00" }}>1 TokiUSD</strong> = <strong style={{ color: "#fff", fontVariantNumeric: "tabular-nums" }}>₹{rate.toFixed(2)}</strong>
          </div>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
          {stat("₹" + vol + "M", "24h Volume", true)}
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
          {stat(transfers.toLocaleString(), "Total Settlements", true)}
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
          {stat("<30s", "Avg. Settle Time")}
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
          {stablecoinCards.map((c, i) => (
            <div key={i} className="card-shine" style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "30px 26px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>{c.icon}</div>
              <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, letterSpacing: "0.06em", marginBottom: 10, color: "#fff" }}>{c.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.40)", fontFamily: "'Syne',sans-serif" }}>{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Transfer calc */}
        <div style={{ marginTop: 56, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "36px 32px" }}>
          <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 26, letterSpacing: "0.08em", marginBottom: 6, color: "#fff" }}>Try the Transfer Calculator</h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Syne',sans-serif", marginBottom: 28 }}>See exactly what your recipient gets — powered by TokiUSD settlement.</p>
          <TransferCalc />
        </div>
      </div>
    </section>
  );
}
