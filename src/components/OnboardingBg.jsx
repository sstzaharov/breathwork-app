import { useRef, useEffect, useCallback } from "react";
import { hex2rgb } from "../utils/helpers";

const OnboardingBg = ({ type, color, accent }) => {
  const ref = useRef(null);
  const animRef = useRef(null);
  const draw = useCallback((time) => {
    const cvs = ref.current; if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = cvs.clientWidth * dpr;
    const H = cvs.clientHeight * dpr;
    if (cvs.width !== W || cvs.height !== H) { cvs.width = W; cvs.height = H; }
    ctx.clearRect(0, 0, W, H);
    const c = hex2rgb(color), a = hex2rgb(accent);
    const breathe = 0.5 + 0.5 * Math.sin(time * 0.001);
    const scale = 0.9 + breathe * 0.2;
    ctx.save();
    ctx.translate(W/2, H*0.38);
    ctx.scale(scale, scale);
    ctx.translate(-W/2, -H*0.38);

    if (type === "flow") {
      const margin = W * 0.15;
      for (let layer = 0; layer < 3; layer++) {
        let s = (layer+1) * 9301 + 49297;
        const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
        for (let i = 0; i < 12; i++) {
          ctx.beginPath();
          const sy = H * 0.05 + rng() * H * 0.8;
          const phase = time * 0.0003 * (0.5 + layer * 0.3) + i * 0.5;
          ctx.moveTo(-margin, sy);
          for (let x = -margin; x < W + margin; x += 3) {
            ctx.lineTo(x, sy + Math.sin(x*0.005 + phase + i*1.3)*(40+i*16) + Math.sin(x*0.002 + phase*0.7 + i*0.6)*(60+i*10));
          }
          const al = (0.12 + rng()*0.18) * (0.6 + breathe * 0.4);
          ctx.strokeStyle = `rgba(${a.r},${a.g},${a.b},${al})`;
          ctx.lineWidth = 1.2 + rng() * 3; ctx.stroke();
        }
        for (let i = 0; i < 6; i++) {
          const x = W*0.1+rng()*W*0.8, y = H*0.1+rng()*H*0.6, r = 40+rng()*100;
          const g = ctx.createRadialGradient(x,y,0,x,y,r * (0.8+breathe*0.4));
          g.addColorStop(0, `rgba(${a.r},${a.g},${a.b},${0.25 * (0.5+breathe*0.5)})`);
          g.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
          ctx.fillStyle = g; ctx.fillRect(x-r*1.5,y-r*1.5,r*3,r*3);
        }
      }
    } else if (type === "nebula") {
      for (let layer = 0; layer < 3; layer++) {
        let s = (layer+5) * 7301 + 39297;
        const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
        for (let i = 0; i < 10; i++) {
          const x = W*(0.05+rng()*0.9), y = H*(0.05+rng()*0.65);
          const r = (50+rng()*150) * (0.85+breathe*0.3);
          const g = ctx.createRadialGradient(x,y,0,x,y,r);
          const m = rng();
          const cr = Math.round(c.r*(1-m)+a.r*m), cg = Math.round(c.g*(1-m)+a.g*m), cb = Math.round(c.b*(1-m)+a.b*m);
          const al = (0.15+rng()*0.2) * (0.5+breathe*0.5);
          g.addColorStop(0, `rgba(${cr},${cg},${cb},${al})`);
          g.addColorStop(0.5, `rgba(${cr},${cg},${cb},${al*0.3})`);
          g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
        }
        for (let i = 0; i < 50; i++) {
          const al = (0.15+rng()*0.35) * (0.5+breathe*0.5);
          ctx.beginPath(); ctx.arc(rng()*W, rng()*H*0.75, 0.5+rng()*2.5, 0, Math.PI*2);
          ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${al})`; ctx.fill();
        }
      }
    }
    ctx.restore();
    // Edge vignette
    const edgeSize = W * 0.15;
    const gl = ctx.createLinearGradient(0,0,edgeSize,0);
    gl.addColorStop(0, "#0A0A0F"); gl.addColorStop(1, "transparent");
    ctx.fillStyle = gl; ctx.fillRect(0,0,edgeSize,H);
    const gr = ctx.createLinearGradient(W-edgeSize,0,W,0);
    gr.addColorStop(0, "transparent"); gr.addColorStop(1, "#0A0A0F");
    ctx.fillStyle = gr; ctx.fillRect(W-edgeSize,0,edgeSize,H);
    const gt = ctx.createLinearGradient(0,0,0,edgeSize);
    gt.addColorStop(0, "#0A0A0F"); gt.addColorStop(1, "transparent");
    ctx.fillStyle = gt; ctx.fillRect(0,0,W,edgeSize);
    animRef.current = requestAnimationFrame(draw);
  }, [type, color, accent]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return <canvas ref={ref} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
};

export default OnboardingBg;
