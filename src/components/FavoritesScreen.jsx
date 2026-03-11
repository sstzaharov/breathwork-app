import Card from "./Card";
import { BackArrowIcon, HeartIcon } from "./Icons";

const FavoritesScreen = ({ favorites, practices, onClose, onSelect, onPlay, onToggleFav }) => {
  const favPractices = practices.filter(p => favorites.has(p.id));

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100, background: "#0A0A0F",
      display: "flex", flexDirection: "column", animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {/* Header */}
      <div style={{ padding: "56px 20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onClose} style={{
          width: 34, height: 34, borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
        }}>
          <BackArrowIcon size={16} color="rgba(255,255,255,0.7)" />
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F5F5F5", margin: 0, fontFamily: "'Outfit',sans-serif" }}>Избранное</h1>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 40px" }}>
        {favPractices.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {favPractices.map((p, i) => (
              <Card key={p.id} p={p} i={i} onClick={onSelect} onPlay={onPlay} isFav={favorites.has(p.id)} onToggleFav={onToggleFav} />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
            <HeartIcon size={48} color="rgba(255,255,255,0.1)" />
            <div style={{ fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>Пока пусто</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.2)", textAlign: "center", maxWidth: 260, lineHeight: 1.5 }}>
              Нажми на сердечко на карточке практики, чтобы добавить её в избранное
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesScreen;
