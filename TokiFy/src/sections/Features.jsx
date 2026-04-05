import { features, stats } from "../data/content";

const pad = "80px clamp(24px,8vw,140px)";

export function HowItWorks({ s1LabelRef, s1TitleRef, s1BodyRef, s1BtnRef }) {
  return (
    <section id="how-it-works" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: pad }}>
      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", borderRadius: 24, padding: "60px 48px" }}>
        <p ref={s1LabelRef} className="sec-label">What We Do</p>
        <h2 ref={s1TitleRef} className="sec-title">
          Money Moves<br/>
          <span style={{ WebkitTextStroke: "1px rgba(255,255,255,0.28)", color: "transparent" }}>Without</span><br/>
          Borders
        </h2>
        <p ref={s1BodyRef} className="sec-body">
          Tokify is a Web3-powered cross-border transfer platform that eliminates intermediaries, slashes fees, and delivers funds at blockchain speed — anywhere on Earth.
        </p>
        <button ref={s1BtnRef} className="cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 40px", background: "linear-gradient(135deg,#e8210a,#f56a00)", color: "#fff", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 2 }}>
          Get Early Access →
        </button>
      </div>
    </section>
  );
}

export function Stats({ statRefs }) {
  return (
    <section style={{ padding: "96px clamp(24px,8vw,140px)", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 44 }}>
          {stats.map((s, i) => (
            <div key={i} ref={(el) => (statRefs.current[i] = el)}>
              <div className="stat-num">{s.num}</div>
              <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.32)", textTransform: "uppercase", marginTop: 7, fontFamily: "'Syne',sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Features({ s2LabelRef, s2TitleRef, cardRefs }) {
  return (
    <section id="features" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: pad }}>
      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto" }}>
        <p ref={s2LabelRef} className="sec-label">Core Features</p>
        <h2 ref={s2TitleRef} className="sec-title">
          Built for<br/>
          <span style={{ WebkitTextStroke: "1px rgba(255,255,255,0.28)", color: "transparent" }}>Speed</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, marginTop: 16 }}>
          {features.map((f, i) => (
            <div key={i} ref={(el) => (cardRefs.current[i] = el)} className="card-shine" style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "34px 30px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "radial-gradient(circle,rgba(232,33,10,0.2),transparent)", border: "1px solid rgba(232,33,10,0.27)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, fontSize: 20 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, letterSpacing: "0.06em", marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.76, color: "rgba(255,255,255,0.38)", fontFamily: "'Syne',sans-serif" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
