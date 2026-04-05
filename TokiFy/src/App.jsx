import { useRef, useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Navbar               from "./components/Navbar";
import TokiBot              from "./components/TokiBot";
import LoginSignupModal     from "./components/LoginSignupModal";
import Hero, { ScatteredDots } from "./sections/Hero";
import { HowItWorks, Stats, Features } from "./sections/Features";
import Vision               from "./sections/Vision";
import { Cheaper, Security } from "./sections/Security";
import Stablecoin           from "./sections/Stablecoin";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ── Hero DOM refs (passed straight into the Hero component) ──
  const heroRef       = useRef(null);
  const brandWrapRef  = useRef(null);
  const brandTextRef  = useRef(null);
  const taglineRef    = useRef(null);
  const scrollHintRef = useRef(null);

  // Hero's cube engine state (populated inside Hero's own useEffect)
  const cubeStateRef = useRef(null);

  // ── Section reveal refs ──
  const s1LabelRef = useRef(null); const s1TitleRef = useRef(null);
  const s1BodyRef  = useRef(null); const s1BtnRef   = useRef(null);
  const s2LabelRef = useRef(null); const s2TitleRef = useRef(null);
  const s3LabelRef = useRef(null); const s3TitleRef = useRef(null);
  const s3BodyRef  = useRef(null); const s3BtnRef   = useRef(null);
  const s4LabelRef = useRef(null); const s4TitleRef = useRef(null);
  const s4BodyRef  = useRef(null);
  const s5LabelRef = useRef(null); const s5TitleRef = useRef(null);

  const cardRefs  = useRef([]);
  const cardRefs2 = useRef([]);
  const statRefs  = useRef([]);

  useEffect(() => {
    // Skip GSAP setup if logged in (dashboard is shown instead)
    if (isLoggedIn) return;
    // Hero's useEffect also runs after mount, so we poll briefly to wait for
    // cubeStateRef to be populated (usually ready within first frame).
    let attempts = 0;
    const maxAttempts = 20;

    function initGsap() {
      const cubes = cubeStateRef.current?.cubes;
      const draw  = cubeStateRef.current?.draw;

      if (!cubes || !draw) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(initGsap, 30);
        }
        return;
      }

      // ── Initial hidden state ──
      gsap.set(brandTextRef.current,   { y: 65, opacity: 0 });
      gsap.set(brandWrapRef.current,   { opacity: 0 });
      gsap.set(taglineRef.current,     { opacity: 0, y: 16 });
      gsap.set(scrollHintRef.current,  { opacity: 0 });

      // ── Intro: cubes fly in, then text fades ──
      const tl = gsap.timeline({ delay: 0.28 });
      cubes.forEach((cube, i) => {
        tl.to(
          cube,
          { x: cube.tx, y: cube.ty, alpha: 1, scale: 1, progress: 1, duration: 1.55, ease: "expo.out", onUpdate: draw },
          i * 0.14
        );
      });
      tl
        .to(brandWrapRef.current,  { opacity: 1, duration: 0.1 },                         "-=0.28")
        .to(brandTextRef.current,  { y: 0, opacity: 1, duration: 0.92, ease: "expo.out" }, "-=0.1")
        .to(taglineRef.current,    { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" }, "-=0.5")
        .to(scrollHintRef.current, { opacity: 1, duration: 0.5 },                         "-=0.3");

      // ── Scroll: cubes scatter, brand fades ──
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end:   "bottom top",
        scrub: 1.5,
        onUpdate(self) {
          const p = self.progress;
          cubes.forEach((cube, i) => {
            const delay = i * 0.13;
            const eff   = Math.max(0, (p - delay) / (1 - delay));
            cube.x        = cube.tx + (cube.sx - cube.tx) * eff * 1.18;
            cube.y        = cube.ty + (cube.sy - cube.ty) * eff * 1.18 - eff * 90;
            cube.alpha    = Math.max(0, 1 - eff * 2.5);
            cube.scale    = Math.max(0.18, 1 - eff * 0.58);
            cube.progress = Math.max(0, 1 - eff * 1.7);
          });
          gsap.set(brandWrapRef.current,  { opacity: Math.max(0, 1 - p * 5.5), y: -p * 80 });
          gsap.set(scrollHintRef.current, { opacity: Math.max(0, 1 - p * 9) });
          draw();
        },
      });

      // ── Section reveals ──
      const reveal = (el, fromX = 0, fromY = 40, dur = 0.85, delay = 0) =>
        el && gsap.fromTo(
          el,
          { opacity: 0, x: fromX, y: fromY },
          { opacity: 1, x: 0, y: 0, duration: dur, ease: "expo.out", delay, scrollTrigger: { trigger: el, start: "top 87%" } }
        );

      // Labels slide in from left
      [s1LabelRef, s2LabelRef, s3LabelRef, s4LabelRef, s5LabelRef].forEach((r) =>
        reveal(r.current, -28, 0, 0.7)
      );
      // Titles rise up
      [s1TitleRef, s2TitleRef, s3TitleRef, s4TitleRef, s5TitleRef].forEach((r) =>
        reveal(r.current, 0, 45)
      );
      // Body text
      [s1BodyRef, s3BodyRef, s4BodyRef].forEach((r) =>
        reveal(r.current, 0, 35, 0.8, 0.1)
      );
      // CTA buttons
      [s1BtnRef, s3BtnRef].forEach((r) =>
        reveal(r.current, 0, 28, 0.7, 0.18)
      );

      // Feature cards stagger
      cardRefs.current.forEach((el, i) =>
        el && gsap.fromTo(
          el,
          { opacity: 0, y: 55 },
          { opacity: 1, y: 0, duration: 0.72, ease: "power2.out", delay: i * 0.1, scrollTrigger: { trigger: el, start: "top 90%" } }
        )
      );

      // Security cards stagger
      cardRefs2.current.forEach((el, i) =>
        el && gsap.fromTo(
          el,
          { opacity: 0, y: 55 },
          { opacity: 1, y: 0, duration: 0.72, ease: "power2.out", delay: i * 0.1, scrollTrigger: { trigger: el, start: "top 90%" } }
        )
      );

      // Stats stagger
      statRefs.current.forEach((el, i) =>
        el && gsap.fromTo(
          el,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: i * 0.08, scrollTrigger: { trigger: el, start: "top 88%" } }
        )
      );
    }

    initGsap();

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoggedIn) {
    return <Dashboard onLogout={() => setIsLoggedIn(false)} />;
  }

  return (
    <div
      style={{
        background: "#080808",
        color: "#fff",
        fontFamily: "'Syne',sans-serif",
        overflowX: "hidden",
        minHeight: "100vh",
      }}
    >
      {/* Modal (listens to hash changes) */}
      <LoginSignupModal onLoginSuccess={() => setIsLoggedIn(true)} />

      {/* Sticky top nav */}
      <Navbar />

      {/* Ambient floating dots */}
      <ScatteredDots />

      {/* ── HERO (200vh so scrub is long and cinematic) ── */}
      <Hero
        heroRef={heroRef}
        brandWrapRef={brandWrapRef}
        brandTextRef={brandTextRef}
        taglineRef={taglineRef}
        scrollHintRef={scrollHintRef}
        stateRef={cubeStateRef}
      />

      {/* ── ALL CONTENT below hero ── */}
      <div style={{ position: "relative", zIndex: 5, background: "#080808" }}>

        <div className="divider-flame" />

        <HowItWorks
          s1LabelRef={s1LabelRef}
          s1TitleRef={s1TitleRef}
          s1BodyRef={s1BodyRef}
          s1BtnRef={s1BtnRef}
        />

        <div className="divider-subtle" />

        <Stats statRefs={statRefs} />

        <div className="divider-flame" />

        <Features
          s2LabelRef={s2LabelRef}
          s2TitleRef={s2TitleRef}
          cardRefs={cardRefs}
        />

        <div className="divider-subtle" />

        <Vision
          s3LabelRef={s3LabelRef}
          s3TitleRef={s3TitleRef}
          s3BodyRef={s3BodyRef}
          s3BtnRef={s3BtnRef}
        />

        <div className="divider-subtle" />

        <Cheaper
          s4LabelRef={s4LabelRef}
          s4TitleRef={s4TitleRef}
          s4BodyRef={s4BodyRef}
        />

        <div className="divider-flame" />

        <Security
          s5LabelRef={s5LabelRef}
          s5TitleRef={s5TitleRef}
          cardRefs2={cardRefs2}
        />

        <div className="divider-flame" />

        <Stablecoin />

        {/* Footer */}
        <footer
          style={{
            padding: "44px clamp(24px,8vw,140px)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: "'Bebas Neue',cursive",
              fontSize: 22,
              letterSpacing: "0.2em",
              background: "linear-gradient(90deg,#fff,#f56a00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            TOKIFY
          </span>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.16)",
              letterSpacing: "0.12em",
              fontFamily: "'Syne',sans-serif",
            }}
          >
            © 2026 Tokify · Web3 Payments Infrastructure
          </p>
        </footer>
      </div>

      {/* Floating chatbot */}
      <TokiBot />
    </div>
  );
}
