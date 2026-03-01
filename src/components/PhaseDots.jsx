// Copied from breathing-genart-demo.jsx lines 148-163
// Adapted: useBreathTimeline returns phases as array of numbers (not objects)
function PhaseDots({ phases, phaseIndex }) {
  if (!phases) return null;
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", justifyContent: "center" }}>
      {phases.map((duration, i) => {
        if (duration === 0) return null;
        return (
          <div key={i} style={{
            width: duration >= 1 ? 22 : 8, height: 6, borderRadius: 3,
            background: i === phaseIndex ? "rgba(74, 222, 128, 0.9)" : "rgba(255, 255, 255, 0.08)",
            transition: "background 0.15s, box-shadow 0.15s",
            boxShadow: i === phaseIndex ? "0 0 8px rgba(74, 222, 128, 0.4)" : "none",
          }} />
        );
      })}
    </div>
  );
}

export default PhaseDots;
