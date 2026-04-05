import { useState, useEffect } from "react";
import { navItems } from "../data/content";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
  };

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: scrolled ? "rgba(12,12,12,0.85)" : "rgba(12,12,12,0.55)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.5)" : "none",
        transition: "all 0.3s ease",
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 120 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg,#e8210a,#f56a00)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Bebas Neue',cursive", fontSize: 16, color: "#fff", letterSpacing: "0.05em",
          boxShadow: "0 4px 14px rgba(232,33,10,0.5)",
        }}>T</div>
        <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, letterSpacing: "0.1em", color: "#fff", lineHeight: 1 }}>
          TokiFy
        </span>
      </div>

      {/* Centered links */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
        {navItems.map((item, i) => (
          <a
            key={i} href={item.href}
            onClick={(e) => scrollToSection(e, item.href)}
            style={{
              color: "rgba(255,255,255,0.6)", textDecoration: "none",
              fontSize: 12, fontFamily: "'Syne',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "6px 12px", borderRadius: 6, transition: "all 0.2s", whiteSpace: "nowrap",
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseOut={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.background = "transparent"; }}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* Auth buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 120, justifyContent: "flex-end" }}>
        <a href="#login" style={{
          color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: 13,
          fontFamily: "'Syne',sans-serif", letterSpacing: "0.06em", textTransform: "uppercase",
          padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
          transition: "all 0.2s",
        }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(232,33,10,0.5)"; e.currentTarget.style.color = "#fff"; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
        >Login</a>
        <a href="#signup" style={{
          padding: "8px 20px", background: "linear-gradient(135deg,#e8210a,#f56a00)",
          color: "#fff", textDecoration: "none", fontSize: 12,
          fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          borderRadius: 8, cursor: "pointer", border: "none",
          boxShadow: "0 4px 14px rgba(232,33,10,0.35)", transition: "transform 0.2s, box-shadow 0.2s",
        }}
          onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(232,33,10,0.5)"; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(232,33,10,0.35)"; }}
        >Sign Up</a>
      </div>
    </nav>
  );
}
