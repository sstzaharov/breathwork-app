import { useState, useEffect, useRef, useCallback } from "react";
import GenArt from "./GenArt";
import { PlayIcon, PauseIcon, CloseIcon } from "./Icons";
import { categories } from "../data/practices";
import { haptic } from "../utils/telegram";

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getPhases(pattern) {
  const phases = [];
  if (pattern.inhale) phases.push({ label: "вдох", duration: pattern.inhale });
  if (pattern.holdIn) phases.push({ label: "задержка", duration: pattern.holdIn });
  if (pattern.exhale) phases.push({ label: "выдох", duration: pattern.exhale });
  if (pattern.holdOut) phases.push({ label: "задержка", duration: pattern.holdOut });
  return phases;
}

export default function BreathPlayer({ practice: p, onClose }) {
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [finished, setFinished] = useState(false);

  const phases = getPhases(p.pattern);
  const cycleDuration = phases.reduce((sum, ph) => sum + ph.duration, 0);
  const currentPhase = phases[phaseIndex];

  const animRef = useRef(null);
  const lastTimeRef = useRef(null);
  const phaseElapsedRef = useRef(0);
  const elapsedRef = useRef(0);

  const tick = useCallback(
    (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      elapsedRef.current += dt;
      phaseElapsedRef.current += dt;

      const newElapsed = Math.floor(elapsedRef.current);
      if (newElapsed !== elapsed) {
        setElapsed(newElapsed);
      }

      if (elapsedRef.current >= p.durationSec) {
        setFinished(true);
        haptic("success");
        return;
      }

      const phaseDur = phases[phaseIndex].duration;
      if (phaseElapsedRef.current >= phaseDur) {
        phaseElapsedRef.current -= phaseDur;
        setPhaseIndex((prev) => (prev + 1) % phases.length);
        haptic("light");
      }

      setPhaseProgress(phaseElapsedRef.current / phaseDur);
      animRef.current = requestAnimationFrame(tick);
    },
    [elapsed, phaseIndex, phases, p.durationSec]
  );

  useEffect(() => {
    if (playing && !finished) {
      lastTimeRef.current = null;
      animRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [playing, finished, tick]);

  const progress = (elapsed / p.durationSec) * 100;

  // Circle scale based on phase
  const isInhale = currentPhase?.label === "вдох";
  const isExhale = currentPhase?.label === "выдох";
  const circleScale = isInhale
    ? 0.85 + phaseProgress * 0.3
    : isExhale
    ? 1.15 - phaseProgress * 0.3
    : 1.15;

  if (finished) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "#060608",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.5s ease",
          padding: 24,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${p.accentColor}30, transparent)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            marginBottom: 32,
          }}
        >
          ✓
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#F5F5F5", marginBottom: 8, textAlign: "center" }}>
          Практика завершена
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 40, textAlign: "center" }}>
          {p.title} · {p.duration}
        </p>
        <button
          onClick={onClose}
          style={{
            padding: "16px 48px",
            borderRadius: 14,
            border: "none",
            background: p.accentColor,
            color: "#0A0A0F",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          Готово
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#060608",
        display: "flex",
        flexDirection: "column",
        animation: "fadeIn 0.5s ease",
        overflow: "hidden",
      }}
    >
      {/* Background art */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        <GenArt type={p.genType} color={p.color} accent={p.accentColor} w={430} h={900} seed={p.id * 31 + 11} />
      </div>

      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${p.accentColor}16, transparent 70%)`,
          filter: "blur(50px)",
          transform: `translate(-50%, -50%) scale(${circleScale})`,
          transition: "transform 0.3s ease-out",
          opacity: 0.5,
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: "56px 24px 0",
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: p.accentColor,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 6,
              opacity: 0.7,
            }}
          >
            {categories[p.category]}
          </div>
          <div style={{ fontSize: 21, fontWeight: 700, color: "#F5F5F5" }}>{p.title}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.32)", marginTop: 4 }}>Стас · {p.duration}</div>
        </div>
        <button
          onClick={() => {
            haptic("impact");
            onClose();
          }}
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.45)",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CloseIcon size={16} color="rgba(255,255,255,0.45)" />
        </button>
      </div>

      {/* Breathing circle */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: `1px solid ${p.accentColor}15`,
            animation: "pulseRing 6s ease-in-out infinite",
          }}
        />
        {/* Main circle */}
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: `radial-gradient(circle at 40% 35%, ${p.accentColor}28, ${p.color}12)`,
            boxShadow: `0 0 80px ${p.accentColor}0D`,
            transform: `scale(${circleScale})`,
            transition: "transform 0.3s ease-out",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${p.accentColor}1A`,
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {currentPhase?.label}
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 300,
              color: "rgba(255,255,255,0.25)",
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: 4,
            }}
          >
            {Math.ceil(currentPhase?.duration * (1 - phaseProgress))}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: "0 24px 56px", position: "relative", zIndex: 1 }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              height: 3,
              background: "rgba(255,255,255,0.07)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: p.accentColor,
                borderRadius: 2,
                transition: "width 1s linear",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
              fontSize: 11,
              color: "rgba(255,255,255,0.22)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span>{formatTime(elapsed)}</span>
            <span>{formatTime(p.durationSec)}</span>
          </div>
        </div>

        {/* Play/Pause */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36 }}>
          <button
            onClick={() => {
              setElapsed((prev) => Math.max(0, prev - 10));
              elapsedRef.current = Math.max(0, elapsedRef.current - 10);
            }}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.35)",
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            -10
          </button>
          <button
            onClick={() => {
              haptic("select");
              setPlaying(!playing);
            }}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: `2px solid ${p.accentColor}30`,
              background: `${p.accentColor}0D`,
              color: "#F5F5F5",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {playing ? <PauseIcon size={20} color="#F5F5F5" /> : <PlayIcon size={20} color="#F5F5F5" />}
          </button>
          <button
            onClick={() => {
              elapsedRef.current = Math.min(p.durationSec, elapsedRef.current + 10);
              setElapsed(Math.floor(elapsedRef.current));
            }}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.35)",
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            +10
          </button>
        </div>
      </div>
    </div>
  );
}
