import GenArt from "./GenArt";
import IntensityDots from "./IntensityDots";
import { categories, contexts } from "../data/practices";
import { haptic, sharePractice } from "../utils/telegram";

export default function PracticeDetail({ practice: p, onClose, onPlay }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "relative",
          marginTop: "auto",
          background: "#0A0A0F",
          borderRadius: "24px 24px 0 0",
          maxHeight: "88vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Hero */}
        <div
          style={{
            position: "relative",
            height: 180,
            overflow: "hidden",
            borderRadius: "24px 24px 0 0",
            background: `linear-gradient(180deg, ${p.color}55, ${p.color}08)`,
          }}
        >
          <GenArt type={p.genType} color={p.color} accent={p.accentColor} w={430} h={180} seed={p.id * 13 + 7} />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              background: "linear-gradient(transparent, #0A0A0F)",
            }}
          />
          {/* Handle */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 40,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.2)",
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: "0 24px 48px" }}>
          {/* Tags */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: p.accentColor,
              }}
            >
              {categories[p.category]}
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{contexts[p.context]}</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{p.level}</span>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 27, fontWeight: 700, color: "#F5F5F5", margin: "0 0 8px", lineHeight: 1.2 }}>
            {p.title}
          </h2>

          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>
              {p.duration}
            </span>
            <IntensityDots n={p.intensity} color={p.accentColor} />
          </div>

          {/* Description */}
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, marginBottom: 18 }}>
            {p.description}
          </p>

          {/* Technique */}
          <div
            style={{
              background: "rgba(255,255,255,0.045)",
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 12,
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.28)",
                marginBottom: 5,
              }}
            >
              Техника
            </div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", fontFamily: "'JetBrains Mono', monospace" }}>
              {p.technique}
            </div>
          </div>

          {/* Science */}
          <div
            style={{
              background: `${p.accentColor}0B`,
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 12,
              borderLeft: `3px solid ${p.accentColor}30`,
            }}
          >
            <div
              style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: p.accentColor,
                marginBottom: 5,
                opacity: 0.65,
              }}
            >
              ⚡ Почему работает
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.68)", lineHeight: 1.55 }}>{p.science}</div>
          </div>

          {/* Preview */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 24,
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.28)",
                marginBottom: 5,
              }}
            >
              💡 Что будет происходить
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.58)", lineHeight: 1.55 }}>{p.preview}</div>
          </div>

          {/* Guide profile */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
              padding: "12px 0",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${p.color}, ${p.accentColor}50)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              S
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Стас</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.32)" }}>Breathwork-инструктор</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                haptic("select");
                sharePractice(p);
              }}
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                border: `1px solid ${p.accentColor}25`,
                background: `${p.accentColor}0A`,
                color: p.accentColor,
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ↗
            </button>
            <button
              onClick={() => {
                haptic("success");
                onPlay();
              }}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 14,
                border: "none",
                background: p.accentColor,
                color: "#0A0A0F",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              ▶ Начать практику
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
