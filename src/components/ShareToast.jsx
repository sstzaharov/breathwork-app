import { useState, useEffect } from "react";

const ShareToast = ({ message, onDone }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
      background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)",
      padding: "10px 20px", borderRadius: 12, fontSize: 13, color: "#fff",
      zIndex: 9999, opacity: visible ? 1 : 0, transition: "opacity 0.3s ease",
      whiteSpace: "nowrap",
    }}>
      {message}
    </div>
  );
};

export default ShareToast;
