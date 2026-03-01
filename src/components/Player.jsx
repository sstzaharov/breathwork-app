import { useState, useEffect, useCallback, useRef } from "react";
import GenArt from "./GenArt";
import { PlayIcon, PauseIcon, CloseIcon } from "./Icons";
import { catLabel } from "../data/practices";

const PHASES = ["вдох", "задержка", "выдох", "задержка"];
const MIN_SCALE = 0.78;
const MAX_SCALE = 1.18;
const RANGE = MAX_SCALE - MIN_SCALE;

function getCircleScale(phaseIdx, phaseDuration, count) {
  if (phaseDuration === 0) return phaseIdx <= 1 ? MAX_SCALE : MIN_SCALE;
  const progress = (phaseDuration - count) / phaseDuration;
  switch (phaseIdx) {
    case 0: return MIN_SCALE + progress * RANGE;
    case 1: return MAX_SCALE;
    case 2: return MAX_SCALE - progress * RANGE;
    case 3: return MIN_SCALE;
    default: return 1;
  }
}

const Player = ({ p, onClose }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);
  const hasAudio = !!p.audioUrl;

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

  // --- Audio setup ---
  useEffect(() => {
    if (!hasAudio) {
      // Нет аудио — автоплей анимации как раньше
      setPlaying(true);
      return;
    }

    const audio = new Audio();
    audio.preload = "auto";
    audio.src = p.audioUrl;
    audioRef.current = audio;

    const onCanPlay = () => {
      setAudioReady(true);
      // Автоплей после загрузки
      audio.play().then(() => {
        setPlaying(true);
      }).catch((err) => {
        console.warn("Autoplay blocked:", err);
        // На iOS/Telegram autoplay может быть заблокирован — ждём нажатия
        setPlaying(false);
      });
    };

    const onError = (e) => {
      console.error("Audio error:", e);
      setAudioError(true);
      // Fallback: запускаем анимацию без звука
      setPlaying(true);
    };

    const onEnded = () => {
      setPlaying(false);
      setProgress(100);
    };

    audio.addEventListener("canplaythrough", onCanPlay);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [hasAudio, p.audioUrl]);

  // --- Sync progress with audio ---
  useEffect(() => {
    if (!hasAudio || !audioRef.current) return;
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      if (audio.duration && audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [hasAudio, audioReady]);

  // --- Play/Pause sync ---
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (hasAudio && audio) {
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        audio.play().then(() => setPlaying(true)).catch(console.warn);
      }
    } else {
      setPlaying(prev => !prev);
    }
  }, [hasAudio, playing]);

  // --- Seek ---
  const seek = useCallback((deltaSec) => {
    const audio = audioRef.current;
    if (hasAudio && audio && audio.duration) {
      audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + deltaSec));
    } else {
      const total = p.durationSec || 600;
      setProgress(prev => Math.max(0, Math.min(100, prev + (deltaSec / total) * 100)));
    }
  }, [hasAudio, p.durationSec]);

  const seekToProgress = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - r.left) / r.width) * 100;
    const audio = audioRef.current;
    if (hasAudio && audio && audio.duration) {
      audio.currentTime = (pct / 100) * audio.duration;
    } else {
      setProgress(pct);
    }
  }, [hasAudio]);

  // --- Close handler: stop audio ---
  const handleClose = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  }, [onClose]);

  // Breathing cycle — 1s ticks
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

  // Session progress (only when NO audio — fallback timer)
  useEffect(() => {
    if (!playing || hasAudio) return;
    const total = p.durationSec || 600;
    const iv = setInterval(() => {
      setProgress(prev => prev >= 100 ? 100 : prev + (100 / total));
    }, 1000);
    return () => clearInterval(iv);
  }, [playing, hasAudio, p.durationSec]);

  // --- Computed time display ---
  const getTimeDisplay = () => {
    const audio = audioRef.current;
    if (hasAudio && audio && audio.duration > 0) {
      const cur = Math.floor(audio.currentTime);
      const dur = Math.floor(audio.duration);
      const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
      return { elapsed: fmt(cur), total: fmt(dur) };
    }
    const total = p.durationSec || 600;
    const elapsed = Math.floor((progress / 100) * total);
    const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    return { elapsed: fmt(elapsed), total: p.duration };
  };
  const time = getTimeDisplay();

  const phaseName = PHASES[phaseIdx];
  const phaseDuration = pattern[phaseIdx];

  const circleScale = hasPattern ? getCircleScale(phaseIdx, phaseDuration, count) : 1;
  const glowOpacity = hasPattern ? 0.25 + ((circleScale - MIN_SCALE) / RANGE) * 0.45 : undefined;
  const circleOpacity = hasPattern ? 0.6 + ((circleScale - MIN_SCALE) / RANGE) * 0.4 : undefined;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#060608", display: "flex", flexDirection: "column", animation: "fadeIn 0.5s ease", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.45 }}>
        <GenArt type={p.genType} color={p.color} accent={p.accentColor} w={430} h={900} seed={p.id*31+11} />
      </div>

      {/* Background glow — synced */}
      <div style={{
        position: "absolute", top: "35%", left: "50%",
        width: 350, height: 350, borderRadius: "50%",
        background: `radial-gradient(circle,${p.accentColor}16,transparent 70%)`,
        filter: "blur(50px)",
        ...(hasPattern
          ? { transform: `translate(-50%,-50%) scale(${circleScale})`, opacity: glowOpacity, transition: "transform 1s linear, opacity 1s linear" }
          : { animation: "breatheGlow 6s ease-in-out infinite" }
        )
      }} />

      {/* Header */}
      <div style={{ padding: "56px 24px 0", position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: p.accentColor, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, opacity: 0.7 }}>{catLabel[p.category]}</div>
          <div style={{ fontSize: 21, fontWeight: 700, color: "#F5F5F5", fontFamily: "'Outfit',sans-serif" }}>{p.title}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.32)", marginTop: 4 }}>Стас · {p.duration}</div>
        </div>
        <button onClick={handleClose} style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><CloseIcon size={16} color="rgba(255,255,255,0.45)" /></button>
      </div>

      {/* Loading indicator */}
      {hasAudio && !audioReady && !audioError && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10, fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono',monospace" }}>
          загрузка...
        </div>
      )}

      {/* Breathing circle — synced */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <div style={{
          width: 160, height: 160, borderRadius: "50%",
          background: `radial-gradient(circle at 40% 35%, ${p.accentColor}28, ${p.color}12)`,
          boxShadow: `0 0 80px ${p.accentColor}0D`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          border: `1px solid ${p.accentColor}1A`,
          ...(hasPattern
            ? { transform: `scale(${circleScale})`, opacity: circleOpacity, transition: "transform 1s linear, opacity 1s linear" }
            : { animation: "breatheCircle 6s ease-in-out infinite" }
          )
        }}>
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

      {/* Controls */}
      <div style={{ padding: "0 24px 56px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden", cursor: "pointer" }} onClick={seekToProgress}>
            <div style={{ width: `${progress}%`, height: "100%", background: p.accentColor, borderRadius: 2, transition: "width 0.2s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "'JetBrains Mono',monospace" }}>
            <span>{time.elapsed}</span>
            <span>{time.total}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36 }}>
          <button onClick={() => seek(-10)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>-10</button>
          <button onClick={togglePlay} style={{ width: 60, height: 60, borderRadius: "50%", border: `2px solid ${p.accentColor}30`, background: `${p.accentColor}0D`, color: "#F5F5F5", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{playing ? <PauseIcon size={20} color="#F5F5F5" /> : <PlayIcon size={20} color="#F5F5F5" />}</button>
          <button onClick={() => seek(10)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>+10</button>
        </div>
      </div>
    </div>
  );
};

export default Player;
