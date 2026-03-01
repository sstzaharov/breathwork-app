import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { PlayIcon, PauseIcon, CloseIcon } from "./Icons";
import { useBreathTimeline } from "../hooks/useBreathTimeline";
import BreathCircle from "./BreathCircle";
import PhaseDots from "./PhaseDots";
import { catLabel } from "../data/practices";

const MIN_SCALE = 0.78;
const RANGE = 1.18 - MIN_SCALE;
const HOLD_COLOR = "#FB923C";

const SEGMENT_LABELS = { pulse: "интро", sequence: "дыхание", hold: "задержка", cycle: "дыхание" };

const Player = ({ p, onClose }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);
  const hasAudio = !!p.audioUrl;
  const [currentTime, setCurrentTime] = useState(0);

  // Timeline-driven breathing visualization
  const breath = useBreathTimeline(p.breathPattern || p.pattern, currentTime);

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
        setCurrentTime(audio.currentTime);
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

  // currentTime ticker (when no audio — fallback timer)
  useEffect(() => {
    if (!playing || hasAudio) return;
    const iv = setInterval(() => {
      setCurrentTime(prev => prev + 0.1);
    }, 100);
    return () => clearInterval(iv);
  }, [playing, hasAudio]);

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

  const isHold = breath.segmentType === "hold";
  const activeColor = isHold ? HOLD_COLOR : p.accentColor;
  const glowOpacity = 0.25 + ((breath.scale - MIN_SCALE) / RANGE) * 0.45;
  const showCount = breath.count > 0 && (breath.segmentType === "cycle" || breath.segmentType === "hold");

  // Timeline segments for the segment bar (only for new timeline format, not single-cycle)
  const bp = p.breathPattern || p.pattern;
  const timeline = useMemo(() => {
    if (!bp || Array.isArray(bp)) return null; // legacy format — no segment bar
    if (bp.timeline && bp.timeline.length > 1) return bp.timeline;
    return null;
  }, [bp]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#060608", display: "flex", flexDirection: "column", animation: "fadeIn 0.5s ease", overflow: "hidden" }}>

      {/* Background glow — synced */}
      <div style={{
        position: "absolute", top: "35%", left: "50%",
        width: 350, height: 350, borderRadius: "50%",
        background: `radial-gradient(circle,${activeColor}16,transparent 70%)`,
        filter: "blur(50px)",
        transform: `translate(-50%,-50%) scale(${breath.scale})`,
        opacity: glowOpacity,
        transition: "transform 0.15s linear, opacity 0.15s linear",
      }} />

      {/* Header */}
      <div style={{ padding: "56px 24px 0", position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: activeColor, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, opacity: 0.7 }}>{catLabel[p.category]}</div>
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

      {/* Breathing circle — timeline-driven */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BreathCircle scale={breath.scale} color={p.color} accentColor={activeColor} size={160} />
          <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
            {showCount && (
              <span key={breath.count} style={{ fontSize: 42, fontWeight: 300, color: "rgba(255,255,255,0.75)", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1, animation: "countPop 0.3s ease-out" }}>{breath.count}</span>
            )}
            <span style={{ fontSize: 11, color: activeColor, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: showCount ? 6 : 0, transition: "color 0.3s, opacity 0.3s", opacity: 0.85 }}>{breath.label}</span>
          </div>
        </div>

        <PhaseDots phases={breath.phases} phaseIndex={breath.phaseIndex} accentColor={activeColor} />
      </div>

      {/* Controls */}
      <div style={{ padding: "0 24px 56px", position: "relative", zIndex: 1 }}>
        {/* Timeline segment bar */}
        {timeline && (
          <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
            {timeline.map((seg, i) => {
              const isActiveSeg = currentTime >= seg.start && (i === timeline.length - 1 || currentTime < timeline[i + 1].start);
              return (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ height: 3, borderRadius: 2, background: isActiveSeg ? activeColor : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
                  <div style={{ fontSize: 8, color: isActiveSeg ? activeColor : "rgba(255,255,255,0.2)", marginTop: 4, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.05em", textTransform: "uppercase", transition: "color 0.3s" }}>{seg.label || SEGMENT_LABELS[seg.type] || ""}</div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden", cursor: "pointer" }} onClick={seekToProgress}>
            <div style={{ width: `${progress}%`, height: "100%", background: activeColor, borderRadius: 2, transition: "width 0.2s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "'JetBrains Mono',monospace" }}>
            <span>{time.elapsed}</span>
            <span>{time.total}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36 }}>
          <button onClick={() => seek(-10)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>-10</button>
          <button onClick={togglePlay} style={{ width: 60, height: 60, borderRadius: "50%", border: `2px solid ${activeColor}30`, background: `${activeColor}0D`, color: "#F5F5F5", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{playing ? <PauseIcon size={20} color="#F5F5F5" /> : <PlayIcon size={20} color="#F5F5F5" />}</button>
          <button onClick={() => seek(10)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>+10</button>
        </div>
      </div>
    </div>
  );
};

export default Player;
