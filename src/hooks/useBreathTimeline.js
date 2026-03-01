import { useMemo } from "react";

const MIN_SCALE = 0.78;
const MAX_SCALE = 1.18;
const RANGE = MAX_SCALE - MIN_SCALE;

const PHASE_LABELS = {
  inhale: "вдох",
  exhale: "выдох",
  hold: "задержка",
  "hold-in": "задержка",
  "hold-out": "задержка",
};

// --- Format detection & normalization ---

function isLegacyPattern(bp) {
  return Array.isArray(bp) && bp.length === 4 && bp.every(v => typeof v === "number");
}

function normalize(bp) {
  if (!bp) return { timeline: [{ start: 0, type: "cycle", pattern: [4, 4, 4, 4] }] };

  if (isLegacyPattern(bp)) {
    return { timeline: [{ start: 0, type: "cycle", pattern: bp }] };
  }

  if (bp.timeline && Array.isArray(bp.timeline)) {
    return bp;
  }

  // Unknown format — fallback
  return { timeline: [{ start: 0, type: "cycle", pattern: [4, 4, 4, 4] }] };
}

// --- Find active segment by currentTime ---

function findSegment(timeline, time) {
  let seg = timeline[0];
  for (let i = 1; i < timeline.length; i++) {
    if (timeline[i].start <= time) seg = timeline[i];
    else break;
  }
  return seg;
}

// --- Segment calculators ---

function calcCycle(seg, time) {
  const pattern = seg.pattern || [4, 4, 4, 4];
  const phases = ["вдох", "задержка", "выдох", "задержка"];

  // Total cycle duration (skip zero-duration phases)
  const activeDurations = pattern.map((d, i) => ({ duration: d, index: i })).filter(p => p.duration > 0);
  if (activeDurations.length === 0) {
    return { scale: 1, label: "", count: 0, phaseIndex: 0, phases: null, segmentType: "cycle" };
  }

  const cycleLen = pattern.reduce((s, v) => s + v, 0);
  const elapsed = (time - (seg.start || 0)) % cycleLen;

  let acc = 0;
  let phaseIdx = 0;
  let phaseElapsed = 0;
  for (let i = 0; i < 4; i++) {
    if (pattern[i] === 0) continue;
    if (acc + pattern[i] > elapsed) {
      phaseIdx = i;
      phaseElapsed = elapsed - acc;
      break;
    }
    acc += pattern[i];
  }

  const phaseDuration = pattern[phaseIdx];
  const count = Math.ceil(phaseDuration - phaseElapsed);
  const progress = phaseElapsed / phaseDuration;

  let scale;
  switch (phaseIdx) {
    case 0: scale = MIN_SCALE + progress * RANGE; break;      // вдох: expand
    case 1: scale = MAX_SCALE; break;                          // задержка: hold big
    case 2: scale = MAX_SCALE - progress * RANGE; break;      // выдох: shrink
    case 3: scale = MIN_SCALE; break;                          // задержка: hold small
    default: scale = 1;
  }

  const label = phases[phaseIdx];

  return {
    scale,
    label,
    count,
    phaseIndex: phaseIdx,
    phases: pattern,
    segmentType: "cycle",
  };
}

function calcPulse(seg, time) {
  const bpm = seg.bpm || 12;
  const freq = bpm / 60; // cycles per second
  const elapsed = time - (seg.start || 0);
  const t = (elapsed * freq * Math.PI * 2);
  // Smooth sine wave: 0→1→0→-1→0
  const sine = Math.sin(t);
  const scale = MIN_SCALE + ((sine + 1) / 2) * RANGE;

  return {
    scale,
    label: seg.label || "дыши свободно",
    count: 0,
    phaseIndex: -1,
    phases: null,
    segmentType: "pulse",
  };
}

function calcSequence(seg, time) {
  const phases = seg.phases || [];
  if (phases.length === 0) return calcPulse(seg, time);

  const totalLen = phases.reduce((s, p) => s + p.duration, 0);
  const elapsed = (time - (seg.start || 0)) % totalLen;

  let acc = 0;
  let activePhase = phases[0];
  let activeIdx = 0;
  let phaseElapsed = 0;
  for (let i = 0; i < phases.length; i++) {
    if (acc + phases[i].duration > elapsed) {
      activePhase = phases[i];
      activeIdx = i;
      phaseElapsed = elapsed - acc;
      break;
    }
    acc += phases[i].duration;
  }

  const count = Math.ceil(activePhase.duration - phaseElapsed);
  const progress = phaseElapsed / activePhase.duration;
  const action = activePhase.action || "inhale";

  let scale;
  if (action === "inhale") {
    scale = MIN_SCALE + progress * RANGE;
  } else if (action === "exhale") {
    scale = MAX_SCALE - progress * RANGE;
  } else if (action === "hold" || action === "hold-in") {
    scale = MAX_SCALE;
  } else if (action === "hold-out") {
    scale = MIN_SCALE;
  } else {
    scale = 1;
  }

  const label = activePhase.label || PHASE_LABELS[action] || action;

  return {
    scale,
    label,
    count: activePhase.duration >= 1 ? count : 0,
    phaseIndex: activeIdx,
    phases: phases.map(p => p.duration),
    segmentType: "sequence",
  };
}

function calcHold(seg, time, nextSegStart) {
  const elapsed = time - (seg.start || 0);
  const duration = nextSegStart ? nextSegStart - seg.start : seg.duration || 30;
  const remaining = Math.max(0, Math.ceil(duration - elapsed));

  return {
    scale: MIN_SCALE,
    label: "задержка",
    count: remaining,
    phaseIndex: -1,
    phases: null,
    segmentType: "hold",
  };
}

// --- Main hook ---

export function useBreathTimeline(breathPattern, currentTime) {
  const normalized = useMemo(() => normalize(breathPattern), [breathPattern]);

  const timeline = normalized.timeline;
  const time = currentTime || 0;

  const seg = findSegment(timeline, time);

  // Find next segment start (for hold duration)
  const segIdx = timeline.indexOf(seg);
  const nextSegStart = segIdx < timeline.length - 1 ? timeline[segIdx + 1].start : null;

  let result;
  switch (seg.type) {
    case "pulse":
      result = calcPulse(seg, time);
      break;
    case "sequence":
      result = calcSequence(seg, time);
      break;
    case "hold":
      result = calcHold(seg, time, nextSegStart);
      break;
    case "cycle":
    default:
      result = calcCycle(seg, time);
      break;
  }

  return {
    ...result,
    segmentLabel: seg.label || null,
  };
}
