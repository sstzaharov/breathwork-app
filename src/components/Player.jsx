import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { PlayIcon, PauseIcon, CloseIcon } from "./Icons";
import { useBreathTimeline } from "../hooks/useBreathTimeline";
import BreathCircle from "./BreathCircle";
import PhaseDots from "./PhaseDots";
import AnimatedGenArt from "./AnimatedGenArt";
import { catLabel } from "../data/practices";

const HOLD_COLOR = "#FB923C";

const Player = ({ p, onClose }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);
  const hasAudio = !!p.audioUrl;
  const [currentTime, setCurrentTime] = useState(0);

  // rAF ticker — updates animTime EVERY FRAME for AnimatedGenArt (like prototype's main App)
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const offsetRef = useRef(0);
  const [animTime, setAnimTime] = useState(0);

  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    startRef.current = performance.now();
    const tick = (now) => {
      if (hasAudio && audioRef.current && audioRef.current.duration > 0) {
        setAnimTime(audioRef.current.currentTime);
      } else {
        const elapsed = offsetRef.current + (now - startRef.current) / 1000;
        setAnimTime(elapsed);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, hasAudio]);

  // Timeline-driven breathing visualization
  const breath = useBreathTimeline(p.breathPattern || p.pattern, currentTime);

  // --- Audio setup (NOT TOUCHED) ---
  useEffect(() => {
    if (!hasAudio) {
      setPlaying(true);
      return;
    }

    const audio = new Audio();
    audio.preload = "auto";
    audio.src = p.audioUrl;
    audioRef.current = audio;

    const onCanPlay = () => {
      setAudioReady(true);
      audio.play().then(() => {
        setPlaying(true);
      }).catch((err) => {
        console.warn("Autoplay blocked:", err);
        setPlaying(false);
      });
    };

    const onError = (e) => {
      console.error("Audio error:", e);
      setAudioError(true);
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

  // --- Sync progress with audio (NOT TOUCHED) ---
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

  // --- Play/Pause sync (NOT TOUCHED) ---
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
      if (playing) offsetRef.current = animTime;
      setPlaying(prev => !prev);
    }
  }, [hasAudio, playing, animTime]);

  // --- Seek (NOT TOUCHED) ---
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

  // --- Close handler (NOT TOUCHED) ---
  const handleClose = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  }, [onClose]);

  // currentTime ticker — fallback when no audio (NOT TOUCHED)
  useEffect(() => {
    if (!playing || hasAudio) return;
    const iv = setInterval(() => {
      setCurrentTime(prev => prev + 0.1);
    }, 100);
    return () => clearInterval(iv);
  }, [playing, hasAudio]);

  // Session progress — fallback when no audio (NOT TOUCHED)
  useEffect(() => {
    if (!playing || hasAudio) return;
    const total = p.durationSec || 600;
    const iv = setInterval(() => {
      setProgress(prev => prev >= 100 ? 100 : prev + (100 / total));
    }, 1000);
    return () => clearInterval(iv);
  }, [playing, hasAudio, p.durationSec]);

  // --- Computed time display (NOT TOUCHED) ---
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

  // --- Visual state ---
  const isHold = breath.segmentType === "hold";
  const accentHex = isHold ? HOLD_COLOR : p.accentColor;

  // Timeline segments (only for new timeline format with >1 segments)
  const bp = p.breathPattern || p.pattern;
  const timeline = useMemo(() => {
    if (!bp || Array.isArray(bp)) return null;
    if (bp.timeline && bp.timeline.length > 1) return bp.timeline;
    return null;
  }, [bp]);

  const totalDuration = useMemo(() => {
    if (hasAudio && audioRef.current && audioRef.current.duration > 0) return audioRef.current.duration;
    return p.durationSec || 600;
  }, [hasAudio, p.durationSec]);

  // ─── JSX layout copied from prototype ───
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, background: "#060608",
      display: "flex", flexDirection: "column", animation: "fadeIn 0.5s ease",
    }}>

      {/* Fullscreen gen art background — prototype AnimatedGenArt */}
      <AnimatedGenArt scale={breath.scale} time={animTime} accent={accentHex} />

      {/* Header — zIndex: 3 */}
      <div style={{ padding: "56px 24px 0", position: "relative", zIndex: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: accentHex, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, opacity: 0.7 }}>{catLabel[p.category]}</div>
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

      {/* Circle area — layout from prototype */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: 340, position: "relative", width: "100%",
      }}>
        {/* Breath circle — zIndex: 2 */}
        <BreathCircle scale={breath.scale} accentColor={accentHex} size={250} />

        {/* Hold countdown — absolute center of circle, like prototype */}
        {isHold && breath.count > 0 && (
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -55%)",
            fontSize: 42, fontWeight: 700, color: "rgba(251, 146, 60, 0.7)",
            fontFamily: "'JetBrains Mono',monospace", zIndex: 3,
          }}>
            {breath.count}
          </div>
        )}

        {/* Phase label — BELOW circle, marginTop: -16, like prototype */}
        <div style={{
          marginTop: -16, minHeight: 24, position: "relative", zIndex: 3,
          fontSize: 14, fontWeight: 500, letterSpacing: "0.08em",
          color: isHold ? "rgba(251, 146, 60, 0.7)" : "rgba(74, 222, 128, 0.65)",
          fontFamily: "'JetBrains Mono',monospace",
          transition: "color 0.3s", textAlign: "center",
        }}>
          {isHold ? "задержка" : (breath.label || "")}
        </div>

        {/* Phase dots — below label */}
        <div style={{ marginTop: 12, minHeight: 12, position: "relative", zIndex: 3 }}>
          <PhaseDots phases={breath.phases} phaseIndex={breath.phaseIndex} />
        </div>
      </div>

      {/* Controls — zIndex: 3 */}
      <div style={{ padding: "0 24px 56px", position: "relative", zIndex: 3 }}>
        {/* Timeline segment bar — like prototype TimelineBar, only for new timeline format */}
        {timeline && (
          <div style={{ position: "relative", height: 24, marginBottom: 4 }}>
            {timeline.map((seg, i) => {
              const left = (seg.start / totalDuration) * 100;
              const nextStart = timeline[i + 1]?.start ?? totalDuration;
              const width = ((nextStart - seg.start) / totalDuration) * 100;
              const isActive = currentTime >= seg.start && currentTime < nextStart;
              const colors = { pulse: "rgba(74,222,128,0.12)", sequence: "rgba(74,222,128,0.22)", hold: "rgba(251,146,60,0.18)" };
              const borderColors = { pulse: "rgba(74,222,128,0.18)", sequence: "rgba(74,222,128,0.32)", hold: "rgba(251,146,60,0.28)" };
              return (
                <div key={i} style={{
                  position: "absolute", left: `${left}%`, width: `${width}%`, height: "100%", borderRadius: 4,
                  background: isActive ? (colors[seg.type] || "rgba(74,222,128,0.12)") : "rgba(255,255,255,0.025)",
                  border: `1px solid ${isActive ? (borderColors[seg.type] || "rgba(74,222,128,0.18)") : "rgba(255,255,255,0.035)"}`,
                  transition: "background 0.3s", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    fontSize: 8, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.04em",
                    color: isActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.13)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", padding: "0 3px",
                  }}>{seg.label || ""}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, cursor: "pointer" }} onClick={seekToProgress}>
            <div style={{ width: `${progress}%`, height: "100%", borderRadius: 2, background: "rgba(74,222,128,0.6)", transition: "width 0.1s linear" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "'JetBrains Mono',monospace" }}>
            <span>{time.elapsed}</span>
            <span>{time.total}</span>
          </div>
        </div>

        {/* Play controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36 }}>
          <button onClick={() => seek(-10)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>-10</button>
          <button onClick={togglePlay} style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.06)", color: "#F5F5F5", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{playing ? <PauseIcon size={20} color="#F5F5F5" /> : <PlayIcon size={20} color="#F5F5F5" />}</button>
          <button onClick={() => seek(10)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>+10</button>
        </div>
      </div>
    </div>
  );
};

export default Player;
