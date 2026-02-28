import { useState, useEffect } from "react";
import PracticeCard from "./components/PracticeCard";
import PracticeDetail from "./components/PracticeDetail";
import BreathPlayer from "./components/BreathPlayer";
import GenArt from "./components/GenArt";
import IntensityDots from "./components/IntensityDots";
import {
  practices,
  categories,
  getTimeOfDay,
  getGreeting,
  getRecommendedPractice,
} from "./data/practices";
import { initTelegram, haptic } from "./utils/telegram";

const filterKeys = ["all", "reset", "focus", "sleep", "energy", "recovery", "depth"];

export default function App() {
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    initTelegram();
  }, []);

  const tod = getTimeOfDay();
  const greeting = getGreeting(tod);
  const recommended = getRecommendedPractice(tod);
  const list = filter === "all" ? practices : practices.filter((p) => p.category === filter);

  return (
    <div
      style={{
        minHeight: "100vh",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top ambient glow */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 430,
          height: 280,
          background: `radial-gradient(ellipse at 50% 0%, ${recommended.color}22, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Scrollable content */}
      <div
        style={{
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ padding: "52px 20px 0", position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.28)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Breathwork with Stas
            </span>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${recommended.color}, ${recommended.accentColor}50)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              S
            </div>
          </div>
          <h1 style={{ fontSize: 25, fontWeight: 700, color: "#F5F5F5", marginBottom: 3 }}>
            {greeting}
          </h1>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.32)" }}>
            Когда медитировать не получается — дыши
          </p>
        </div>

        {/* Recommended card */}
        <div style={{ padding: "24px 20px 0", position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.22)",
              marginBottom: 10,
              fontWeight: 600,
            }}
          >
            Для тебя сейчас
          </div>
          <div
            onClick={() => {
              haptic("light");
              setSelected(recommended);
            }}
            style={{
              background: `linear-gradient(135deg, ${recommended.color}35, ${recommended.color}10)`,
              borderRadius: 22,
              padding: "26px 22px",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              border: `1px solid ${recommended.color}28`,
              minHeight: 170,
            }}
          >
            <GenArt
              type={recommended.genType}
              color={recommended.color}
              accent={recommended.accentColor}
              w={390}
              h={170}
              seed={recommended.id * 17 + 5}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: recommended.accentColor,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {categories[recommended.category]}
                </span>
                <h2
                  style={{
                    fontSize: 21,
                    fontWeight: 700,
                    color: "#F5F5F5",
                    margin: "8px 0 6px",
                    lineHeight: 1.2,
                    textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                  }}
                >
                  {recommended.title}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.45)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {recommended.duration}
                  </span>
                  <IntensityDots n={recommended.intensity} color={recommended.accentColor} />
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.38)",
                    fontStyle: "italic",
                    lineHeight: 1.4,
                  }}
                >
                  ⚡ {recommended.science}
                </p>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: recommended.accentColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: "#0A0A0F",
                  flexShrink: 0,
                  marginLeft: 14,
                  marginTop: 10,
                  boxShadow: `0 0 30px ${recommended.accentColor}30`,
                }}
              >
                ▶
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: "24px 20px 0", position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.22)",
              marginBottom: 10,
              fontWeight: 600,
            }}
          >
            Все практики
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 2,
            }}
          >
            {filterKeys.map((f) => (
              <button
                key={f}
                onClick={() => {
                  haptic("select");
                  setFilter(f);
                }}
                style={{
                  padding: "6px 13px",
                  borderRadius: 9,
                  border:
                    filter === f
                      ? "1px solid rgba(255,255,255,0.16)"
                      : "1px solid rgba(255,255,255,0.05)",
                  background:
                    filter === f ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                  color:
                    filter === f ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.32)",
                  fontSize: 11,
                  whiteSpace: "nowrap",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                {categories[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Practice cards */}
        <div
          style={{
            padding: "14px 20px 40px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            position: "relative",
            zIndex: 1,
          }}
        >
          {list.map((p, i) => (
            <PracticeCard key={p.id} practice={p} index={i} onClick={setSelected} />
          ))}
        </div>
      </div>

      {/* Detail bottom sheet */}
      {selected && !playing && (
        <PracticeDetail
          practice={selected}
          onClose={() => setSelected(null)}
          onPlay={() => {
            setPlaying(selected);
            setSelected(null);
          }}
        />
      )}

      {/* Full-screen player */}
      {playing && <BreathPlayer practice={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}
