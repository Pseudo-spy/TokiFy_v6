import React, { useState, useEffect, useCallback } from "react";

/* ─── DESIGN TOKENS ─── */
const C = {
  red:    "#e8210a",
  orange: "#f56a00",
  bg:     "#080808",
  muted:  "rgba(255,255,255,0.42)",
  faint:  "rgba(255,255,255,0.09)",
};

const glass = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};
const glassStrong = {
  background: "rgba(14,14,14,0.82)",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
};
const brandBtn = {
  background: "linear-gradient(135deg,#e8210a,#f56a00)",
  color: "#fff", border: "none", borderRadius: 14,
  fontFamily: "'Syne',sans-serif", fontWeight: 700,
  fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase",
  cursor: "pointer", transition: "transform .22s, box-shadow .22s",
};
const ghostBtn = {
  background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.75)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14,
  fontFamily: "'Syne',sans-serif", fontWeight: 600,
  fontSize: 14, letterSpacing: "0.07em", textTransform: "uppercase",
  cursor: "pointer", transition: "background .2s, border-color .2s",
};
const inp = {
  width: "100%", padding: "14px 16px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12, color: "#fff", fontFamily: "'Syne',sans-serif",
  fontSize: 14, outline: "none", transition: "border-color .2s",
};
const lbl = {
  display: "block", fontSize: 10, color: C.muted,
  letterSpacing: ".4em", textTransform: "uppercase",
  marginBottom: 8, fontFamily: "'Syne',sans-serif",
};

/* ─── STATIC FALLBACK RATES (INR base) ─── */
const FALLBACK_RATES = {
  USD: { rate: 83.24, sym: "$",   flag: "🇺🇸", label: "United States (USD)" },
  GBP: { rate: 106.1, sym: "£",   flag: "🇬🇧", label: "United Kingdom (GBP)" },
  AED: { rate: 22.65, sym: "د.إ", flag: "🇦🇪", label: "UAE (AED)" },
  CAD: { rate: 61.30, sym: "C$",  flag: "🇨🇦", label: "Canada (CAD)" },
  AUD: { rate: 54.80, sym: "A$",  flag: "🇦🇺", label: "Australia (AUD)" },
  SGD: { rate: 62.40, sym: "S$",  flag: "🇸🇬", label: "Singapore (SGD)" },
  EUR: { rate: 90.18, sym: "€",   flag: "🇩🇪", label: "Germany (EUR)" },
  JPY: { rate:  0.55, sym: "¥",   flag: "🇯🇵", label: "Japan (JPY)" },
};

/* ─── INITIAL TX HISTORY ─── */
const INIT_TXS = [
  { id: 1, name: "Rahul Sharma",  country: "United States", flag: "🇺🇸", amount: "₹12,500", foreign: "$150.24",   status: "completed",  date: "Today, 09:41 AM", tokenized: true  },
  { id: 2, name: "Priya Menon",   country: "United Kingdom",flag: "🇬🇧", amount: "₹8,200",  foreign: "£77.29",    status: "processing", date: "Today, 07:15 AM", tokenized: false },
  { id: 3, name: "Arjun Nair",    country: "UAE",           flag: "🇦🇪", amount: "₹5,000",  foreign: "AED 226.2", status: "completed",  date: "Yesterday",       tokenized: true  },
];

const TAG_STYLE = {
  completed:  { bg: "rgba(34,197,94,0.12)",  color: "#4ade80",  border: "1px solid rgba(34,197,94,0.25)"  },
  processing: { bg: "rgba(245,106,0,0.15)",  color: "#f56a00",  border: "1px solid rgba(245,106,0,0.3)"   },
  sent:       { bg: "rgba(232,33,10,0.10)",  color: "#f87171",  border: "1px solid rgba(232,33,10,0.22)"  },
};
function StatusTag({ status }) {
  const s = TAG_STYLE[status] || TAG_STYLE.sent;
  return (
    <span style={{ display:"inline-block", fontSize:9, letterSpacing:".32em", textTransform:"uppercase",
      padding:"3px 10px", borderRadius:20, fontWeight:700, fontFamily:"'Syne',sans-serif",
      background:s.bg, color:s.color, border:s.border }}>{status}</span>
  );
}

