import { useRef, useEffect, useCallback } from "react";

// Copied VERBATIM from breathing-genart-demo.jsx lines 32-89
function AnimatedGenArt({ scale, time, accent }) {
  const ref = useRef(null);
  const hex2rgb = (h) => ({ r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) });

  const draw = useCallback(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const W = cvs.width, H = cvs.height;
    ctx.clearRect(0, 0, W, H);

    const a = hex2rgb(accent);
    let s = 42 * 9301 + 49297;
    const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

    // Flow lines across full screen height
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      const sy = (i / 14) * H * 0.9 + rng() * H * 0.1;
      const timeOffset = time * 0.15 + i * 0.3;
      const scaleAmp = 0.7 + scale * 0.4;
      ctx.moveTo(0, sy);
      for (let x = 0; x < W; x += 3) {
        const y = sy
          + Math.sin(x * 0.005 + i * 1.3 + timeOffset) * (30 + i * 8) * scaleAmp
          + Math.sin(x * 0.002 + i * 0.6 + timeOffset * 0.5) * (45 + i * 6) * scaleAmp;
        ctx.lineTo(x, y);
      }
      const baseAlpha = 0.04 + rng() * 0.07;
      ctx.strokeStyle = `rgba(${a.r},${a.g},${a.b},${baseAlpha * (0.6 + scale * 0.5)})`;
      ctx.lineWidth = 1 + rng() * 2;
      ctx.stroke();
    }

    // Glowing orbs spread across screen
    for (let i = 0; i < 6; i++) {
      const bx = W * 0.1 + rng() * W * 0.8;
      const by = H * 0.1 + rng() * H * 0.8;
      const ox = bx + Math.sin(time * 0.3 + i * 2.1) * 15;
      const oy = by + Math.cos(time * 0.25 + i * 1.7) * 12;
      const r = (30 + rng() * 80) * (0.8 + scale * 0.3);
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
      g.addColorStop(0, `rgba(${a.r},${a.g},${a.b},${0.1 + scale * 0.08})`);
      g.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(ox - r, oy - r, r * 2, r * 2);
    }
  }, [scale, time, accent]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <canvas ref={ref} width={860} height={1720}
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", opacity: 0.9, zIndex: 0 }}
    />
  );
}

export default AnimatedGenArt;
