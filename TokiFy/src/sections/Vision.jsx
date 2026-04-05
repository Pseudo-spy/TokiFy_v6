const pad = "80px clamp(24px,8vw,140px)";

export default function Vision({ s3LabelRef, s3TitleRef, s3BodyRef, s3BtnRef }) {
  return (
    <section id="vision" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: pad }}>
      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", borderRadius: 24, padding: "60px 48px" }}>
        <p ref={s3LabelRef} className="sec-label">Our Vision</p>
        <h2 ref={s3TitleRef} className="sec-title">
          Our<br/>
          <span style={{ WebkitTextStroke: "1px rgba(255,255,255,0.28)", color: "transparent" }}>Vision</span>
        </h2>
        <p ref={s3BodyRef} className="sec-body">
          We believe in a borderless economy where transferring value is as instant and seamless as sending a message. TokiFy is the bridge between traditional fiat and decentralized finance.
        </p>
        <button ref={s3BtnRef} className="cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 40px", background: "transparent", color: "#fff", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", border: "1px solid rgba(232,33,10,0.48)", cursor: "pointer", borderRadius: 2 }}>
          Join the Waitlist →
        </button>
      </div>
    </section>
  );
}
