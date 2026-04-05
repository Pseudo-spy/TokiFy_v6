const pad = "80px clamp(24px,8vw,140px)";

export function Cheaper({ s4LabelRef, s4TitleRef, s4BodyRef }) {
  return (
    <section id="cheaper" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: pad }}>
      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", borderRadius: 24, padding: "60px 48px" }}>
        <p ref={s4LabelRef} className="sec-label">Why its cheaper</p>
        <h2 ref={s4TitleRef} className="sec-title">
          Send <span style={{ WebkitTextStroke: "1px rgba(255,255,255,0.28)", color: "transparent" }}>more.</span><br/>
          Pay less.
        </h2>
        <div ref={s4BodyRef} className="sec-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p>We reduce the cost of cross-border transfers by removing unnecessary intermediaries and optimizing how money moves.</p>
          <p>Traditional remittance systems often charge 5–10% through hidden fees and currency markups. Our platform brings this down to around 2% by using local settlement, smart optimization, and transparent exchange rates.</p>
          <p>You always see exactly what you pay and what the receiver gets — no hidden charges, no surprises.</p>
          <p style={{ color: "#fff", fontWeight: "bold" }}>More of your money reaches where it matters.</p>
        </div>
      </div>
    </section>
  );
}

export function Security({ s5LabelRef, s5TitleRef, cardRefs2 }) {
  return (
    <section id="security" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: pad }}>
      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto" }}>
        <p ref={s5LabelRef} className="sec-label">Security</p>
        <h2 ref={s5TitleRef} className="sec-title">
          Built on <span style={{ WebkitTextStroke: "1px rgba(255,255,255,0.28)", color: "transparent" }}>trust</span><br/>
          and compliance
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.6)", fontFamily: "'Syne',sans-serif", marginBottom: 40, maxWidth: 800 }}>
          We follow strict regulatory standards and use secure banking infrastructure to ensure every transaction is safe and reliable.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
          <div ref={(el) => (cardRefs2.current[0] = el)} className="card-shine" style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "34px 30px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
            <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, letterSpacing: "0.06em", marginBottom: 16, color: "#e8210a" }}>For Indian Residents</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 2, fontFamily: "'Syne',sans-serif" }}>
              <li>✓ PAN and basic KYC verification</li>
              <li>✓ Linked bank account</li>
              <li>✓ Compliance with Reserve Bank of India guidelines</li>
            </ul>
          </div>

          <div ref={(el) => (cardRefs2.current[1] = el)} className="card-shine" style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "34px 30px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
            <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, letterSpacing: "0.06em", marginBottom: 16, color: "#f56a00" }}>For NRIs</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 2, fontFamily: "'Syne',sans-serif" }}>
              <li>✓ Passport and visa verification</li>
              <li>✓ Overseas address and identity proof</li>
              <li>✓ NRE/NRO bank account linking</li>
            </ul>
          </div>

          <div ref={(el) => (cardRefs2.current[2] = el)} className="card-shine" style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "34px 30px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
            <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, letterSpacing: "0.06em", marginBottom: 16, color: "#fff" }}>Protection Measures</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 2, fontFamily: "'Syne',sans-serif" }}>
              <li>✓ Encrypted transactions</li>
              <li>✓ Fraud monitoring systems</li>
              <li>✓ Secure bank integrations</li>
            </ul>
          </div>
        </div>

        <p style={{ fontSize: 18, color: "#fff", fontFamily: "'Syne',sans-serif", marginTop: 40, textAlign: "center", fontWeight: "bold" }}>
          Your money stays protected at every step
        </p>
      </div>
    </section>
  );
}
