const Dots = ({ n, color }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[1,2,3,4,5].map(i => (
      <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i <= n ? color : "rgba(255,255,255,0.13)" }} />
    ))}
  </div>
);

export default Dots;
