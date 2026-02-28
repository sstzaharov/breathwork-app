import { useState, useRef, useEffect, useCallback } from "react";

const practices = [
  { id: 1, title: "Сброс напряжения", duration: "10 мин", durationSec: 600, intensity: 2, category: "перезагрузка", context: "после работы", science: "Удлинённый выдох снижает кортизол и активирует парасимпатику", preview: "Лёгкое тепло в руках, замедление пульса, ощущение тяжести в теле", technique: "Когерентное дыхание 4-6", color: "#2A6B4F", accentColor: "#4ADE80", level: "базовый", genType: "flow", pattern: [4, 0, 6, 0] },
  { id: 2, title: "Фокус перед стартом", duration: "7 мин", durationSec: 420, intensity: 3, category: "фокус", context: "утро", science: "Короткие задержки на вдохе повышают норадреналин и концентрацию", preview: "Прилив бодрости, ясность в голове, лёгкое покалывание в пальцах", technique: "Box Breathing 4-4-4-4", color: "#4A3A6B", accentColor: "#A78BFA", level: "базовый", genType: "grid", pattern: [4, 4, 4, 4] },
  { id: 3, title: "Перезагрузка для сна", duration: "8 мин", durationSec: 480, intensity: 1, category: "сон", context: "перед сном", science: "Ритм 4-7-8 замедляет сердцебиение и готовит тело к глубокому сну", preview: "Глубокое расслабление, сонливость, ощущение «проваливания» в тело", technique: "4-7-8 Breathing", color: "#1E3A5F", accentColor: "#60A5FA", level: "базовый", genType: "waves", pattern: [4, 7, 8, 0] },
  { id: 4, title: "Энергия без кофеина", duration: "5 мин", durationSec: 300, intensity: 4, category: "энергия", context: "день", science: "Капалабхати стимулирует симпатическую систему и повышает бодрость", preview: "Вибрация в теле, тепло, учащённое сердцебиение — это нормально", technique: "Капалабхати + задержки", color: "#6B3A1E", accentColor: "#FB923C", level: "продвинутый", genType: "burst", pattern: [1, 0, 1, 0] },
  { id: 5, title: "Recovery после спорта", duration: "10 мин", durationSec: 600, intensity: 2, category: "recovery", context: "после тренировки", science: "Медленное дыхание ускоряет переход в режим восстановления", preview: "Расслабление мышц, снижение пульса, приятная усталость без напряжения", technique: "Диафрагмальное 5-5", color: "#2D4A3E", accentColor: "#34D399", level: "базовый", genType: "rings", pattern: [5, 0, 5, 0] },
  { id: 6, title: "Отпустить контроль", duration: "25 мин", durationSec: 1500, intensity: 5, category: "глубина", context: "выходные", science: "Связное дыхание снижает активность default mode network мозга", preview: "Эмоции, тетания в руках, слёзы — всё это нормальная реакция тела", technique: "Связное дыхание", color: "#3D1E4A", accentColor: "#C084FC", level: "продвинутый", genType: "nebula", pattern: [3, 0, 3, 0] },
];

const catLabel = { перезагрузка: "Перезагрузка", фокус: "Фокус", сон: "Сон", энергия: "Энергия", recovery: "Recovery", глубина: "Глубина" };
const ctxLabel = { "после работы": "После работы", утро: "Утро", "перед сном": "Перед сном", день: "Днём", "после тренировки": "После тренировки", выходные: "Выходные" };

const hex2rgb = (h) => ({ r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) });

