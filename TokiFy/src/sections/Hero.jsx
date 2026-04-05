import { useRef, useEffect } from "react";

// ── Scattered ambient dots ──
export function ScatteredDots() {
  useEffect(() => {
    const container = document.getElementById("dots-layer");
    if (!container) return;
    container.innerHTML = "";
    const colors = ["#e8210a", "#f56a00", "#ff8c1a", "#c81e05", "#ff4520", "#e05000", "#ff6030"];
    for (let i = 0; i < 75; i++) {
      const dot = document.createElement("div");
      dot.className = "dot-particle";
      const size = 1.4 + Math.random() * 3.8;
      const x = Math.random() * 100;
      const y = Math.random() * 400;
      const dur = 7 + Math.random() * 16;
      const delay = -Math.random() * dur;
      const op = 0.025 + Math.random() * 0.085;
      const color = colors[Math.floor(Math.random() * colors.length)];
      dot.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `left:${x}vw`,
        `top:${y}vh`,
        `background:${color}`,
        `--dot-op:${op}`,
        `animation-duration:${dur}s`,
        `animation-delay:${delay}s`,
        `box-shadow:0 0 ${size * 2.2}px ${color}55`,
      ].join(";");
      container.appendChild(dot);
    }
  }, []);
  return (
    <div
      id="dots-layer"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}
    />
  );
}

// ── Isometric cube engine ──
function buildCubeEngine(canvas, stateRef) {
  const ctx = canvas.getContext("2d");
  const S = 145;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();

  function isoPoints(cx, cy, s) {
    const h = s * 0.577, d = s * 1.0;
    return {
      top: [[cx, cy - h], [cx + s, cy], [cx, cy + h], [cx - s, cy]],
      left: [[cx - s, cy], [cx, cy + h], [cx, cy + h + d], [cx - s, cy + d]],
      right: [[cx + s, cy], [cx, cy + h], [cx, cy + h + d], [cx + s, cy + d]],
    };
  }

  function getCenter() {
    return { cx: canvas.width / 2, cy: canvas.height / 2 - 30 };
  }

  function isoPos(r, c, cx, cy) {
    return { x: cx + (c - r) * S * 1.06, y: cy + (c + r) * S * 0.63 };
  }

  const GRID = [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }];
  const angles = [Math.PI * 1.4, Math.PI * 0.1, Math.PI * 0.9, Math.PI * 1.75];

  const { cx: iCx, cy: iCy } = getCenter();
  const cubes = GRID.map((g, i) => {
    const tgt = isoPos(g.r, g.c, iCx, iCy);
    const ang = angles[i] + (Math.random() - 0.5) * 0.35;
    const dist = 880 + Math.random() * 200;
    const sx = iCx + Math.cos(ang) * dist;
    const sy = iCy + Math.sin(ang) * dist;
    return { x: sx, y: sy, tx: tgt.x, ty: tgt.y, sx, sy, alpha: 0, scale: 0.3, progress: 0 };
  });

  const TINTS = [
    ["232,33,10", "195,22,5", "170,15,3"],
    ["245,100,0", "210,78,0", "182,58,0"],
    ["220,42,8", "186,28,5", "164,16,3"],
    ["255,118,18", "218,88,8", "192,68,4"],
  ];

  function drawCube(cx, cy, s, alpha, idx, glow) {
    if (alpha < 0.01) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, Math.max(0, alpha));
    const pts = isoPoints(cx, cy, s);
    if (glow > 0.08) {
      ctx.shadowColor = `rgba(232,80,10,${glow})`;
      ctx.shadowBlur = 60;
    }
    const t = TINTS[idx % 4];

    function face(pts2, bT, bB, tint) {
      ctx.beginPath();
      ctx.moveTo(pts2[0][0], pts2[0][1]);
      for (let k = 1; k < pts2.length; k++) ctx.lineTo(pts2[k][0], pts2[k][1]);
      ctx.closePath();
      const gr = ctx.createLinearGradient(pts2[0][0], pts2[0][1], pts2[2][0], pts2[2][1]);
      gr.addColorStop(0, `rgba(${tint},${bT})`);
      gr.addColorStop(1, `rgba(${tint},${bB})`);
      ctx.fillStyle = gr;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,118,38,0.42)";
      ctx.lineWidth = 1.9;
      ctx.stroke();
    }

    face(pts.left, 0.58, 0.28, t[1]);
    face(pts.right, 0.40, 0.18, t[2]);
    face(pts.top, 1.0, 0.68, t[0]);
    ctx.restore();
  }

  function draw() {
    const { cx, cy } = getCenter();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gp = cubes.reduce((a, c) => a + c.progress, 0) / 4;
    if (gp > 0.04) {
      const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 4.2);
      gr.addColorStop(0, `rgba(195,28,4,${gp * 0.15})`);
      gr.addColorStop(0.5, `rgba(230,75,10,${gp * 0.07})`);
      gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    [3, 2, 1, 0].forEach((i) => {
      const c = cubes[i];
      drawCube(c.x, c.y, S * c.scale, c.alpha, i, c.progress * 0.72);
    });
  }

  // Expose to parent
  stateRef.current = { cubes, draw };

  function onResize() { resize(); draw(); }
  window.addEventListener("resize", onResize);

  let raf;
  function loop() { raf = requestAnimationFrame(loop); draw(); }
  loop();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
  };
}

// ── Hero Section component ──
export default function Hero({
  heroRef,
  brandWrapRef,
  brandTextRef,
  taglineRef,
  scrollHintRef,
  stateRef,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return buildCubeEngine(canvas, stateRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={heroRef}
      style={{ position: "relative", width: "100vw", height: "200vh" }}
    >
      <div
        style={{
          position: "sticky", top: 0,
          width: "100vw", height: "100vh",
          overflow: "hidden", zIndex: 2,
        }}
      >
        <div className="bg-tokify">TOKIFY</div>

        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 3 }}
        />

        <div
          ref={brandWrapRef}
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            zIndex: 10, pointerEvents: "none",
          }}
        >
          <span
            ref={brandTextRef}
            className="brand-glow"
            style={{
              fontFamily: "'Bebas Neue',cursive",
              fontSize: "clamp(320px,11vw,110px)",
              letterSpacing: "0.01em",
              background: "linear-gradient(135deg,#fff 22%,#f56a00 62%,#e8210a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
              display: "block",
            }}
          >
            TOKIFY
          </span>
          <div
            ref={taglineRef}
            style={{
              fontSize: "clamp(9px,1.28vw,12px)",
              letterSpacing: "0.44em",
              color: "rgba(255,255,255,0.28)",
              marginTop: 15,
              textTransform: "uppercase",
              fontFamily: "'Syne',sans-serif",
            }}
          >
            Cross-Border · Web3 · Instant Transfer
          </div>
        </div>

        <div
          ref={scrollHintRef}
          style={{
            position: "absolute", bottom: 34, left: "50%",
            transform: "translateX(-50%)",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 10, zIndex: 20,
          }}
        >
          <span
            style={{
              fontSize: 9, letterSpacing: "0.42em",
              color: "rgba(255,255,255,0.2)", textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
          <div
            style={{
              width: 1, height: 50,
              background: "linear-gradient(to bottom,#e8210a,transparent)",
              animation: "pulse-line 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </section>
  );
}
