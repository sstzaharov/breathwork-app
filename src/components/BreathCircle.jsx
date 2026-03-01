import { useRef, useEffect } from "react";

const BreathCircle = ({ scale = 1, color = "#2A6B4F", accentColor = "#4ADE80", size = 160 }) => {
  const canvasRef = useRef(null);
  const currentScale = useRef(scale);
  const rafId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const canvasSize = size * 2; // extra space for glow
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    ctx.scale(dpr, dpr);

    const center = canvasSize / 2;
    const baseRadius = size / 2;

    function draw() {
      // Lerp toward target scale
      currentScale.current += (scale - currentScale.current) * 0.12;

      const r = baseRadius * currentScale.current;

      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // Outer glow
      const glowGrad = ctx.createRadialGradient(center, center, r * 0.6, center, center, r * 1.6);
      glowGrad.addColorStop(0, accentColor + "12");
      glowGrad.addColorStop(0.5, accentColor + "06");
      glowGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(center, center, r * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Main circle gradient
      const mainGrad = ctx.createRadialGradient(
        center - r * 0.15, center - r * 0.2, 0,
        center, center, r
      );
      mainGrad.addColorStop(0, accentColor + "38");
      mainGrad.addColorStop(0.6, color + "20");
      mainGrad.addColorStop(1, color + "08");
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.fillStyle = mainGrad;
      ctx.fill();

      // Subtle inner highlight
      const innerGrad = ctx.createRadialGradient(
        center - r * 0.2, center - r * 0.25, 0,
        center, center, r * 0.7
      );
      innerGrad.addColorStop(0, accentColor + "18");
      innerGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(center, center, r * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = innerGrad;
      ctx.fill();

      rafId.current = requestAnimationFrame(draw);
    }

    rafId.current = requestAnimationFrame(draw);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [scale, color, accentColor, size]);

  const canvasSize = size * 2;

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: canvasSize,
        height: canvasSize,
        margin: -(size / 2), // offset to center within size×size box
      }}
    />
  );
};

export default BreathCircle;
