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

        if (isShort) {
          return (
            <div
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: isActive ? accentColor : accentColor + "25",
                transition: "background 0.3s",
              }}
            />
          );
        }

        // Width proportional to duration, clamped between 8 and 40
        const w = Math.max(8, Math.min(40, duration * 6));
        return (
          <div
            key={i}
            style={{
              width: w,
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
