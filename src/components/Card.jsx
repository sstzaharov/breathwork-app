import { useState } from "react";
import GenArt from "./GenArt";
import Dots from "./Dots";
import { PlayIcon, HeartIcon } from "./Icons";
import { catLabel, ctxLabel } from "../data/practices";

const Card = ({ p, i, onClick, onPlay, isFav, onToggleFav }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => onClick(p)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: `linear-gradient(145deg, ${p.color}12, ${p.color}28)`, borderRadius: 20, padding: "26px 22px", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)", transform: hov?"translateY(-3px) scale(1.01)":"translateY(0)", border: `1px solid ${p.color}22`, minHeight: 155, animation: `fadeSlideIn 0.5s ease ${i*0.08}s both` }}>
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: 10, flexShrink: 0, marginLeft: 14, alignSelf: "stretch" }}>
          {onToggleFav && <button onClick={(e) => { e.stopPropagation(); onToggleFav(p.id); }} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}><HeartIcon size={15} filled={isFav} color={isFav ? "#FF6B8A" : "rgba(255,255,255,0.45)"} /></button>}
          <div onClick={(e) => { e.stopPropagation(); onPlay(p); }} style={{ width: 48, height: 48, borderRadius: "50%", background: p.accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#0A0A0F", boxShadow: `0 0 30px ${p.accentColor}30`, cursor: "pointer" }}><PlayIcon size={18} color="#0A0A0F" /></div>
        </div>
      </div>
    </div>
  );
};

export default Card;