/* ─── BOTTOM NAV ─── */
function BottomNav({ page, setPage }) {
  const items = [
    { id:"home",     label:"Home",     icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id:"addmoney", label:"Add",      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
    { id:"send",     label:"Send",     icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> },
    { id:"withdraw", label:"Withdraw", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
    { id:"profile",  label:"Profile",  icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];
  return (
    <nav style={{ position:"sticky", bottom:0, padding:"0 4px", background:"rgba(8,8,8,0.94)",
      backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
      borderTop:"1px solid rgba(255,255,255,0.07)", zIndex:20 }}>
      <div style={{ display:"flex", justifyContent:"space-around" }}>
        {items.map(({ id, label, icon }) => {
          const active = page === id || (page === "status" && id === "send") || (page === "addmoney-processing" && id === "addmoney");
          return (
            <button key={id} onClick={() => setPage(id)} style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              padding:"13px 0", background:"transparent", border:"none", cursor:"pointer",
              color: active ? C.red : "rgba(255,255,255,0.38)", transition:"color .2s", position:"relative",
            }}>
              {active && <span style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:28, height:2, borderRadius:2, background:"linear-gradient(90deg,#e8210a,#f56a00)" }} />}
              {icon}
              <span style={{ fontSize:8, letterSpacing:".06em", textTransform:"uppercase", fontFamily:"'Syne',sans-serif", fontWeight: active ? 700 : 400 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════
   PAGE: HOME
═══════════════════════════════════════════════ */
function PageHome({ setPage, setActiveTx, walletBalance, txHistory, liveRates, ratesLoading }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? txHistory : txHistory.slice(0, 3);
  const usdRate = liveRates.USD?.rate || 83.24;

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:24 }}>
      {/* Header */}
      <div style={{ padding:"28px 24px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:30, letterSpacing:".07em",
            background:"linear-gradient(90deg,#fff,#f56a00)", WebkitBackgroundClip:"text",
            WebkitTextFillColor:"transparent", backgroundClip:"text" }}>TOKIFY</div>
          <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Welcome back, Soumili 👋</div>
        </div>
        <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#e8210a,#f56a00)",
          display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:15,
          cursor:"pointer", boxShadow:"0 0 18px rgba(232,33,10,0.32)" }}>S</div>
      </div>

      {/* Wallet Balance Card */}
      <div style={{ margin:"20px 20px 0", borderRadius:24, padding:"28px 24px 24px",
        position:"relative", overflow:"hidden",
        background:"linear-gradient(135deg,rgba(232,33,10,0.18) 0%,rgba(245,106,0,0.10) 50%,rgba(20,20,20,0.9) 100%)",
        border:"1px solid rgba(232,33,10,0.28)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
        boxShadow:"0 20px 60px rgba(232,33,10,0.12), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:180, height:180, borderRadius:"50%", background:"rgba(232,33,10,0.07)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-35, left:-25, width:120, height:120, borderRadius:"50%", background:"rgba(245,106,0,0.07)", pointerEvents:"none" }} />

        <div style={{ fontSize:10, letterSpacing:".46em", color:"rgba(255,255,255,0.45)", textTransform:"uppercase", marginBottom:10 }}>Platform Wallet Balance</div>
        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"clamp(44px,11vw,62px)", letterSpacing:".02em",
          background:"linear-gradient(135deg,#fff 20%,#e8210a 100%)", WebkitBackgroundClip:"text",
          WebkitTextFillColor:"transparent", backgroundClip:"text", lineHeight:1, marginBottom:6 }}>
          ₹{walletBalance.toLocaleString("en-IN")}<span style={{ fontSize:"clamp(20px,4vw,26px)" }}>.00</span>
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.32)", marginBottom:20, letterSpacing:".05em" }}>
          ≈ ${(walletBalance / usdRate).toFixed(2)} USD · Live rate
        </div>
        <div style={{ display:"flex", borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:16, gap:0 }}>
          {[
            { label:"Sent This Month", value:"₹32,400", color:"#fff" },
            { label:"Received",        value:"₹18,200", color:"#4ade80" },
            { label:"Active Tokens",   value:"3",        color:"#f56a00" },
          ].map((s,i) => (
            <div key={s.label} style={{ flex:1, paddingLeft: i>0?14:0, borderLeft: i>0?"1px solid rgba(255,255,255,0.08)":undefined, marginLeft: i>0?14:0 }}>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:".22em", textTransform:"uppercase", marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:14, fontWeight:700, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions Row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, margin:"14px 20px 0" }}>
        {/* Add Money */}
        <button style={{ ...brandBtn, padding:"16px 0", fontSize:11, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}
          onClick={() => setPage("addmoney")}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 36px rgba(232,33,10,0.38)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          Add Money
        </button>
        {/* Send Money */}
        <button style={{ ...ghostBtn, padding:"16px 0", fontSize:11, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}
          onClick={() => setPage("send")}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(232,33,10,0.08)"; e.currentTarget.style.borderColor="rgba(232,33,10,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          <span style={{ color:C.orange }}>Send</span>
        </button>
        {/* Withdraw */}
        <button style={{ ...ghostBtn, padding:"16px 0", fontSize:11, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}
          onClick={() => setPage("withdraw")}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.22)"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          Withdraw
        </button>
      </div>

      {/* Live Rate Ticker */}
      <div style={{ margin:"16px 20px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ fontSize:9, letterSpacing:".42em", color:C.red, textTransform:"uppercase" }}>Live Exchange Rates</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", display:"flex", alignItems:"center", gap:5 }}>
            {ratesLoading ? (
              <><span style={{ display:"inline-block", animation:"spin 1s linear infinite", fontSize:12 }}>⟳</span> Fetching...</>
            ) : (
              <><span style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", display:"inline-block" }} /> Live</>
            )}
          </div>
        </div>
        <div style={{ ...glass, borderRadius:16, padding:"14px 18px", display:"flex", gap:0, overflowX:"auto" }}>
          {Object.entries(liveRates).slice(0,6).map(([code, info], i) => (
            <div key={code} style={{ flexShrink:0, textAlign:"center", minWidth:70,
              borderLeft: i>0?"1px solid rgba(255,255,255,0.07)":undefined, paddingRight:14, paddingLeft:14 }}>
              <div style={{ fontSize:9, letterSpacing:".28em", color:C.muted, textTransform:"uppercase" }}>{info.flag} {code}</div>
              <div style={{ fontSize:13, fontWeight:700, marginTop:4 }}>₹{info.rate.toFixed(2)}</div>
              <div style={{ fontSize:10, color: info.change >= 0 ? "#4ade80" : "#f87171", marginTop:2 }}>
                {info.change >= 0 ? "+" : ""}{info.change?.toFixed(2) || "0.00"}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ margin:"18px 20px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ fontSize:9, letterSpacing:".42em", color:C.red, textTransform:"uppercase" }}>Recent Transactions</div>
          <button onClick={() => setShowAll(v => !v)} style={{ fontSize:11, color:"rgba(255,255,255,0.35)", background:"none", border:"none", cursor:"pointer", fontFamily:"'Syne',sans-serif" }}>
            {showAll ? "Show less" : "View all →"}
          </button>
        </div>
        <div style={{ ...glass, borderRadius:20, overflow:"hidden", position:"relative" }}>
          <div style={{ position:"absolute", top:-20, right:-20, width:90, height:90, borderRadius:"50%", border:"1px solid rgba(232,33,10,0.13)", pointerEvents:"none" }} />
          {visible.length === 0 && (
            <div style={{ padding:"28px 20px", textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:13 }}>No transactions yet</div>
          )}
          {visible.map((t, i) => (
            <div key={t.id}
              onClick={() => { setActiveTx(t); setPage("status"); }}
              style={{ padding:"15px 18px", display:"flex", justifyContent:"space-between", alignItems:"center",
                borderBottom: i < visible.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                cursor:"pointer", transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background=""}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ width:42, height:42, borderRadius:"50%", background:"rgba(255,255,255,0.06)",
                  border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:19, flexShrink:0 }}>{t.flag}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600 }}>{t.name}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{t.date} · {t.country}</div>
                </div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>{t.amount}</div>
                <div style={{ display:"flex", alignItems:"center", gap:5, justifyContent:"flex-end" }}>
                  <StatusTag status={t.status} />
                  {t.tokenized && <span style={{ fontSize:11 }}>⛓️</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE: ADD MONEY
═══════════════════════════════════════════════ */
function PageAddMoney({ setPage, onAddFunds }) {
  const [step, setStep] = useState(1); // 1=amount, 2=gateway redirect, 3=processing, 4=success
  const [amount, setAmount] = useState("");

  const amt = parseFloat(amount) || 0;

  function handleGatewayRedirect() {
    setStep(3);
    // Simulate Razorpay payment processing
    setTimeout(() => {
      setStep(4);
      onAddFunds(amt);
    }, 3000);
  }

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:24 }}>
      {/* Header */}
      <div style={{ padding:"28px 24px 0", display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={() => step > 1 && step < 3 ? setStep(s => s-1) : setPage("home")}
          style={{ ...ghostBtn, width:38, height:38, padding:0, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>←</button>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:28, letterSpacing:".05em" }}>Add Money</div>
          <div style={{ fontSize:11, color:C.muted }}>
            {step===1 ? "Load your platform wallet" : step===2 ? "Pay via Razorpay" : step===3 ? "Processing payment…" : "Wallet funded!"}
          </div>
        </div>
      </div>

      {/* Step bar */}
      <div style={{ display:"flex", gap:6, padding:"14px 24px 0" }}>
        {[1,2,3].map(s => (
          <div key={s} style={{ height:3, flex:1, borderRadius:3,
            background: s <= Math.min(step, 3) ? "linear-gradient(90deg,#e8210a,#f56a00)" : "rgba(255,255,255,0.1)",
            transition:"background .3s" }} />
        ))}
      </div>

      <div style={{ padding:"22px 20px 0" }}>

        {/* STEP 1 — ENTER AMOUNT */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Amount to Add (₹)</label>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.4)", fontSize:20 }}>₹</div>
                <input type="number" style={{ ...inp, paddingLeft:38, fontSize:28, fontWeight:700 }}
                  placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                  onFocus={e => e.target.style.borderColor="rgba(232,33,10,0.5)"}
                  onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"} />
              </div>
            </div>

            {/* Quick chips */}
            <div style={{ display:"flex", gap:8, marginBottom:22 }}>
              {["1000","5000","10000","25000","50000"].map(v => (
                <button key={v} onClick={() => setAmount(v)}
                  style={{ ...ghostBtn, flex:1, padding:"10px 0", fontSize:11, borderRadius:10,
                    borderColor: amount === v ? "rgba(232,33,10,0.5)" : undefined,
                    background: amount === v ? "rgba(232,33,10,0.08)" : undefined }}>
                  ₹{parseInt(v).toLocaleString("en-IN")}
                </button>
              ))}
            </div>

            {/* Info card */}
            <div style={{ ...glass, borderRadius:18, padding:"18px 20px", marginBottom:22,
              border:"1px solid rgba(232,33,10,0.15)", background:"rgba(232,33,10,0.03)" }}>
              <div style={{ fontSize:10, letterSpacing:".38em", color:C.red, textTransform:"uppercase", marginBottom:14 }}>How it works</div>
              {[
                ["Step 1", "Enter the amount you want to load"],
                ["Step 2", "Complete payment via Razorpay (UPI / Cards / NetBanking)"],
                ["Step 3", "Funds credited instantly to your platform wallet"],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ fontSize:9, letterSpacing:".3em", color:C.orange, textTransform:"uppercase", minWidth:44, paddingTop:2 }}>{k}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)", lineHeight:1.6 }}>{v}</div>
                </div>
              ))}
            </div>

            {amt > 0 && (
              <div style={{ ...glass, borderRadius:16, padding:"14px 18px", marginBottom:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:C.muted }}>
                  <span>You Pay</span><span style={{ color:"#fff", fontWeight:700 }}>₹{amt.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:C.muted, marginTop:8 }}>
                  <span>Processing Fee</span><span style={{ color:"#4ade80", fontWeight:600 }}>₹0 (Free)</span>
                </div>
                <div style={{ height:1, background:"rgba(255,255,255,0.07)", margin:"10px 0" }} />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, fontWeight:700 }}>
                  <span>Wallet Credit</span><span style={{ color:C.orange }}>₹{amt.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}

            <button style={{ ...brandBtn, width:"100%", padding:18, opacity: amt > 0 ? 1 : 0.45 }}
              disabled={amt <= 0} onClick={() => amt > 0 && setStep(2)}
              onMouseEnter={e => amt>0 && (e.currentTarget.style.transform="translateY(-2px)", e.currentTarget.style.boxShadow="0 12px 36px rgba(232,33,10,0.38)")}
              onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
              Continue to Payment →
            </button>
          </div>
        )}

        {/* STEP 2 — RAZORPAY REDIRECT */}
        {step === 2 && (
          <div>
            {/* Razorpay card */}
            <div style={{ ...glassStrong, borderRadius:22, overflow:"hidden", marginBottom:20,
              border:"1px solid rgba(255,255,255,0.12)" }}>
              {/* Razorpay header */}
              <div style={{ background:"#072654", padding:"20px 22px", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:"rgba(255,255,255,0.12)",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M4 4h16v16H4z" opacity="0.2"/><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <div>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:20, letterSpacing:".06em", color:"#fff" }}>RAZORPAY</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>Secure Payment Gateway</div>
                </div>
                <div style={{ marginLeft:"auto", fontSize:10, color:"rgba(255,255,255,0.4)", textAlign:"right" }}>
                  <div>🔒 256-bit SSL</div>
                  <div>PCI DSS</div>
                </div>
              </div>

              {/* Order summary */}
              <div style={{ padding:"20px 22px" }}>
                <div style={{ fontSize:10, letterSpacing:".38em", color:C.muted, textTransform:"uppercase", marginBottom:14 }}>Order Summary</div>
                {[
                  ["Merchant", "Tokify Payments Pvt. Ltd."],
                  ["Purpose",  "Wallet Top-up"],
                  ["Amount",   `₹${amt.toLocaleString("en-IN")}`],
                  ["Order ID", `TKF-${Date.now().toString().slice(-8)}`],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:10 }}>
                    <span style={{ color:C.muted }}>{k}</span>
                    <span style={{ fontWeight:600, color: k==="Amount" ? C.orange : "#fff" }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Payment methods */}
              <div style={{ padding:"0 22px 20px" }}>
                <div style={{ fontSize:10, letterSpacing:".38em", color:C.muted, textTransform:"uppercase", marginBottom:12 }}>Pay With</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {[
                    { label:"UPI", icon:"📲", active:true },
                    { label:"Cards", icon:"💳", active:false },
                    { label:"NetBanking", icon:"🏦", active:false },
                  ].map(m => (
                    <div key={m.label} style={{ ...glass, borderRadius:12, padding:"12px 8px", textAlign:"center",
                      borderColor: m.active ? "rgba(232,33,10,0.4)" : undefined,
                      background: m.active ? "rgba(232,33,10,0.07)" : undefined }}>
                      <div style={{ fontSize:18, marginBottom:4 }}>{m.icon}</div>
                      <div style={{ fontSize:10, color: m.active ? "#fff" : C.muted, fontWeight: m.active ? 700 : 400 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ fontSize:11, color:"rgba(255,255,255,0.22)", textAlign:"center", marginBottom:20, lineHeight:1.7 }}>
              You will be redirected to Razorpay's secure checkout to complete the payment of <strong style={{ color:"#fff" }}>₹{amt.toLocaleString("en-IN")}</strong>. Once successful, funds will be instantly credited to your Tokify wallet.
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button style={{ ...ghostBtn, flex:1, padding:16 }} onClick={() => setStep(1)}>Back</button>
              <button style={{ ...brandBtn, flex:2, padding:16 }} onClick={handleGatewayRedirect}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 36px rgba(232,33,10,0.38)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
                Pay ₹{amt.toLocaleString("en-IN")} via Razorpay →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — PROCESSING */}
        {step === 3 && (
          <div style={{ textAlign:"center", paddingTop:40 }}>
            <div style={{ width:80, height:80, borderRadius:"50%", margin:"0 auto 24px",
              background:"rgba(245,106,0,0.1)", border:"2px solid rgba(245,106,0,0.3)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:34, animation:"spin 1.2s linear infinite" }}>⟳</div>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:30, letterSpacing:".05em", marginBottom:8 }}>Processing Payment</div>
            <div style={{ fontSize:13, color:C.muted, lineHeight:1.7 }}>
              Verifying your payment with Razorpay...<br/>
              Please do not close this window.
            </div>
            <div style={{ ...glass, borderRadius:16, padding:"16px 20px", marginTop:28, textAlign:"left" }}>
              {["Contacting Razorpay gateway", "Verifying transaction", "Crediting to wallet"].map((step, i) => (
                <div key={step} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <span style={{ fontSize:14, animation: i < 2 ? "spin 1s linear infinite" : undefined }}>
                    {i === 0 ? "✓" : i === 1 ? "⟳" : "○"}
                  </span>
                  <span style={{ fontSize:12, color: i === 0 ? "#4ade80" : i === 1 ? C.orange : C.muted }}>{step}</span>
                </div>
              ))}
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* STEP 4 — SUCCESS */}
        {step === 4 && (
          <div style={{ textAlign:"center", paddingTop:32 }}>
            <div style={{ width:88, height:88, borderRadius:"50%", margin:"0 auto 22px",
              background:"rgba(74,222,128,0.1)", border:"2px solid rgba(74,222,128,0.35)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:38,
              boxShadow:"0 0 40px rgba(74,222,128,0.15)", color:"#4ade80" }}>✓</div>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:32, letterSpacing:".05em", marginBottom:8 }}>Payment Successful!</div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:28, lineHeight:1.7 }}>
              ₹{amt.toLocaleString("en-IN")} has been credited to your<br/>Tokify platform wallet.
            </div>
            <div style={{ ...glass, borderRadius:18, padding:"20px 22px", marginBottom:22,
              border:"1px solid rgba(74,222,128,0.2)", background:"rgba(74,222,128,0.04)" }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:44, letterSpacing:".02em",
                background:"linear-gradient(135deg,#4ade80,#22c55e)", WebkitBackgroundClip:"text",
                WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:4 }}>
                +₹{amt.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.38)", letterSpacing:".12em" }}>ADDED TO WALLET</div>
            </div>
            <button style={{ ...brandBtn, width:"100%", padding:18 }} onClick={() => setPage("home")}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 36px rgba(232,33,10,0.38)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
              Back to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE: SEND MONEY
═══════════════════════════════════════════════ */
function PageSend({ setPage, setActiveTx, walletBalance, liveRates }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount]       = useState("");
  const [country, setCountry]     = useState("");
  const [recvName, setRecvName]   = useState("");
  const [recvBank, setRecvBank]   = useState("");
  const [recvSwift, setRecvSwift] = useState("");
  const [rateLoading, setRateLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [paying, setPaying]       = useState(false);

  const REMITTANCE_FEE_PCT = 0.02; // 2%

  const selected = country ? { code: country, ...liveRates[country] } : null;
  const amt = parseFloat(amount) || 0;
  const remittanceFee = amt > 0 ? +(amt * REMITTANCE_FEE_PCT).toFixed(2) : 0;
  const amtAfterFee = amt - remittanceFee;
  const recvAmt = selected && amt > 0 ? (amtAfterFee / selected.rate).toFixed(4) : null;

  // Token calculation: each token = 1 unit of destination currency (stablecoin pegged to forex)
  // tokens = (amt_inr - 2% fee) / inr_per_unit_of_dest_currency
  const tokenAmt = recvAmt ? parseFloat(recvAmt).toFixed(4) : null;
  const tokenSymbol = selected ? `TKF-${country}` : "TKF";

  const insufficientFunds = amt > walletBalance;
  const canProceed = amt > 0 && country && recvName.trim() && !insufficientFunds;

  function handleConfirmPayment() {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      const tx = {
        id: Date.now(),
        name: recvName || "Recipient",
        country: selected?.label || country,
        flag: selected?.flag || "🌍",
        amount: `₹${amt.toLocaleString("en-IN")}`,
        foreign: recvAmt ? `${selected.sym}${parseFloat(recvAmt).toFixed(2)}` : "",
        status: "processing", date: "Just now", tokenized: false,
        rawAmt: amt, rawRecv: parseFloat(recvAmt).toFixed(2), rawSym: selected?.sym,
        tokenAmt, tokenSymbol, remittanceFee,
      };
      setActiveTx(tx);
      setPage("tokenizing");
    }, 2400);
  }

  const stepLabels = ["Transfer Details", "Review Tokenization", "Confirm Tokenization"];

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:24 }}>
      <div style={{ padding:"28px 24px 0", display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={() => step > 1 ? setStep(s => s-1) : setPage("home")}
          style={{ ...ghostBtn, width:38, height:38, padding:0, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>←</button>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:28, letterSpacing:".05em" }}>Send Money</div>
          <div style={{ fontSize:11, color:C.muted }}>{stepLabels[step-1]}</div>
        </div>
      </div>

      {/* Step bar */}
      <div style={{ display:"flex", gap:6, padding:"14px 24px 0" }}>
        {[1,2,3].map(s => (
          <div key={s} style={{ height:3, flex:1, borderRadius:3,
            background: s<=step ? "linear-gradient(90deg,#e8210a,#f56a00)" : "rgba(255,255,255,0.1)",
            transition:"background .3s" }} />
        ))}
      </div>

      <div style={{ padding:"22px 20px 0" }}>

        {/* ── STEP 1: FORM ── */}
        {step === 1 && (
          <div>
            {/* Wallet balance pill */}
            <div style={{ ...glass, borderRadius:12, padding:"12px 16px", marginBottom:20,
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, color:C.muted }}>Available Balance</span>
              <span style={{ fontSize:14, fontWeight:700, color: insufficientFunds ? "#f87171" : "#4ade80" }}>
                ₹{walletBalance.toLocaleString("en-IN")}
              </span>
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Amount to Send (₹)</label>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.4)", fontSize:20 }}>₹</div>
                <input type="number" style={{ ...inp, paddingLeft:38, fontSize:26, fontWeight:700,
                  borderColor: insufficientFunds ? "rgba(248,113,113,0.5)" : undefined }}
                  placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                  onFocus={e => e.target.style.borderColor = insufficientFunds ? "rgba(248,113,113,0.5)" : "rgba(232,33,10,0.5)"}
                  onBlur={e => e.target.style.borderColor = insufficientFunds ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"} />
              </div>
              {insufficientFunds && (
                <div style={{ fontSize:11, color:"#f87171", marginTop:6, display:"flex", alignItems:"center", gap:6 }}>
                  ⚠ Insufficient balance. <button onClick={() => setPage("addmoney")}
                    style={{ background:"none", border:"none", color:C.orange, cursor:"pointer", fontFamily:"'Syne',sans-serif", fontSize:11, textDecoration:"underline" }}>Add Money</button>
                </div>
              )}
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Destination Country</label>
              <select style={{ ...inp, appearance:"none", cursor:"pointer",
                backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.4)'/%3E%3C/svg%3E\")",
                backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center", paddingRight:36 }}
                value={country} onChange={e => setCountry(e.target.value)}>
                <option value="">— Select Country —</option>
                {Object.entries(liveRates).map(([code, info]) => (
                  <option key={code} value={code}>{info.flag} {info.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Receiver Full Name</label>
              <input type="text" style={inp} placeholder="John Doe" value={recvName}
                onChange={e => setRecvName(e.target.value)}
                onFocus={e => e.target.style.borderColor="rgba(232,33,10,0.5)"}
                onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"} />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
              <div>
                <label style={lbl}>Bank / IBAN</label>
                <input type="text" style={inp} placeholder="Account / IBAN" value={recvBank}
                  onChange={e => setRecvBank(e.target.value)}
                  onFocus={e => e.target.style.borderColor="rgba(232,33,10,0.5)"}
                  onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"} />
              </div>
              <div>
                <label style={lbl}>SWIFT / IFSC</label>
                <input type="text" style={inp} placeholder="Code" value={recvSwift}
                  onChange={e => setRecvSwift(e.target.value)}
                  onFocus={e => e.target.style.borderColor="rgba(232,33,10,0.5)"}
                  onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"} />
              </div>
            </div>

            {/* Live breakdown with real rates */}
            {selected && amt > 0 && (
              <div style={{ ...glass, borderRadius:18, padding:"18px 20px", marginBottom:22,
                border:"1px solid rgba(232,33,10,0.2)", background:"rgba(232,33,10,0.04)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div style={{ fontSize:10, letterSpacing:".4em", color:C.red, textTransform:"uppercase" }}>Live Transfer Breakdown</div>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:5, height:5, borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />
                    Real-time rate
                  </div>
                </div>
                {[
                  ["You Send",      `₹${amt.toLocaleString("en-IN")}`, "#fff"],
                  ["Remittance Fee (2%)", `– ₹${remittanceFee.toFixed(2)}`, "#f87171"],
                  ["After Fee",     `₹${amtAfterFee.toLocaleString("en-IN")}`, "#fff"],
                  ["Live Rate",     `1 INR = ${(1/selected.rate).toFixed(6)} ${country}`, C.muted],
                  ["Processing",    "~15 seconds", "#4ade80"],
                ].map(([k,v,c]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"rgba(255,255,255,0.55)", marginBottom:9 }}>
                    <span>{k}</span><span style={{ color:c, fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ height:1, background:"rgba(255,255,255,.07)", margin:"8px 0 12px" }} />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:18, fontWeight:700 }}>
                  <span>Receiver Gets</span>
                  <span style={{ color:C.orange }}>{selected.sym}{parseFloat(recvAmt).toFixed(2)}</span>
                </div>
              </div>
            )}

            <button style={{ ...brandBtn, width:"100%", padding:18, opacity: canProceed ? 1 : 0.45 }}
              disabled={!canProceed}
              onClick={() => canProceed && setStep(2)}
              onMouseEnter={e => canProceed && (e.currentTarget.style.transform="translateY(-2px)", e.currentTarget.style.boxShadow="0 12px 36px rgba(232,33,10,0.38)")}
              onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
              Review Tokenization →
            </button>
          </div>
        )}

        {/* ── STEP 2: REVIEW TOKENIZATION ── */}
        {step === 2 && selected && (
          <div>
            {/* Transfer summary */}
            <div style={{ ...glassStrong, borderRadius:22, padding:"24px 22px", marginBottom:16,
              border:"1px solid rgba(232,33,10,0.22)",
              background:"linear-gradient(135deg,rgba(232,33,10,0.1) 0%,rgba(14,14,14,0.9) 100%)" }}>
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:42, letterSpacing:".02em",
                  background:"linear-gradient(135deg,#fff,#e8210a)", WebkitBackgroundClip:"text",
                  WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                  ₹{amt.toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize:12, color:C.muted }}>→ {selected.sym}{parseFloat(recvAmt).toFixed(2)} to {recvName}</div>
              </div>
              {[
                ["To",               recvName],
                ["Country",          selected.label],
                ["Live Exchange Rate",`1 INR = ${(1/selected.rate).toFixed(6)} ${country}`],
                ["Remittance Fee",   `₹${remittanceFee.toFixed(2)} (2%)`],
                ["After Deductions", `₹${amtAfterFee.toLocaleString("en-IN")}`],
                ["Receiver Gets",    `${selected.sym}${parseFloat(recvAmt).toFixed(2)}`],
              ].map(([k,v],i) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"10px 0", borderTop: i>0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <span style={{ fontSize:12, color:C.muted }}>{k}</span>
                  <span style={{ fontSize:13, fontWeight:600, color: k==="Receiver Gets" ? C.orange : k==="Remittance Fee" ? "#f87171" : "#fff" }}>{v}</span>
                </div>
              ))}
            </div>

            {/* ⛓️ TOKENIZATION SECTION — the star of this step */}
            <div style={{ borderRadius:22, padding:"22px 22px", marginBottom:16,
              background:"linear-gradient(135deg,rgba(232,33,10,0.08) 0%,rgba(14,14,14,0.85) 100%)",
              border:"1px solid rgba(232,33,10,0.3)",
              backdropFilter:"blur(22px)", WebkitBackdropFilter:"blur(22px)" }}>

              {/* Chain icon + label */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
                  background:"linear-gradient(135deg,#e8210a,#f56a00)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 6px 20px rgba(232,33,10,0.35)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:20, letterSpacing:".06em" }}>Tokenization Preview</div>
                  <div style={{ fontSize:11, color:C.muted }}>Stablecoin tokens you will receive</div>
                </div>
              </div>

              {/* Token amount display */}
              <div style={{ ...glass, borderRadius:16, padding:"20px 20px", marginBottom:16,
                border:"1px solid rgba(232,33,10,0.2)", background:"rgba(232,33,10,0.05)",
                textAlign:"center" }}>
                <div style={{ fontSize:10, letterSpacing:".4em", color:C.muted, textTransform:"uppercase", marginBottom:10 }}>Token Amount</div>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:48, letterSpacing:".02em",
                  background:"linear-gradient(135deg,#f56a00,#e8210a)", WebkitBackgroundClip:"text",
                  WebkitTextFillColor:"transparent", backgroundClip:"text", lineHeight:1 }}>
                  {parseFloat(tokenAmt).toFixed(2)}
                </div>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:18, letterSpacing:".12em", color:"rgba(255,255,255,0.5)", marginTop:4 }}>
                  {tokenSymbol} Tokens
                </div>
                <div style={{ height:1, background:"rgba(255,255,255,0.07)", margin:"14px 0" }} />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0 }}>
                  {[
                    { label:"Peg", value:`1:1 ${country}` },
                    { label:"Chain", value:"Polygon" },
                    { label:"Standard", value:"ERC-20" },
                  ].map((d,i) => (
                    <div key={d.label} style={{ textAlign:"center",
                      borderLeft: i>0 ? "1px solid rgba(255,255,255,0.07)" : "none", paddingLeft: i>0 ? 12 : 0 }}>
                      <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:".3em", textTransform:"uppercase", marginBottom:4 }}>{d.label}</div>
                      <div style={{ fontSize:12, fontWeight:700, color:C.orange }}>{d.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation breakdown */}
              <div style={{ fontSize:11, color:C.muted, lineHeight:1.9, marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span>INR Sent</span><span style={{ color:"#fff" }}>₹{amt.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span>2% Remittance Fee</span><span style={{ color:"#f87171" }}>– ₹{remittanceFee.toFixed(2)}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span>Net Amount</span><span style={{ color:"#fff" }}>₹{amtAfterFee.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span>Live Rate (INR→{country})</span><span style={{ color:"#fff" }}>{selected.rate.toFixed(4)}</span>
                </div>
                <div style={{ height:1, background:"rgba(255,255,255,0.07)", margin:"6px 0" }} />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:700 }}>
                  <span style={{ color:C.orange }}>Tokens Minted</span>
                  <span style={{ color:C.orange }}>{parseFloat(tokenAmt).toFixed(4)} {tokenSymbol}</span>
                </div>
              </div>

              {/* Explicit consent checkbox */}
              <div style={{ ...glass, borderRadius:14, padding:"16px 18px",
                border: consentChecked ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,255,255,0.12)",
                cursor:"pointer", transition:"all .2s" }}
                onClick={() => setConsentChecked(v => !v)}>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:20, height:20, minWidth:20, borderRadius:5, marginTop:1,
                    border: `2px solid ${consentChecked ? "#4ade80" : "rgba(255,255,255,0.3)"}`,
                    background: consentChecked ? "rgba(74,222,128,0.15)" : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>
                    {consentChecked && <span style={{ color:"#4ade80", fontSize:13, lineHeight:1 }}>✓</span>}
                  </div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", lineHeight:1.7 }}>
                    I consent to tokenizing this remittance. I understand that <strong style={{ color:"#fff" }}>{parseFloat(tokenAmt).toFixed(4)} {tokenSymbol}</strong> stablecoin tokens will be minted on Polygon, pegged 1:1 to {country}, and subject to Tokify's tokenization terms.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize:11, color:"rgba(255,255,255,0.22)", textAlign:"center", marginBottom:18 }}>
              🔒 256-bit SSL · PCI DSS Compliant · RBI Regulated
            </div>

            <button style={{ ...brandBtn, width:"100%", padding:18, opacity: consentChecked ? 1 : 0.4 }}
              disabled={!consentChecked}
              onClick={() => consentChecked && setStep(3)}
              onMouseEnter={e => consentChecked && (e.currentTarget.style.transform="translateY(-2px)", e.currentTarget.style.boxShadow="0 12px 36px rgba(232,33,10,0.38)")}
              onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
              {consentChecked ? "Confirm Tokenization →" : "Accept Terms to Continue"}
            </button>
          </div>
        )}

        {/* ── STEP 3: CONFIRM TOKENIZATION ── */}
        {step === 3 && (
          <div>
            {/* Big chain visual */}
            <div style={{ textAlign:"center", marginBottom:22 }}>
              <div style={{ width:72, height:72, borderRadius:"50%", margin:"0 auto 16px",
                background:"linear-gradient(135deg,#e8210a,#f56a00)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 0 40px rgba(232,33,10,0.45)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:26, letterSpacing:".06em" }}>Ready to Tokenize</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>This action is irreversible once confirmed</div>
            </div>

            <div style={{ ...glass, borderRadius:18, padding:"18px 20px", marginBottom:20,
              border:"1px solid rgba(232,33,10,0.2)" }}>
              <div style={{ fontSize:10, letterSpacing:".38em", color:C.red, textTransform:"uppercase", marginBottom:14 }}>Tokenization Summary</div>
              {[
                ["Send",         `₹${amt.toLocaleString("en-IN")}`],
                ["To",           recvName],
                ["Country",      selected?.label],
                ["Remit. Fee",   `₹${remittanceFee.toFixed(2)} (2%)`],
                ["Tokens",       `${parseFloat(tokenAmt).toFixed(4)} ${tokenSymbol}`],
                ["Chain",        "Polygon · ERC-20"],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:10 }}>
                  <span style={{ color:C.muted }}>{k}</span>
                  <span style={{ fontWeight:600, color: k==="Tokens" ? C.orange : k==="Remit. Fee" ? "#f87171" : "#fff" }}>{v}</span>
                </div>
              ))}
            </div>

            {!paying ? (
              <button style={{ ...brandBtn, width:"100%", padding:20, fontSize:16, letterSpacing:".12em",
                boxShadow:"0 0 28px rgba(232,33,10,0.28)" }}
                onClick={handleConfirmPayment}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 16px 44px rgba(232,33,10,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 0 28px rgba(232,33,10,0.28)"; }}>
                ⛓️ Confirm Tokenization
              </button>
            ) : (
              <div style={{ ...glass, borderRadius:18, padding:"22px 20px", textAlign:"center",
                border:"1px solid rgba(245,106,0,0.25)", background:"rgba(245,106,0,0.06)" }}>
                <div style={{ fontSize:36, marginBottom:12, display:"inline-block", animation:"spin 1s linear infinite" }}>⟳</div>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:22, letterSpacing:".05em", marginBottom:6 }}>Initiating Tokenization</div>
                <div style={{ fontSize:12, color:C.muted }}>Broadcasting to Polygon…</div>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE: TOKENIZING — fullscreen video + overlay
═══════════════════════════════════════════════ */
function PageTokenizing({ setPage, tx, onStoreInWallet }) {
  const [phase, setPhase] = useState("tokenizing"); // tokenizing | successful
  const videoRef = React.useRef(null);

  useEffect(() => {
    // Phase 1: tokenizing for 4 seconds → then successful
    const t1 = setTimeout(() => setPhase("successful"), 4500);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* ── VIDEO LAYER (orange+black tinted, looping) ── */}
      <video
        ref={videoRef}
        src="/tokify-coins.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          // Orange & black color grading: saturate + sepia + hue-rotate
          filter: "sepia(1) saturate(3.5) hue-rotate(-10deg) brightness(0.85) contrast(1.3)",
        }}
      />

      {/* ── Dark overlay to make text readable ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.6) 100%)",
      }} />

      {/* ── Scanline texture ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      }} />

      {/* ── TOKIFY text on coins — absolute positioned to look burned in ── */}
      {/* Top-left coin watermark */}
      <div style={{
        position: "absolute", top: "18%", left: "50%", transform: "translateX(-50%)",
        fontFamily: "'Bebas Neue',cursive", fontSize: "clamp(18px,5vw,26px)",
        letterSpacing: "0.5em", color: "rgba(245,106,0,0.7)",
        textShadow: "0 0 12px rgba(245,106,0,0.8), 0 0 30px rgba(232,33,10,0.4)",
        pointerEvents: "none", userSelect: "none",
        animation: "coinPulse 2s ease-in-out infinite",
      }}>TOKIFY</div>

      {/* ── MAIN OVERLAY TEXT ── */}
      <div style={{
        position: "relative", zIndex: 2, textAlign: "center",
        padding: "0 32px",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>

        {phase === "tokenizing" && (
          <>
            {/* Spinning chain ring */}
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              border: "3px solid rgba(245,106,0,0.25)",
              borderTop: "3px solid #f56a00",
              borderRight: "3px solid #e8210a",
              animation: "spin 1s linear infinite",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 28,
              boxShadow: "0 0 40px rgba(232,33,10,0.4), inset 0 0 20px rgba(245,106,0,0.08)",
            }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#f56a00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: "spin 2s linear infinite reverse" }}>
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
            </div>

            <div style={{
              fontFamily: "'Bebas Neue',cursive",
              fontSize: "clamp(38px,10vw,56px)",
              letterSpacing: ".1em",
              color: "#fff",
              textShadow: "0 0 60px rgba(232,33,10,0.7), 0 0 120px rgba(245,106,0,0.3)",
              lineHeight: 1,
              marginBottom: 12,
            }}>
              Tokenizing
              <span style={{ animation: "dots 1.5s steps(3,end) infinite" }}>...</span>
            </div>

            <div style={{
              fontSize: 14, color: "rgba(255,255,255,0.65)",
              letterSpacing: ".15em", textTransform: "uppercase",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            }}>
              Minting on Polygon Blockchain
            </div>

            {/* Token amount pulsing */}
            <div style={{
              marginTop: 28, padding: "12px 28px",
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(245,106,0,0.4)",
              borderRadius: 40,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, letterSpacing: ".1em",
                color: "#f56a00", textShadow: "0 0 20px rgba(245,106,0,0.8)" }}>
                {parseFloat(tx?.tokenAmt || 0).toFixed(4)} {tx?.tokenSymbol || "TKF-USD"}
              </div>
            </div>
          </>
        )}

        {phase === "successful" && (
          <>
            {/* Success checkmark burst */}
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "linear-gradient(135deg,rgba(74,222,128,0.15),rgba(34,197,94,0.08))",
              border: "3px solid #4ade80",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 28,
              boxShadow: "0 0 50px rgba(74,222,128,0.5), 0 0 100px rgba(74,222,128,0.2)",
              animation: "successPop .5s cubic-bezier(.17,.67,.38,1.4) both",
            }}>
              <span style={{ fontSize: 46, color: "#4ade80",
                textShadow: "0 0 20px rgba(74,222,128,0.9)" }}>✓</span>
            </div>

            <div style={{
              fontFamily: "'Bebas Neue',cursive",
              fontSize: "clamp(42px,11vw,62px)",
              letterSpacing: ".08em",
              color: "#4ade80",
              textShadow: "0 0 60px rgba(74,222,128,0.7), 0 0 120px rgba(74,222,128,0.3)",
              lineHeight: 1, marginBottom: 10,
              animation: "successPop .6s .1s cubic-bezier(.17,.67,.38,1.4) both",
            }}>
              Successful!
            </div>

            <div style={{
              fontSize: 14, color: "rgba(255,255,255,0.65)",
              letterSpacing: ".15em", textTransform: "uppercase",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              marginBottom: 22,
            }}>
              Token Minted · Remittance Sent
            </div>

            {/* Token ID badge */}
            <div style={{
              padding: "10px 22px",
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(74,222,128,0.4)",
              borderRadius: 40,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              marginBottom: 28,
            }}>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18, letterSpacing: ".1em",
                color: "#4ade80", textShadow: "0 0 16px rgba(74,222,128,0.8)" }}>
                {parseFloat(tx?.tokenAmt || 0).toFixed(4)} {tx?.tokenSymbol || "TKF-USD"}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 2, letterSpacing: ".1em" }}>
                ID: TKF-{String(Date.now()).slice(-6)}
              </div>
            </div>

            {/* Back to Dashboard */}
            <button
              onClick={() => setPage("home")}
              style={{
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(245,106,0,0.5)",
                color: "#f56a00", borderRadius: 14,
                fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13,
                letterSpacing: ".1em", textTransform: "uppercase",
                cursor: "pointer", padding: "14px 32px",
                backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                transition: "background .2s, border-color .2s, transform .2s",
                textShadow: "0 0 12px rgba(245,106,0,0.6)",
                width: "100%", maxWidth: 280,
              }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(245,106,0,0.15)"; e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(0,0,0,0.6)"; e.currentTarget.style.transform=""; }}>
              Back to Dashboard →
            </button>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:10, width:"100%", maxWidth:280, margin:"14px 0 4px" }}>
              <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.12)" }} />
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:".2em", textTransform:"uppercase" }}>or</span>
              <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.12)" }} />
            </div>

            {/* Store in Wallet + Send Tokens */}
            <div style={{ display:"flex", flexDirection:"column", gap:10, width:"100%", maxWidth:280 }}>
              <button
                onClick={() => { onStoreInWallet(tx); setPage("tokenWallet"); }}
                style={{
                  background: "rgba(0,0,0,0.65)",
                  border: "1px solid rgba(74,222,128,0.5)",
                  color: "#4ade80", borderRadius: 14,
                  fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13,
                  letterSpacing: ".1em", textTransform: "uppercase",
                  cursor: "pointer", padding: "14px 0",
                  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                  transition: "background .2s, transform .2s",
                  textShadow: "0 0 12px rgba(74,222,128,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(74,222,128,0.1)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(0,0,0,0.65)"; e.currentTarget.style.transform=""; }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-4 0v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
                </svg>
                Store in Wallet
              </button>

              <button
                onClick={() => { onStoreInWallet(tx); setPage("sendTokens"); }}
                style={{
                  background: "rgba(0,0,0,0.65)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.75)", borderRadius: 14,
                  fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13,
                  letterSpacing: ".1em", textTransform: "uppercase",
                  cursor: "pointer", padding: "14px 0",
                  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                  transition: "background .2s, transform .2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(0,0,0,0.65)"; e.currentTarget.style.transform=""; }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Send Tokens
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes dots {
          0%,20%  { content: '.';   }
          40%     { content: '..';  }
          60%,100%{ content: '...'; }
        }
        @keyframes coinPulse {
          0%,100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
          50%     { opacity: 1;   transform: translateX(-50%) scale(1.04); }
        }
        @keyframes successPop {
          0%   { opacity:0; transform:scale(0.6); }
          100% { opacity:1; transform:scale(1); }
        }
        .tokenizing-dots::after {
          content: '...';
          animation: dots 1.5s steps(3,end) infinite;
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE: TOKEN WALLET
═══════════════════════════════════════════════ */
function PageTokenWallet({ setPage, tokenStore }) {
  const totalTokens = tokenStore.reduce((sum, t) => sum + parseFloat(t.amt), 0);
  const grouped = tokenStore.reduce((acc, t) => {
    const key = t.symbol;
    if (!acc[key]) acc[key] = { symbol: key, flag: t.flag, country: t.country, total: 0, items: [] };
    acc[key].total += parseFloat(t.amt);
    acc[key].items.push(t);
    return acc;
  }, {});

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:24 }}>
      {/* Header */}
      <div style={{ padding:"28px 24px 0", display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={() => setPage("home")}
          style={{ ...ghostBtn, width:38, height:38, padding:0, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>←</button>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:28, letterSpacing:".05em" }}>Token Wallet</div>
          <div style={{ fontSize:11, color:C.muted }}>Your on-chain stablecoin holdings</div>
        </div>
      </div>

      {/* Main wallet card — the "hardware wallet" design */}
      <div style={{ margin:"22px 20px 0", position:"relative" }}>
        {/* Card body */}
        <div style={{
          borderRadius:28, padding:"32px 28px",
          background:"linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 40%, #111 100%)",
          border:"1px solid rgba(245,106,0,0.35)",
          boxShadow:"0 24px 80px rgba(232,33,10,0.18), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)",
          position:"relative", overflow:"hidden",
        }}>
          {/* Card circuit lines */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", opacity:0.12 }}>
            <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
              <line x1="0" y1="50" x2="400" y2="50" stroke="#f56a00" strokeWidth="0.5" strokeDasharray="4 8"/>
              <line x1="0" y1="150" x2="400" y2="150" stroke="#e8210a" strokeWidth="0.5" strokeDasharray="6 10"/>
              <line x1="100" y1="0" x2="100" y2="200" stroke="#f56a00" strokeWidth="0.5" strokeDasharray="3 6"/>
              <line x1="300" y1="0" x2="300" y2="200" stroke="#e8210a" strokeWidth="0.5" strokeDasharray="4 8"/>
              <circle cx="100" cy="50" r="4" fill="none" stroke="#f56a00" strokeWidth="1"/>
              <circle cx="300" cy="150" r="4" fill="none" stroke="#e8210a" strokeWidth="1"/>
            </svg>
          </div>

          {/* Top row: logo + network */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:22, letterSpacing:".18em",
                background:"linear-gradient(90deg,#fff,#f56a00)", WebkitBackgroundClip:"text",
                WebkitTextFillColor:"transparent", backgroundClip:"text" }}>TOKIFY</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:".35em", textTransform:"uppercase", marginTop:2 }}>Token Wallet</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px",
                background:"rgba(74,222,128,0.08)", border:"1px solid rgba(74,222,128,0.22)", borderRadius:20 }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:"#4ade80", display:"inline-block", animation:"pulse 2s ease-in-out infinite" }} />
                <span style={{ fontSize:9, color:"#4ade80", letterSpacing:".2em", textTransform:"uppercase", fontWeight:700 }}>On-Chain</span>
              </div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", letterSpacing:".12em" }}>Polygon · ERC-20</div>
            </div>
          </div>

          {/* Total tokens — the BIG number */}
          <div style={{ marginBottom:6 }}>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:".38em", textTransform:"uppercase", marginBottom:8 }}>Total Token Balance</div>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"clamp(46px,13vw,66px)", letterSpacing:".02em", lineHeight:1,
              background:"linear-gradient(135deg,#fff 20%,#f56a00 80%,#e8210a 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              {totalTokens.toFixed(4)}
            </div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.35)", marginTop:4, letterSpacing:".12em" }}>TKF TOKENS</div>
          </div>

          {/* Bottom row: wallet address chip */}
          <div style={{ marginTop:24, paddingTop:18, borderTop:"1px solid rgba(255,255,255,0.07)",
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.28)", letterSpacing:".3em", textTransform:"uppercase", marginBottom:4 }}>Wallet Address</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", fontFamily:"monospace", letterSpacing:".05em" }}>0x7f3a...e92d</div>
            </div>
            {/* Chip icon */}
            <div style={{ width:44, height:34, borderRadius:6, border:"1px solid rgba(245,106,0,0.3)",
              background:"linear-gradient(135deg,rgba(245,106,0,0.12),rgba(232,33,10,0.06))",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
                <rect x="1" y="1" width="20" height="16" rx="3" stroke="rgba(245,106,0,0.6)" strokeWidth="1"/>
                <rect x="6" y="4" width="10" height="10" rx="1.5" stroke="rgba(245,106,0,0.4)" strokeWidth="1"/>
                <line x1="1" y1="6" x2="6" y2="6" stroke="rgba(245,106,0,0.4)" strokeWidth="1"/>
                <line x1="1" y1="12" x2="6" y2="12" stroke="rgba(245,106,0,0.4)" strokeWidth="1"/>
                <line x1="16" y1="6" x2="21" y2="6" stroke="rgba(245,106,0,0.4)" strokeWidth="1"/>
                <line x1="16" y1="12" x2="21" y2="12" stroke="rgba(245,106,0,0.4)" strokeWidth="1"/>
                <line x1="8" y1="1" x2="8" y2="4" stroke="rgba(245,106,0,0.4)" strokeWidth="1"/>
                <line x1="14" y1="1" x2="14" y2="4" stroke="rgba(245,106,0,0.4)" strokeWidth="1"/>
                <line x1="8" y1="14" x2="8" y2="17" stroke="rgba(245,106,0,0.4)" strokeWidth="1"/>
                <line x1="14" y1="14" x2="14" y2="17" stroke="rgba(245,106,0,0.4)" strokeWidth="1"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Card shine overlay */}
        <div style={{ position:"absolute", inset:0, borderRadius:28, pointerEvents:"none",
          background:"linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)" }} />
      </div>

      {/* Action buttons under card */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, margin:"16px 20px 0" }}>
        <button style={{ ...brandBtn, padding:"16px 0", fontSize:12, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}
          onClick={() => setPage("sendTokens")}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 36px rgba(232,33,10,0.38)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Send Tokens
        </button>
        <button style={{ ...ghostBtn, padding:"16px 0", fontSize:12, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}
          onClick={() => setPage("home")}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.09)"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Dashboard
        </button>
      </div>

      {/* Token holdings breakdown */}
      <div style={{ margin:"22px 20px 0" }}>
        <div style={{ fontSize:9, letterSpacing:".42em", color:C.red, textTransform:"uppercase", marginBottom:14 }}>Holdings by Currency</div>

        {tokenStore.length === 0 ? (
          <div style={{ ...glass, borderRadius:18, padding:"28px 20px", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🪙</div>
            <div style={{ fontSize:13, color:C.muted }}>No tokens stored yet</div>
          </div>
        ) : (
          <div style={{ ...glass, borderRadius:20, overflow:"hidden" }}>
            {Object.values(grouped).map((g, i, arr) => (
              <div key={g.symbol} style={{
                padding:"16px 18px", display:"flex", justifyContent:"space-between", alignItems:"center",
                borderBottom: i < arr.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ width:44, height:44, borderRadius:"50%",
                    background:"linear-gradient(135deg,rgba(232,33,10,0.15),rgba(245,106,0,0.08))",
                    border:"1px solid rgba(245,106,0,0.25)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                    {g.flag}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700 }}>{g.symbol}</div>
                    <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{g.country} · {g.items.length} mint{g.items.length !== 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:20, letterSpacing:".04em", color:C.orange }}>{g.total.toFixed(4)}</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:2 }}>tokens</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent mints */}
      {tokenStore.length > 0 && (
        <div style={{ margin:"18px 20px 0" }}>
          <div style={{ fontSize:9, letterSpacing:".42em", color:C.red, textTransform:"uppercase", marginBottom:14 }}>Recent Mints</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {tokenStore.slice(0,4).map((t, i) => (
              <div key={i} style={{ ...glass, borderRadius:14, padding:"14px 16px",
                display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:16 }}>⛓️</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{t.symbol}</div>
                    <div style={{ fontSize:10, color:C.muted }}>{t.date}</div>
                  </div>
                </div>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:17, color:C.orange, letterSpacing:".04em" }}>
                  +{parseFloat(t.amt).toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE: SEND TOKENS
═══════════════════════════════════════════════ */
function PageSendTokens({ setPage, tokenStore }) {
  const totalTokens = tokenStore.reduce((sum, t) => sum + parseFloat(t.amt), 0);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "#000000",           /* pure black — the robot's black bg merges with this */
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* ── VIDEO BACKGROUND ──
          mix-blend-mode: screen makes all black pixels (0,0,0) fully transparent.
          The orange robot colours are preserved exactly; only the black bg disappears.   */}
      <video
        src="/tokify-robot.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          mixBlendMode: "screen",       /* 🔑 black → transparent, orange stays orange */
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* ── Subtle vignette so content is readable ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
      }} />

      {/* ── CONTENT layer — sits above video ── */}
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", flexDirection: "column",
        flex: 1, overflowY: "auto",
        paddingBottom: 24,
      }}>

        {/* Header */}
        <div style={{ padding:"28px 24px 0", display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={() => setPage("tokenWallet")}
            style={{
              background: "rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.2)",
              color:"rgba(255,255,255,0.8)", borderRadius:"50%",
              width:38, height:38, fontSize:18, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)",
              flexShrink: 0,
            }}>←</button>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:28, letterSpacing:".05em",
              textShadow:"0 0 20px rgba(245,106,0,0.6)" }}>Send Tokens</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>Transfer your stablecoin tokens</div>
          </div>
        </div>

        {/* Available tokens pill */}
        <div style={{ margin:"22px 20px 0" }}>
          <div style={{
            borderRadius:14, padding:"14px 18px",
            background:"rgba(0,0,0,0.55)",
            border:"1px solid rgba(245,106,0,0.35)",
            backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)",
            display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>Available Tokens</span>
            <div style={{ textAlign:"right" }}>
              <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:22, letterSpacing:".04em",
                color:C.orange, textShadow:"0 0 16px rgba(245,106,0,0.7)" }}>{totalTokens.toFixed(4)}</span>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginLeft:6 }}>TKF</span>
            </div>
          </div>
        </div>

        {/* Spacer so content floats to bottom — robot fills the middle */}
        <div style={{ flex: 1 }} />

        {/* Bottom card with info + coming soon */}
        <div style={{ margin:"0 20px 0" }}>
          <div style={{
            borderRadius:22, padding:"28px 24px",
            background:"rgba(0,0,0,0.7)",
            border:"1px solid rgba(245,106,0,0.3)",
            backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
            textAlign:"center",
            boxShadow:"0 -8px 40px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:26, letterSpacing:".06em", marginBottom:8,
              textShadow:"0 0 20px rgba(245,106,0,0.5)" }}>
              Send Tokens
            </div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.7, marginBottom:20 }}>
              Transfer TKF stablecoin tokens directly to any Polygon wallet address or another Tokify user.
            </div>

            {/* Feature chips */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:22 }}>
              {["⚡ Instant","🔒 Secure","🌍 Cross-border","⛓️ On-chain"].map(f => (
                <div key={f} style={{
                  padding:"5px 12px",
                  background:"rgba(245,106,0,0.08)",
                  border:"1px solid rgba(245,106,0,0.25)",
                  borderRadius:20, fontSize:11, color:"rgba(255,255,255,0.6)",
                }}>{f}</div>
              ))}
            </div>

            {/* Coming soon badge */}
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8, padding:"10px 24px",
              background:"linear-gradient(135deg,rgba(232,33,10,0.2),rgba(245,106,0,0.12))",
              border:"1px solid rgba(245,106,0,0.45)", borderRadius:30,
              fontFamily:"'Bebas Neue',cursive", fontSize:15, letterSpacing:".18em", color:C.orange,
              boxShadow:"0 0 20px rgba(232,33,10,0.2)",
              textShadow:"0 0 12px rgba(245,106,0,0.6)",
              marginBottom: 20,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Coming Soon
            </div>

            {/* Back button */}
            <button
              onClick={() => setPage("tokenWallet")}
              style={{
                display:"block", width:"100%", padding:"14px 0",
                background:"rgba(255,255,255,0.06)",
                border:"1px solid rgba(255,255,255,0.15)",
                color:"rgba(255,255,255,0.7)", borderRadius:14,
                fontFamily:"'Syne',sans-serif", fontWeight:700,
                fontSize:13, letterSpacing:".1em", textTransform:"uppercase",
                cursor:"pointer",
                backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
                transition:"background .2s, transform .2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.transform=""; }}>
              ← Back to Wallet
            </button>
          </div>
        </div>

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE: WITHDRAW
═══════════════════════════════════════════════ */
function PageWithdraw({ setPage, walletBalance, onWithdraw }) {
  const [amount, setAmount] = useState("");
  const [bank, setBank]     = useState("HDFC Bank — ****4382");
  const [done, setDone]     = useState(false);

  const fee = 15;
  const amt = parseFloat(amount) || 0;
  const net = amt > 0 ? (amt - fee) : null;
  const insufficient = amt > walletBalance;

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:24 }}>
      <div style={{ padding:"28px 24px 0", display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={() => setPage("home")}
          style={{ ...ghostBtn, width:38, height:38, padding:0, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>←</button>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:28, letterSpacing:".05em" }}>Withdraw</div>
          <div style={{ fontSize:11, color:C.muted }}>To your bank account</div>
        </div>
      </div>

      {!done ? (
        <div style={{ padding:"24px 20px 0" }}>
          <div style={{ ...glass, borderRadius:12, padding:"12px 16px", marginBottom:20,
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:C.muted }}>Available Balance</span>
            <span style={{ fontSize:14, fontWeight:700, color:"#4ade80" }}>₹{walletBalance.toLocaleString("en-IN")}</span>
          </div>

          <div style={{ marginBottom:18 }}>
            <label style={lbl}>Amount (₹)</label>
            <div style={{ position:"relative" }}>
              <div style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.4)", fontSize:20 }}>₹</div>
              <input type="number" style={{ ...inp, paddingLeft:38, fontSize:26, fontWeight:700 }}
                placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                onFocus={e => e.target.style.borderColor="rgba(232,33,10,0.5)"}
                onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"} />
            </div>
            {insufficient && <div style={{ fontSize:11, color:"#f87171", marginTop:6 }}>⚠ Exceeds available balance</div>}
          </div>

          <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
            {["1000","5000","10000","25000"].map(v => (
              <button key={v} onClick={() => setAmount(v)}
                style={{ ...ghostBtn, padding:"8px 14px", fontSize:11, borderRadius:10,
                  flex:"1 1 calc(25% - 8px)",
                  background: amount===v ? "rgba(232,33,10,0.08)" : undefined,
                  borderColor: amount===v ? "rgba(232,33,10,0.4)" : undefined }}>
                ₹{parseInt(v).toLocaleString("en-IN")}
              </button>
            ))}
          </div>

          <div style={{ marginBottom:18 }}>
            <label style={lbl}>Bank Account</label>
            <select style={{ ...inp, appearance:"none", cursor:"pointer",
              backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.4)'/%3E%3C/svg%3E\")",
              backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center", paddingRight:36 }}
              value={bank} onChange={e => setBank(e.target.value)}>
              <option>HDFC Bank — ****4382</option>
              <option>SBI — ****9021</option>
              <option>Add new account...</option>
            </select>
          </div>

          {amt > 0 && !insufficient && (
            <div style={{ ...glass, borderRadius:16, padding:"16px 18px", marginBottom:20,
              border:"1px solid rgba(232,33,10,0.15)" }}>
              {[["Amount", `₹${amt.toLocaleString("en-IN")}`, "#fff"],["Fee", `₹${fee}`, "#f87171"]].map(([k,v,c]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:C.muted, marginBottom:8 }}>
                  <span>{k}</span><span style={{ color:c, fontWeight:600 }}>{v}</span>
                </div>
              ))}
              <div style={{ height:1, background:"rgba(255,255,255,0.07)", margin:"4px 0 10px" }} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:700 }}>
                <span>You Receive</span><span style={{ color:C.orange }}>₹{net?.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:8 }}>⚡ Instant · 2–3 minutes</div>
            </div>
          )}

          <button style={{ ...brandBtn, width:"100%", padding:18, opacity: amt>0 && !insufficient ? 1 : 0.45 }}
            disabled={!(amt>0 && !insufficient)}
            onClick={() => { setDone(true); onWithdraw(amt); }}
            onMouseEnter={e => amt>0 && !insufficient && (e.currentTarget.style.transform="translateY(-2px)", e.currentTarget.style.boxShadow="0 12px 36px rgba(232,33,10,0.38)")}
            onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
            Withdraw to Bank →
          </button>
        </div>
      ) : (
        <div style={{ padding:"40px 20px", textAlign:"center" }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(74,222,128,0.1)", border:"2px solid rgba(74,222,128,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 20px", color:"#4ade80" }}>✓</div>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:30, letterSpacing:".05em", marginBottom:8 }}>Withdrawal Initiated</div>
          <div style={{ fontSize:13, color:C.muted, marginBottom:28, lineHeight:1.7 }}>
            ₹{net?.toLocaleString("en-IN")} will reach {bank} within 2–3 minutes.
          </div>
          <button style={{ ...ghostBtn, padding:"14px 32px" }} onClick={() => { setDone(false); setAmount(""); setPage("home"); }}>
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE: STATUS
═══════════════════════════════════════════════ */
function PageStatus({ setPage, tx }) {
  const [status, setStatus] = useState(tx?.status || "processing");
  const [tokenized, setTokenized] = useState(false);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    if (status === "processing") {
      const t = setTimeout(() => setStatus("completed"), 4000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const isCompleted = status === "completed";
  const amt = tx?.rawAmt || 5000;
  const fee = tx?.remittanceFee || +(amt * 0.02).toFixed(2);
  const recv = tx?.rawRecv || ((amt - fee) / 83.24).toFixed(2);
  const sym = tx?.rawSym || "$";
  const tokenAmt = tx?.tokenAmt || recv;
  const tokenSymbol = tx?.tokenSymbol || "TKF-USD";

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:24 }}>
      <div style={{ padding:"28px 24px 0", display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={() => setPage("home")}
          style={{ ...ghostBtn, width:38, height:38, padding:0, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>←</button>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:28, letterSpacing:".05em" }}>Transaction Status</div>
          <div style={{ fontSize:11, color:C.muted }}>TXN-2026-00847</div>
        </div>
      </div>

      <div style={{ padding:"28px 20px 0" }}>
        {/* Status icon */}
        <div style={{ textAlign:"center", marginBottom:26 }}>
          <div style={{ width:88, height:88, borderRadius:"50%", margin:"0 auto 18px",
            background: isCompleted ? "rgba(74,222,128,0.1)" : "rgba(245,106,0,0.1)",
            border: `2px solid ${isCompleted ? "rgba(74,222,128,0.35)" : "rgba(245,106,0,0.35)"}`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:38, transition:"all .6s",
            boxShadow: isCompleted ? "0 0 40px rgba(74,222,128,0.15)" : "0 0 40px rgba(245,106,0,0.15)" }}>
            {isCompleted
              ? <span style={{ color:"#4ade80" }}>✓</span>
              : <span style={{ display:"inline-block", animation:"spin 1s linear infinite", color:C.orange }}>⟳</span>
            }
          </div>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:32, letterSpacing:".05em" }}>
            {isCompleted ? "Transfer Complete" : "Processing..."}
          </div>
          <div style={{ fontSize:13, color:C.muted, marginTop:6 }}>
            {isCompleted ? "Money has been delivered" : "Confirming on blockchain"}
          </div>
          {!isCompleted && <div style={{ fontSize:11, color:"rgba(255,255,255,0.22)", marginTop:8 }}>Auto-updating in a moment…</div>}
        </div>

        {/* Details */}
        <div style={{ ...glass, borderRadius:20, padding:"20px 22px", marginBottom:16 }}>
          <div style={{ fontSize:10, letterSpacing:".4em", color:C.red, textTransform:"uppercase", marginBottom:14 }}>Transaction Details</div>
          {[
            ["Amount Sent",   `₹${parseFloat(amt).toLocaleString("en-IN")}`],
            ["Remittance Fee",`₹${fee.toFixed ? fee.toFixed(2) : fee}`],
            ["Receiver Gets", `${sym}${parseFloat(recv).toFixed(2)}`],
            ["To",            tx?.name || "Recipient"],
            ["Country",       tx?.country || "International"],
          ].map(([k,v],i) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"9px 0", borderTop: i>0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <span style={{ fontSize:13, color:C.muted }}>{k}</span>
              <span style={{ fontSize:13, fontWeight:600, color: k==="Remittance Fee" ? "#f87171" : "#fff" }}>{v}</span>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize:13, color:C.muted }}>Status</span>
            <StatusTag status={status} />
          </div>
        </div>

        {/* Token info */}
        {isCompleted && !tokenized && !minting && (
          <div style={{ ...glass, borderRadius:20, padding:"20px 22px",
            border:"1px solid rgba(232,33,10,0.28)", background:"rgba(232,33,10,0.05)", marginBottom:16 }}>
            <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ width:46, height:46, minWidth:46, borderRadius:13,
                background:"linear-gradient(135deg,#e8210a,#f56a00)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 8px 24px rgba(232,33,10,0.3)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:20, letterSpacing:".05em", marginBottom:4 }}>Tokenize This Transfer</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.7, marginBottom:14 }}>
                  Mint <strong style={{ color:C.orange }}>{parseFloat(tokenAmt).toFixed(4)} {tokenSymbol}</strong> stablecoin tokens on Polygon, pegged 1:1 to {tx?.country?.split(" ")[0] || "USD"} for DeFi yield or on-chain proof of payment.
                </div>
                <button style={{ ...brandBtn, padding:"12px 20px", fontSize:12, display:"flex", alignItems:"center", gap:8 }}
                  onClick={() => { setMinting(true); setTimeout(() => { setMinting(false); setTokenized(true); }, 2200); }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 28px rgba(232,33,10,0.38)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
                  ⛓️ Tokenize Transfer
                </button>
              </div>
            </div>
          </div>
        )}

        {minting && (
          <div style={{ ...glass, borderRadius:20, padding:"24px 22px", textAlign:"center",
            border:"1px solid rgba(245,106,0,0.25)", background:"rgba(245,106,0,0.05)", marginBottom:16 }}>
            <div style={{ fontSize:38, marginBottom:12, display:"inline-block", animation:"spin 1s linear infinite" }}>⛓️</div>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:22, letterSpacing:".05em", marginBottom:6 }}>Minting Token</div>
            <div style={{ fontSize:12, color:C.muted }}>Writing to Polygon blockchain…</div>
          </div>
        )}

        {tokenized && (
          <div style={{ borderRadius:20, padding:"22px 22px", textAlign:"center",
            background:"rgba(34,197,94,0.07)", border:"1px solid rgba(34,197,94,0.22)", marginBottom:16 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⛓️</div>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:24, letterSpacing:".05em", color:"#4ade80", marginBottom:8 }}>Token Minted!</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", lineHeight:1.7 }}>
              <strong style={{ color:C.orange }}>{parseFloat(tokenAmt).toFixed(4)} {tokenSymbol}</strong> minted on Polygon.<br />
              Token ID: <span style={{ color:C.orange, fontWeight:700 }}>TKF-{String(Date.now()).slice(-5)}</span>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE: PROFILE
═══════════════════════════════════════════════ */
function PageProfile({ onLogout, walletBalance }) {
  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:24 }}>
      <div style={{ padding:"32px 24px 0", textAlign:"center" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", margin:"0 auto 16px",
          background:"linear-gradient(135deg,#e8210a,#f56a00)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:700, fontSize:26, boxShadow:"0 0 28px rgba(232,33,10,0.3)" }}>S</div>
        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:26, letterSpacing:".05em" }}>Soumili Biswas</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>Verified ✓</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, margin:"24px 20px 0" }}>
        {[
          { label:"Wallet Balance", value:`₹${walletBalance.toLocaleString("en-IN")}` },
          { label:"Transactions",   value:"47"           },
          { label:"Active Tokens",  value:"3"            },
          { label:"Countries",      value:"8"            },
        ].map(s => (
          <div key={s.label} style={{ ...glass, borderRadius:16, padding:"18px 16px", textAlign:"center" }}>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:24, color:C.orange, wordBreak:"break-all" }}>{s.value}</div>
            <div style={{ fontSize:10, color:C.muted, letterSpacing:".3em", textTransform:"uppercase", marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ margin:"20px 20px 0", display:"flex", flexDirection:"column", gap:10 }}>
        {["Notification Settings","Linked Banks","Security & KYC","Help & Support"].map(item => (
          <div key={item} style={{ ...glass, borderRadius:14, padding:"16px 18px",
            display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}>
            <span style={{ fontSize:14 }}>{item}</span>
            <span style={{ color:C.muted, fontSize:16 }}>›</span>
          </div>
        ))}
      </div>
      <div style={{ margin:"20px 20px 0" }}>
        <button style={{ ...ghostBtn, width:"100%", padding:16, color:"#f87171", borderColor:"rgba(248,113,113,0.2)" }}
          onClick={onLogout}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(248,113,113,0.08)"; e.currentTarget.style.borderColor="rgba(248,113,113,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor="rgba(248,113,113,0.2)"; }}>
          Log Out
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ROOT DASHBOARD  — live rates fetched here
═══════════════════════════════════════════════ */
export default function Dashboard({ onLogout }) {
  const [page, setPage]           = useState("home");
  const [activeTx, setActiveTx]   = useState(null);
  const [walletBalance, setWalletBalance] = useState(84250);
  const [txHistory, setTxHistory] = useState(INIT_TXS);
  const [tokenStore, setTokenStore] = useState([]);
  const [liveRates, setLiveRates] = useState(
    Object.fromEntries(Object.entries(FALLBACK_RATES).map(([code, v]) => [code, { ...v, change: 0 }]))
  );
  const [ratesLoading, setRatesLoading] = useState(false);

  /* ── Fetch live exchange rates ── */
  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      // Using exchangerate-api (free tier, no key needed for this endpoint)
      // Fetching INR as base → get how many units of foreign currency 1 INR buys
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
      if (!res.ok) throw new Error("rate fetch failed");
      const data = await res.json();
      const rates = data.rates || {};

      setLiveRates(prev => {
        const updated = { ...prev };
        Object.keys(FALLBACK_RATES).forEach(code => {
          if (rates[code]) {
            // API gives: how much foreign you get per 1 INR
            // We need: how much INR per 1 foreign unit → 1 / rates[code]
            const newRate = 1 / rates[code];
            const oldRate = prev[code]?.rate || newRate;
            const change = +((newRate - oldRate) / oldRate * 100).toFixed(3);
            updated[code] = { ...FALLBACK_RATES[code], rate: +newRate.toFixed(4), change };
          }
        });
        return updated;
      });
    } catch {
      // silently use fallback rates, mark as static
      setLiveRates(prev =>
        Object.fromEntries(Object.entries(prev).map(([code, v]) => [code, { ...v, change: v.change || 0 }]))
      );
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, [fetchRates]);

  function handleAddFunds(amt) {
    setWalletBalance(prev => prev + amt);
  }

  function handleWithdraw(amt) {
    setWalletBalance(prev => Math.max(0, prev - amt));
  }

  function handleStoreInWallet(tx) {
    if (!tx) return;
    setTokenStore(prev => [
      {
        amt: tx.tokenAmt || "0",
        symbol: tx.tokenSymbol || "TKF-USD",
        flag: tx.flag || "🌍",
        country: tx.country || "International",
        date: "Just now",
        txId: `TKF-${String(Date.now()).slice(-6)}`,
      },
      ...prev,
    ]);
  }

  function handleNewTx(tx) {
    setTxHistory(prev => [{ ...tx, id: Date.now() }, ...prev]);
    setWalletBalance(prev => Math.max(0, prev - (tx.rawAmt || 0)));
  }

  const dots = [
    { size:120, top:8,  left:80,  dur:18, delay:0   },
    { size:80,  top:45, left:10,  dur:22, delay:-5  },
    { size:100, top:70, left:65,  dur:16, delay:-9  },
    { size:60,  top:20, left:40,  dur:26, delay:-3  },
    { size:90,  top:88, left:30,  dur:20, delay:-14 },
    { size:50,  top:55, left:88,  dur:14, delay:-7  },
  ];

  // Intercept setActiveTx to also deduct balance
  function handleSetActiveTx(tx) {
    setActiveTx(tx);
    if (tx && !tx._deducted) {
      setTxHistory(prev => [{ ...tx, id: Date.now() }, ...prev]);
      setWalletBalance(prev => Math.max(0, prev - (tx.rawAmt || 0)));
      tx._deducted = true;
    }
  }

  return (
    <div style={{ background:"#080808", color:"#fff", fontFamily:"'Syne',sans-serif",
      minHeight:"100vh", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column" }}>

      {/* Ambient dots */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
        {dots.map((d,i) => (
          <div key={i} style={{ position:"absolute", borderRadius:"50%",
            background: i%2===0 ? "rgba(232,33,10,0.04)" : "rgba(245,106,0,0.04)",
            width:d.size, height:d.size, top:`${d.top}%`, left:`${d.left}%`,
            animation:`fdot ${d.dur}s linear ${d.delay}s infinite` }} />
        ))}
      </div>

      <style>{`
        @keyframes fdot {
          0%,100%{transform:translateY(0) translateX(0)}
          33%{transform:translateY(-22px) translateX(12px)}
          66%{transform:translateY(14px) translateX(-10px)}
        }
      `}</style>

      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:2, maxWidth:520, margin:"0 auto", width:"100%" }}>
        {page==="home"        && <PageHome        setPage={setPage} setActiveTx={handleSetActiveTx} walletBalance={walletBalance} txHistory={txHistory} liveRates={liveRates} ratesLoading={ratesLoading} />}
        {page==="addmoney"    && <PageAddMoney    setPage={setPage} onAddFunds={handleAddFunds} />}
        {page==="send"        && <PageSend        setPage={setPage} setActiveTx={handleSetActiveTx} walletBalance={walletBalance} liveRates={liveRates} />}
        {page==="withdraw"    && <PageWithdraw    setPage={setPage} walletBalance={walletBalance} onWithdraw={handleWithdraw} />}
        {page==="status"      && <PageStatus      setPage={setPage} tx={activeTx} />}
        {page==="profile"     && <PageProfile     onLogout={onLogout} walletBalance={walletBalance} />}
        {page==="tokenizing"  && <PageTokenizing  setPage={setPage} tx={activeTx} onStoreInWallet={handleStoreInWallet} />}
        {page==="tokenWallet" && <PageTokenWallet setPage={setPage} tokenStore={tokenStore} />}
        {page==="sendTokens"  && <PageSendTokens  setPage={setPage} tokenStore={tokenStore} />}

        {page !== "tokenizing" && page !== "sendTokens" && <BottomNav page={page} setPage={setPage} />}
      </div>
    </div>
  );
}