const GenArt = ({ type, color, accent, w = 390, h = 160, seed = 1 }) => {
  const ref = useRef(null);
  const draw = useCallback(() => {
    const cvs = ref.current; if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const dpr = window.devicePixelRatio || 2;
    const W = (cvs.clientWidth || w) * dpr, H = h * dpr;
    cvs.width = W; cvs.height = H;
    ctx.clearRect(0, 0, W, H);
    let s = seed * 9301 + 49297;
    const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const c = hex2rgb(color), a = hex2rgb(accent);

    if (type === "flow") {
      for (let i = 0; i < 9; i++) {
        ctx.beginPath(); const sy = rng() * H;
        ctx.moveTo(0, sy);
        for (let x = 0; x < W; x += 3) ctx.lineTo(x, sy + Math.sin(x*0.007+i*1.3)*(35+i*14) + Math.sin(x*0.003+i*0.6)*(55+i*9));
        ctx.strokeStyle = `rgba(${a.r},${a.g},${a.b},${0.06+rng()*0.1})`;
        ctx.lineWidth = 1 + rng() * 2.5; ctx.stroke();
      }
      for (let i = 0; i < 4; i++) {
        const x = W*0.2+rng()*W*0.6, y = H*0.15+rng()*H*0.7, r = 25+rng()*70;
        const g = ctx.createRadialGradient(x,y,0,x,y,r);
        g.addColorStop(0, `rgba(${a.r},${a.g},${a.b},0.2)`);
        g.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
        ctx.fillStyle = g; ctx.fillRect(x-r,y-r,r*2,r*2);
      }
    } else if (type === "grid") {
      const cs = 26;
      for (let x = 0; x < W; x += cs) for (let y = 0; y < H; y += cs) {
        if (rng() > 0.55) {
          const d = Math.sqrt((x-W*0.6)**2+(y-H*0.5)**2);
          const al = Math.max(0, 0.35-d/(W*0.65));
          ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${al})`;
          const sz = cs*(0.25+rng()*0.55);
          ctx.beginPath(); ctx.roundRect(x+(cs-sz)/2,y+(cs-sz)/2,sz,sz,3); ctx.fill();
        }
      }
    } else if (type === "waves") {
      for (let i = 0; i < 7; i++) {
        ctx.beginPath(); const by = H*0.2+i*(H*0.11);
        ctx.moveTo(0, by);
        for (let x = 0; x <= W; x += 2) ctx.lineTo(x, by + Math.sin(x*0.004+i*0.9+seed)*( 22+i*9) + Math.cos(x*0.011+i*1.4)*(7+i*3));
        ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
        ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${0.025+i*0.012})`; ctx.fill();
      }
    } else if (type === "burst") {
      const cx = W*0.55, cy = H*0.5;
      for (let i = 0; i < 45; i++) {
        const ang = rng()*Math.PI*2, len = 25+rng()*130, sr = 12+rng()*28;
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(ang)*sr, cy+Math.sin(ang)*sr);
        ctx.lineTo(cx+Math.cos(ang)*(sr+len), cy+Math.sin(ang)*(sr+len));
        ctx.strokeStyle = `rgba(${a.r},${a.g},${a.b},${0.06+rng()*0.14})`;
        ctx.lineWidth = 1+rng()*2.5; ctx.lineCap = "round"; ctx.stroke();
      }
      const g = ctx.createRadialGradient(cx,cy,0,cx,cy,65);
      g.addColorStop(0, `rgba(${a.r},${a.g},${a.b},0.28)`);
      g.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
      ctx.fillStyle = g; ctx.fillRect(cx-65,cy-65,130,130);
    } else if (type === "rings") {
      const cx = W*0.5, cy = H*0.55;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath(); ctx.arc(cx,cy,22+i*24,0,Math.PI*2);
        ctx.strokeStyle = `rgba(${a.r},${a.g},${a.b},${0.14-i*0.015})`;
        ctx.lineWidth = 1.2; ctx.stroke();
      }
      for (let i = 0; i < 14; i++) {
        const ang = rng()*Math.PI*2, d = 25+rng()*140;
        ctx.beginPath(); ctx.arc(cx+Math.cos(ang)*d, cy+Math.sin(ang)*d, 1.5+rng()*4, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${0.08+rng()*0.15})`; ctx.fill();
      }
    } else if (type === "nebula") {
      for (let i = 0; i < 7; i++) {
        const x = W*(0.15+rng()*0.7), y = H*(0.05+rng()*0.9), r = 35+rng()*110;
        const g = ctx.createRadialGradient(x,y,0,x,y,r);
        const m = rng();
        const cr = Math.round(c.r*(1-m)+a.r*m), cg = Math.round(c.g*(1-m)+a.g*m), cb = Math.round(c.b*(1-m)+a.b*m);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${0.12+rng()*0.16})`);
        g.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.04)`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      }
      for (let i = 0; i < 35; i++) {
        ctx.beginPath(); ctx.arc(rng()*W,rng()*H,0.4+rng()*1.8,0,Math.PI*2);
        ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${0.12+rng()*0.28})`; ctx.fill();
      }
    }
  }, [type, color, accent, w, h, seed]);

  useEffect(() => { draw(); }, [draw]);
  return <canvas ref={ref} style={{ width: "100%", height: h, position: "absolute", top: 0, left: 0, pointerEvents: "none", opacity: 0.9 }} />;
};

