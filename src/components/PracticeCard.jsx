import { useState } from "react";
import GenArt from "./GenArt";
import IntensityDots from "./IntensityDots";
import { categories, contexts } from "../data/practices";
import { haptic } from "../utils/telegram";

export default function PracticeCard({ practice: p, index, onClick }) {
  const [pressed, setPressed] = useState(false);

  return (
    <div
      onClick={() => {
        haptic("light");
        onClick(p);
      }}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: `linear-gradient(145deg, ${p.color}12, ${p.color}28)`,
        borderRadius: 20,
        padding: "22px 20px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: pressed ? "scale(0.97)" : "translateY(0)",
        border: `1px solid ${p.color}22`,
        minHeight: 155,
        animation: `fadeSlideIn 0.5s ease ${index * 0.08}s both`,
      }}
    >
      <GenArt type={p.genType} color={p.color} accent={p.accentColor} w={390} h={155} seed={p.id * 7 + 3} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Tags */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: p.accentColor,
              background: `${p.accentColor}18`,
              padding: "3px 8px",
              borderRadius: 6,
            }}
          >
            {categories[p.category]}
          </span>
          <span
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.45)",
              background: "rgba(255,255,255,0.06)",
              padding: "3px 8px",
              borderRadius: 6,
            }}
          >
            {contexts[p.context]}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#F0F0F0",
            margin: "0 0 6px",
            lineHeight: 1.25,
            textShadow: "0 1px 8px rgba(0,0,0,0.5)",
          }}
        >
          {p.title}
        </h3>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'JetBrains Mono', monospace" }}>
            {p.duration}
          </span>
          <IntensityDots n={p.intensity} color={p.accentColor} />
          <span
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.28)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {p.level}
          </span>
        </div>

        {/* Science */}
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", margin: 0, lineHeight: 1.45, fontStyle: "italic" }}>
          ⚡ {p.science}
        </p>
      </div>
    </div>
  );
}
