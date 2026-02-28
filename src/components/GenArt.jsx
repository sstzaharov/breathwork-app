import { useRef, useEffect, useCallback } from "react";

const hex2rgb = (h) => ({
  r: parseInt(h.slice(1, 3), 16),
  g: parseInt(h.slice(3, 5), 16),
  b: parseInt(h.slice(5, 7), 16),
});

export default function GenArt({ type, color, accent, w = 390, h = 160, seed = 1 }) {
  const ref = useRef(null);

  const draw = useCallback(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const W = w * 2, H = h * 2;
    cvs.width = W;
    cvs.height = H;
    ctx.clearRect(0, 0, W, H);

    let s = seed * 9301 + 49297;
    const rng = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const c = hex2rgb(color);
    const a = hex2rgb(accent);

    if (type === "flow") {
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        const sy = rng() * H;
        ctx.moveTo(0, sy);
        for (let x = 0; x < W; x += 3)
          ctx.lineTo(x, sy + Math.sin(x * 0.007 + i * 1.3) * (35 + i * 14) + Math.sin(x * 0.003 + i * 0.6) * (55 + i * 9));
        ctx.strokeStyle = `rgba(${a.r},${a.g},${a.b},${0.06 + rng() * 0.1})`;
        ctx.lineWidth = 1 + rng() * 2.5;
        ctx.stroke();
      }
      for (let i = 0; i < 4; i++) {
        const x = W * 0.2 + rng() * W * 0.6, y = H * 0.15 + rng() * H * 0.7, r = 25 + rng() * 70;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${a.r},${a.g},${a.b},0.2)`);
        g.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    } else if (type === "grid") {
      const cs = 26;
      for (let x = 0; x < W; x += cs)
        for (let y = 0; y < H; y += cs) {
          if (rng() > 0.55) {
            const d = Math.sqrt((x - W * 0.6) ** 2 + (y - H * 0.5) ** 2);
            const al = Math.max(0, 0.35 - d / (W * 0.65));
            ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${al})`;
            const sz = cs * (0.25 + rng() * 0.55);
            ctx.beginPath();
            ctx.roundRect(x + (cs - sz) / 2, y + (cs - sz) / 2, sz, sz, 3);
            ctx.fill();
          }
        }
    } else if (type === "waves") {
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        const by = H * 0.2 + i * (H * 0.11);
        ctx.moveTo(0, by);
        for (let x = 0; x <= W; x += 2)
          ctx.lineTo(x, by + Math.sin(x * 0.004 + i * 0.9 + seed) * (22 + i * 9) + Math.cos(x * 0.011 + i * 1.4) * (7 + i * 3));
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${0.025 + i * 0.012})`;
        ctx.fill();
      }
    } else if (type === "burst") {
      const cx = W * 0.55, cy = H * 0.5;
      for (let i = 0; i < 45; i++) {
        const ang = rng() * Math.PI * 2, len = 25 + rng() * 130, sr = 12 + rng() * 28;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * sr, cy + Math.sin(ang) * sr);
        ctx.lineTo(cx + Math.cos(ang) * (sr + len), cy + Math.sin(ang) * (sr + len));
        ctx.strokeStyle = `rgba(${a.r},${a.g},${a.b},${0.06 + rng() * 0.14})`;
        ctx.lineWidth = 1 + rng() * 2.5;
        ctx.lineCap = "round";
        ctx.stroke();
      }
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 65);
      g.addColorStop(0, `rgba(${a.r},${a.g},${a.b},0.28)`);
      g.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(cx - 65, cy - 65, 130, 130);
    } else if (type === "rings") {
      const cx = W * 0.5, cy = H * 0.55;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, 22 + i * 24, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${a.r},${a.g},${a.b},${0.14 - i * 0.015})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      for (let i = 0; i < 14; i++) {
        const ang = rng() * Math.PI * 2, d = 25 + rng() * 140;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * d, cy + Math.sin(ang) * d, 1.5 + rng() * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${0.08 + rng() * 0.15})`;
        ctx.fill();
      }
    } else if (type === "nebula") {
      for (let i = 0; i < 7; i++) {
        const x = W * (0.15 + rng() * 0.7), y = H * (0.05 + rng() * 0.9), r = 35 + rng() * 110;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const m = rng();
        const cr = Math.round(c.r * (1 - m) + a.r * m);
        const cg = Math.round(c.g * (1 - m) + a.g * m);
        const cb = Math.round(c.b * (1 - m) + a.b * m);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${0.12 + rng() * 0.16})`);
        g.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.04)`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 35; i++) {
        ctx.beginPath();
        ctx.arc(rng() * W, rng() * H, 0.4 + rng() * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${0.12 + rng() * 0.28})`;
        ctx.fill();
      }
    }
  }, [type, color, accent, w, h, seed]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={ref}
      style={{
        width: w,
        height: h,
        position: "absolute",
        top: 0,
        right: 0,
        pointerEvents: "none",
        opacity: 0.9,
      }}
    />
  );
}
