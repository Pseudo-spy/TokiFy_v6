import { useState, useRef, useEffect } from "react";

const FAQ = {
  fee:        "TokiFy charges ~2% per transfer — far below the industry average of 5–10%.",
  how:        "Enter your phone number → verify OTP → complete KYC → send money abroad in seconds.",
  kyc:        "KYC is mandatory for RBI/FEMA compliance. We verify your Aadhaar, PAN, Passport, or Voter ID via AI OCR.",
  stablecoin: "Our TokiUSD stablecoin is pegged 1:1 to the US Dollar and used internally to settle cross-border transfers instantly.",
  fast:       "Transfers typically settle within 30 seconds using our stablecoin rails.",
  secure:     "We use Firebase Auth, 256-bit AES encryption, and a Polygon blockchain audit trail.",
  nri:        "Yes! NRI accounts are fully supported. Select 'NRI' during sign up and use your international phone number.",
  hello:      "Hello! How can I help you with TokiFy today?",
  hi:         "Hey there! 👋 What would you like to know about TokiFy?",
  cost:       "Our flat fee is ~2% of the transfer amount, with transparent exchange rates. No hidden charges!",
  time:       "Usually under 30 seconds to settle. For new accounts it may take up to 2 minutes.",
};

const getReply = (msg) => {
  const m = msg.toLowerCase();
  for (const [key, val] of Object.entries(FAQ)) {
    if (m.includes(key)) return val;
  }
  return "Great question! For detailed support please contact us at support@tokify.co or visit our Help Centre. I can help with fees, KYC, stablecoin, security, or transfer speed!";
};

export default function TokiBot() {
  const [open,   setOpen]   = useState(false);
  const [input,  setInput]  = useState("");
  const [msgs,   setMsgs]   = useState([
    { role: "bot", text: "👋 Hi! I'm TokiBot, your TokiFy assistant. Ask me anything about sending money, fees, KYC, or our stablecoin!" },
  ]);
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMsgs((p) => [...p, { role: "user", text: userMsg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((p) => [...p, { role: "bot", text: getReply(userMsg) }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 500, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
      {open && (
        <div style={{
          width: 320, height: 420, background: "rgba(14,14,14,0.97)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
          display: "flex", flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 18px",
            background: "linear-gradient(135deg,rgba(232,33,10,0.25),rgba(245,106,0,0.15))",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#e8210a,#f56a00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 16, letterSpacing: "0.08em", color: "#fff" }}>TokiBot</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: "'Syne',sans-serif" }}>TokiFy AI Assistant • Always online</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: "14px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={
                m.role === "bot"
                  ? { background: "rgba(255,255,255,0.06)", borderRadius: "12px 12px 12px 4px", padding: "10px 14px", fontSize: 12, fontFamily: "'Syne',sans-serif", color: "rgba(255,255,255,0.85)", maxWidth: "85%", lineHeight: 1.6 }
                  : { background: "linear-gradient(135deg,rgba(232,33,10,0.35),rgba(245,106,0,0.25))", borderRadius: "12px 12px 4px 12px", padding: "10px 14px", fontSize: 12, fontFamily: "'Syne',sans-serif", color: "#fff", maxWidth: "85%", alignSelf: "flex-end", lineHeight: 1.6 }
              }>{m.text}</div>
            ))}
            {typing && <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "12px 12px 12px 4px", padding: "10px 14px", fontSize: 12, fontFamily: "'Syne',sans-serif", color: "rgba(255,255,255,0.5)", maxWidth: "85%" }}>✦ typing…</div>}
            <div ref={endRef} />
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 8 }}>
            <input
              style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontFamily: "'Syne',sans-serif", fontSize: 12, padding: "8px 12px", outline: "none" }}
              placeholder="Ask about fees, KYC, stablecoin…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button onClick={send} style={{ background: "linear-gradient(135deg,#e8210a,#f56a00)", border: "none", borderRadius: 8, width: 36, cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#e8210a,#f56a00)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 8px 24px rgba(232,33,10,0.45)", transition: "transform 0.2s" }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? "×" : "💬"}
      </button>
    </div>
  );
}