const Dots = ({ n, color }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[1,2,3,4,5].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i<=n?color:"rgba(255,255,255,0.13)" }} />)}
  </div>
);

const Card = ({ p, i, onClick, onPlay }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => onClick(p)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: `linear-gradient(145deg, ${p.color}12, ${p.color}28)`, borderRadius: 20, padding: "22px 20px", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)", transform: hov?"translateY(-3px) scale(1.01)":"translateY(0)", border: `1px solid ${p.color}22`, minHeight: 155, animation: `fadeSlideIn 0.5s ease ${i*0.08}s both` }}>
      <GenArt type={p.genType} color={p.color} accent={p.accentColor} w={390} h={155} seed={p.id*7+3} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: p.accentColor, background: `${p.accentColor}18`, padding: "3px 8px", borderRadius: 6 }}>{catLabel[p.category]}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: 6 }}>{ctxLabel[p.context]}</span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#F0F0F0", margin: "0 0 6px", lineHeight: 1.25, fontFamily: "'Outfit',sans-serif", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>{p.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'JetBrains Mono',monospace" }}>{p.duration}</span>
            <Dots n={p.intensity} color={p.accentColor} />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{p.level}</span>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", margin: 0, lineHeight: 1.45, fontStyle: "italic" }}>⚡ {p.science}</p>
        </div>
        <div onClick={(e) => { e.stopPropagation(); onPlay(p); }} style={{ width: 48, height: 48, borderRadius: "50%", background: p.accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#0A0A0F", flexShrink: 0, marginLeft: 14, marginTop: 6, boxShadow: `0 0 30px ${p.accentColor}30`, cursor: "pointer" }}>▶</div>
      </div>
    </div>
  );
};

