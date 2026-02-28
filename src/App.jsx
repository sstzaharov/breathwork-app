import { useState, useEffect } from "react";
import { catLabel } from "./data/practices";
import { usePractices } from "./hooks/usePractices";
import { upsertUser } from "./lib/user-service";
import GenArt from "./components/GenArt";
import Dots from "./components/Dots";
import Card from "./components/Card";
import Detail from "./components/Detail";
import Player from "./components/Player";
import Onboarding from "./components/Onboarding";
import "./styles.css";

const STORAGE_KEY = "bws_onboarded";

export default function App() {
  const [onboarded, setOnboarded] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
  });
  const { practices } = usePractices();
  const [currentUser, setCurrentUser] = useState(null);
  const [sel, setSel] = useState(null);
  const [play, setPlay] = useState(null);
  const [filt, setFilt] = useState("all");

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    console.log('TG WebApp:', tg);
    console.log('TG user:', tg?.initDataUnsafe?.user);

    if (tg) {
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        upsertUser(user).then(u => {
          console.log('Upsert result:', u);
          setCurrentUser(u);
        });
      }
    }
  }, []);

  const h = new Date().getHours();
  const tod = h < 12 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night";
  const greet = { morning: "Доброе утро", afternoon: "Добрый день", evening: "Добрый вечер", night: "Спокойной ночи" }[tod];
  const rec = { morning: practices.find(p => p.context === "утро"), afternoon: practices.find(p => p.context === "день"), evening: practices.find(p => p.context === "после работы"), night: practices.find(p => p.context === "перед сном") }[tod] || practices[0];

  const filters = ["all", "перезагрузка", "фокус", "сон", "энергия", "recovery", "глубина"];
  const list = filt === "all" ? practices : practices.filter(p => p.category === filt);

  const completeOnboarding = () => {
    setOnboarded(true);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
  };

  return (
    <>
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
            <GenArt type={rec.genType} color={rec.color} accent={rec.accentColor} w={390} h={170} seed={rec.id * 17 + 5} />
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
              <button key={f} onClick={() => setFilt(f)} style={{ padding: "6px 13px", borderRadius: 9, border: filt === f ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(255,255,255,0.05)", background: filt === f ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)", color: filt === f ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.32)", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Outfit',sans-serif", fontWeight: 500, transition: "all 0.2s" }}>{f === "all" ? "Все" : catLabel[f]}</button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div style={{ padding: "14px 20px 40px", display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 1 }}>
          {list.map((p, i) => <Card key={p.id} p={p} i={i} onClick={setSel} onPlay={setPlay} />)}
        </div>
      </div>

      {!onboarded && <Onboarding onComplete={completeOnboarding} />}
      {sel && !play && <Detail p={sel} onClose={() => setSel(null)} onPlay={() => { setPlay(sel); setSel(null); }} />}
      {play && <Player p={play} onClose={() => setPlay(null)} />}
    </>
  );
}
