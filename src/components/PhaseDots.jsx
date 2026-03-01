const PhaseDots = ({ phases, phaseIndex, accentColor = "#4ADE80" }) => {
  if (!phases || !Array.isArray(phases)) return null;

  const active = phases.filter(d => d > 0);
  if (active.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 20 }}>
      {phases.map((duration, i) => {
        if (duration === 0) return null;
        const isActive = i === phaseIndex;
        const isShort = duration < 1;

        return (
          <div
            key={i}
            style={{
              width: isShort ? 8 : 22,
              height: 6,
              borderRadius: 3,
              background: isActive ? accentColor : accentColor + "25",
              transition: "background 0.3s",
            }}
          />
        );
      })}
    </div>
  );
};

export default PhaseDots;