const Detail = ({ p, onClose, onPlay }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }} />
    <div style={{ position: "relative", marginTop: "auto", background: "#0A0A0F", borderRadius: "24px 24px 0 0", maxHeight: "88vh", overflowY: "auto", overflowX: "hidden" }}>
      <div style={{ position: "relative", height: 180, overflow: "hidden", borderRadius: "24px 24px 0 0", background: `linear-gradient(180deg, ${p.color}55, ${p.color}08)` }}>
        <GenArt type={p.genType} color={p.color} accent={p.accentColor} w={430} h={180} seed={p.id*13+7} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, #0A0A0F)" }} />
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
        {/* Back button */}
        <button onClick={onClose} style={{ position: "absolute", top: 20, left: 16, width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.7)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>←</button>
      </div>
      <div style={{ padding: "0 24px 48px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: p.accentColor }}>{catLabel[p.category]}</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{ctxLabel[p.context]}</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{p.level}</span>
        </div>
        <h2 style={{ fontSize: 27, fontWeight: 700, color: "#F5F5F5", margin: "0 0 16px", lineHeight: 1.2, fontFamily: "'Outfit',sans-serif" }}>{p.title}</h2>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <button onClick={onPlay} style={{ width: 56, height: 56, borderRadius: "50%", border: "none", background: p.accentColor, color: "#0A0A0F", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${p.accentColor}30` }}>▶</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono',monospace" }}>{p.duration}</span>
          <Dots n={p.intensity} color={p.accentColor} />
        </div>
        <div style={{ background: "rgba(255,255,255,0.045)", borderRadius: 14, padding: "14px 16px", marginBottom: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.28)", marginBottom: 5 }}>Техника</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", fontFamily: "'JetBrains Mono',monospace" }}>{p.technique}</div>
        </div>
        <div style={{ background: `${p.accentColor}0B`, borderRadius: 14, padding: "14px 16px", marginBottom: 12, borderLeft: `3px solid ${p.accentColor}30` }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: p.accentColor, marginBottom: 5, opacity: 0.65 }}>⚡ Почему работает</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.68)", lineHeight: 1.55 }}>{p.science}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "14px 16px", marginBottom: 28, border: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.28)", marginBottom: 5 }}>💡 Что будет происходить</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.58)", lineHeight: 1.55 }}>{p.preview}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${p.color}, ${p.accentColor}50)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff" }}>S</div>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Стас</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.32)" }}>Breathwork-инструктор</div></div>
        </div>
      </div>
    </div>
  </div>
);

const PHASES = ["вдох","задержка","выдох","задержка"];
const MIN_SC = 0.78, MAX_SC = 1.18, RNG = MAX_SC - MIN_SC;
function getCircleScale(pi, pd, c) {
  if (pd === 0) return pi <= 1 ? MAX_SC : MIN_SC;
  const pr = (pd - c) / pd;
  if (pi === 0) return MIN_SC + pr * RNG;
  if (pi === 1) return MAX_SC;
  if (pi === 2) return MAX_SC - pr * RNG;
  return MIN_SC;
}

const Player = ({ p, onClose }) => {
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const pattern = p.pattern || [4, 4, 4, 4];
  const hasPattern = pattern.some(v => v > 0);
  const initPhase = () => { let i = 0; while (pattern[i] === 0 && i < 4) i++; return i; };

  const [phaseIdx, setPhaseIdx] = useState(initPhase);
  const [count, setCount] = useState(() => pattern[initPhase()]);

  const nextPhase = useCallback((current) => {
    let next = (current + 1) % 4;
    let safety = 0;
    while (pattern[next] === 0 && safety < 4) { next = (next + 1) % 4; safety++; }
    return next;
  }, [pattern]);

  useEffect(() => {
    if (!playing || !hasPattern) return;
    const iv = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          setPhaseIdx(current => {
            const next = nextPhase(current);
            setTimeout(() => setCount(pattern[next]), 0);
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [playing, hasPattern, pattern, nextPhase]);

  useEffect(() => {
    if (!playing) return;
    const total = p.durationSec || 600;
    const iv = setInterval(() => {
      setProgress(prev => prev >= 100 ? 100 : prev + (100 / total));
    }, 1000);
    return () => clearInterval(iv);
  }, [playing, p.durationSec]);

  const elapsed = Math.floor((progress / 100) * (p.durationSec || 600));
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
  const phaseName = PHASES[phaseIdx];
  const phaseDuration = pattern[phaseIdx];

  const circleScale = hasPattern ? getCircleScale(phaseIdx, phaseDuration, count) : 1;
  const glowOp = hasPattern ? 0.25 + ((circleScale - MIN_SC) / RNG) * 0.45 : undefined;
  const circOp = hasPattern ? 0.6 + ((circleScale - MIN_SC) / RNG) * 0.4 : undefined;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#060608", display: "flex", flexDirection: "column", animation: "fadeIn 0.5s ease", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.45 }}><GenArt type={p.genType} color={p.color} accent={p.accentColor} w={430} h={900} seed={p.id*31+11} /></div>
      <div style={{ position: "absolute", top: "35%", left: "50%", width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle,${p.accentColor}16,transparent 70%)`, filter: "blur(50px)", ...(hasPattern ? { transform: `translate(-50%,-50%) scale(${circleScale})`, opacity: glowOp, transition: "transform 1s linear, opacity 1s linear" } : { animation: "breatheGlow 6s ease-in-out infinite" }) }} />
      <div style={{ padding: "56px 24px 0", position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: p.accentColor, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, opacity: 0.7 }}>{catLabel[p.category]}</div>
          <div style={{ fontSize: 21, fontWeight: 700, color: "#F5F5F5", fontFamily: "'Outfit',sans-serif" }}>{p.title}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.32)", marginTop: 4 }}>Стас · {p.duration}</div>
        </div>
        <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <div style={{ width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${p.accentColor}28, ${p.color}12)`, boxShadow: `0 0 80px ${p.accentColor}0D`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `1px solid ${p.accentColor}1A`, ...(hasPattern ? { transform: `scale(${circleScale})`, opacity: circOp, transition: "transform 1s linear, opacity 1s linear" } : { animation: "breatheCircle 6s ease-in-out infinite" }) }}>
          {hasPattern && count > 0 && (
            <span key={count} style={{ fontSize: 42, fontWeight: 300, color: "rgba(255,255,255,0.75)", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1, animation: "countPop 0.3s ease-out" }}>{count}</span>
          )}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: hasPattern && count > 0 ? 6 : 0, transition: "opacity 0.3s" }}>{phaseName}</span>
        </div>
        {hasPattern && phaseDuration > 0 && (
          <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
            {Array.from({ length: phaseDuration }, (_, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i < count ? p.accentColor : `${p.accentColor}25`, transition: "background 0.3s" }} />
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "0 24px 56px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden", cursor: "pointer" }} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setProgress(((e.clientX-r.left)/r.width)*100); }}>
            <div style={{ width: `${progress}%`, height: "100%", background: p.accentColor, borderRadius: 2, transition: "width 0.2s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "'JetBrains Mono',monospace" }}><span>{timeStr}</span><span>{p.duration}</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36 }}>
          <button onClick={() => setProgress(prev => Math.max(0, prev - (10/(p.durationSec||600))*100))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>-10</button>
          <button onClick={() => setPlaying(!playing)} style={{ width: 60, height: 60, borderRadius: "50%", border: `2px solid ${p.accentColor}30`, background: `${p.accentColor}0D`, color: "#F5F5F5", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{playing?"⏸":"▶"}</button>
          <button onClick={() => setProgress(prev => Math.min(100, prev + (10/(p.durationSec||600))*100))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>+10</button>
        </div>
      </div>
    </div>
  );
};

const onboardingSlides = [
  { title: "Дыши — и чувствуй разницу", text: "Breathwork — это активная практика через дыхание. Работает даже когда медитировать не получается.", accent: "#4ADE80", color: "#2A6B4F", genType: "flow" },
  { title: "7–25 минут — ощутимый результат", text: "Выбери практику под свой запрос: сбросить стресс, собрать фокус, восстановиться после спорта или подготовиться ко сну.", accent: "#A78BFA", color: "#4A3A6B", genType: "nebula" },
];

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
    // Edge vignette to hide any remaining hard edges
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

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const slide = onboardingSlides[step];
  const isLast = step === onboardingSlides.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#0A0A0F", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Animated breathing GenArt background */}
      <div style={{ position: "absolute", inset: 0 }} key={step}>
        <OnboardingBg type={slide.genType} color={slide.color} accent={slide.accent} />
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(transparent, #0A0A0F 70%)", pointerEvents: "none", zIndex: 1 }} />

      {/* Skip */}
      <div style={{ padding: "52px 20px 0", position: "relative", zIndex: 2, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onComplete} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", fontFamily: "'Outfit',sans-serif", padding: "6px 0" }}>Пропустить</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 32px 0", position: "relative", zIndex: 2 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#F5F5F5", textAlign: "center", marginBottom: 14, fontFamily: "'Outfit',sans-serif", lineHeight: 1.25, animation: "fadeSlideIn 0.4s ease both" }} key={step}>{slide.title}</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 1.6, marginBottom: 48, animation: "fadeSlideIn 0.4s ease 0.08s both" }} key={step+"t"}>{slide.text}</p>
      </div>

      {/* Bottom: dots + button */}
      <div style={{ padding: "0 32px 56px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {onboardingSlides.map((_, i) => <div key={i} style={{ width: i===step?20:6, height: 6, borderRadius: 3, background: i===step?slide.accent:"rgba(255,255,255,0.12)", transition: "all 0.3s" }} />)}
        </div>
        <button onClick={() => isLast ? onComplete() : setStep(step+1)} style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: slide.accent, color: "#0A0A0F", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "background 0.3s" }}>{isLast ? "Начать" : "Дальше"}</button>
      </div>
    </div>
  );
};

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [sel, setSel] = useState(null);
  const [play, setPlay] = useState(null);
  const [filt, setFilt] = useState("all");
  const h = new Date().getHours();
  const tod = h<12?"morning":h<17?"afternoon":h<21?"evening":"night";
  const greet = { morning:"Доброе утро", afternoon:"Добрый день", evening:"Добрый вечер", night:"Спокойной ночи" }[tod];
  const rec = { morning: practices.find(p=>p.context==="утро"), afternoon: practices.find(p=>p.context==="день"), evening: practices.find(p=>p.context==="после работы"), night: practices.find(p=>p.context==="перед сном") }[tod] || practices[0];
  const filters = ["all","перезагрузка","фокус","сон","энергия","recovery","глубина"];
  const list = filt==="all" ? practices : practices.filter(p=>p.category===filt);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{display:none}
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes breatheCircle{0%,100%{transform:scale(0.85);opacity:0.7}40%{transform:scale(1.15);opacity:1}60%{transform:scale(1.15);opacity:1}}
        @keyframes breatheGlow{0%,100%{opacity:0.3;transform:translate(-50%,-50%) scale(0.9)}50%{opacity:0.6;transform:translate(-50%,-50%) scale(1.1)}}
        @keyframes countPop{0%{transform:scale(1.3);opacity:0.3}100%{transform:scale(1);opacity:1}}
        @keyframes onboardBreathe{0%,100%{transform:scale(1);opacity:0.45}50%{transform:scale(1.12);opacity:0.7}}
      `}</style>
      <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#F0F0F0", maxWidth: 430, margin: "0 auto", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: 430, height: 280, background: `radial-gradient(ellipse at 50% 0%, ${rec.color}22, transparent 70%)`, pointerEvents: "none" }} />

        {/* Header */}
        <div style={{ padding: "52px 20px 0", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Breathwork with Stas</span>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${rec.color},${rec.accentColor}50)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>S</div>
          </div>
          <h1 style={{ fontSize: 25, fontWeight: 700, color: "#F5F5F5", marginBottom: 3, fontFamily: "'Outfit',sans-serif" }}>{greet}</h1>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.32)" }}>Когда медитировать не получается — дыши</p>
        </div>

        {/* Recommended */}
        <div style={{ padding: "24px 20px 0", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.22)", marginBottom: 10, fontWeight: 600 }}>Для тебя сейчас</div>
          <div onClick={() => setSel(rec)} style={{ background: `linear-gradient(135deg,${rec.color}35,${rec.color}10)`, borderRadius: 22, padding: "26px 22px", cursor: "pointer", position: "relative", overflow: "hidden", border: `1px solid ${rec.color}28`, minHeight: 170 }}>
            <GenArt type={rec.genType} color={rec.color} accent={rec.accentColor} w={390} h={170} seed={rec.id*17+5} />
            <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: rec.accentColor, letterSpacing: "0.06em", textTransform: "uppercase" }}>{catLabel[rec.category]}</span>
                <h2 style={{ fontSize: 21, fontWeight: 700, color: "#F5F5F5", margin: "8px 0 6px", fontFamily: "'Outfit',sans-serif", lineHeight: 1.2, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>{rec.title}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'JetBrains Mono',monospace" }}>{rec.duration}</span>
                  <Dots n={rec.intensity} color={rec.accentColor} />
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", fontStyle: "italic", lineHeight: 1.4 }}>⚡ {rec.science}</p>
              </div>
              <div onClick={(e) => { e.stopPropagation(); setPlay(rec); }} style={{ width: 48, height: 48, borderRadius: "50%", background: rec.accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#0A0A0F", flexShrink: 0, marginLeft: 14, marginTop: 10, boxShadow: `0 0 30px ${rec.accentColor}30`, cursor: "pointer" }}>▶</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: "24px 20px 0", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.22)", marginBottom: 10, fontWeight: 600 }}>Все практики</div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilt(f)} style={{ padding: "6px 13px", borderRadius: 9, border: filt===f?"1px solid rgba(255,255,255,0.16)":"1px solid rgba(255,255,255,0.05)", background: filt===f?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.02)", color: filt===f?"rgba(255,255,255,0.82)":"rgba(255,255,255,0.32)", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Outfit',sans-serif", fontWeight: 500, transition: "all 0.2s" }}>{f==="all"?"Все":catLabel[f]}</button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div style={{ padding: "14px 20px 100px", display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 1 }}>
          {list.map((p,i) => <Card key={p.id} p={p} i={i} onClick={setSel} onPlay={setPlay} />)}
        </div>

        {/* Bottom nav */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 430, padding: "14px 20px 22px", background: "linear-gradient(transparent,#0A0A0F 40%)", display: "flex", justifyContent: "center", gap: 40, zIndex: 50 }}>
          {["Сегодня","Поиск","Профиль"].map((t,i) => <span key={t} style={{ fontSize: 11, color: i===0?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.22)", fontWeight: i===0?600:400, letterSpacing: "0.04em", cursor: "pointer" }}>{t}</span>)}
        </div>
      </div>

      {!onboarded && <Onboarding onComplete={() => setOnboarded(true)} />}
      {sel && !play && <Detail p={sel} onClose={() => setSel(null)} onPlay={() => { setPlay(sel); setSel(null); }} />}
      {play && <Player p={play} onClose={() => setPlay(null)} />}
    </>
  );
}
