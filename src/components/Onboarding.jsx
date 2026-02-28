import { useState } from "react";
import OnboardingBg from "./OnboardingBg";

const slides = [
  { title: "Дыши — и чувствуй разницу", text: "Breathwork — это активная практика через дыхание. Работает даже когда медитировать не получается.", accent: "#4ADE80", color: "#2A6B4F", genType: "flow" },
  { title: "7–25 минут — ощутимый результат", text: "Выбери практику под свой запрос: сбросить стресс, собрать фокус, восстановиться после спорта или подготовиться ко сну.", accent: "#A78BFA", color: "#4A3A6B", genType: "nebula" },
];

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#0A0A0F", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0 }} key={step}>
        <OnboardingBg type={slide.genType} color={slide.color} accent={slide.accent} />
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(transparent, #0A0A0F 70%)", pointerEvents: "none", zIndex: 1 }} />

      <div style={{ padding: "52px 20px 0", position: "relative", zIndex: 2, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onComplete} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", fontFamily: "'Outfit',sans-serif", padding: "6px 0" }}>Пропустить</button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 32px 0", position: "relative", zIndex: 2 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#F5F5F5", textAlign: "center", marginBottom: 14, fontFamily: "'Outfit',sans-serif", lineHeight: 1.25, animation: "fadeSlideIn 0.4s ease both" }} key={step}>{slide.title}</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 1.6, marginBottom: 48, animation: "fadeSlideIn 0.4s ease 0.08s both" }} key={step+"t"}>{slide.text}</p>
      </div>

      <div style={{ padding: "0 32px 56px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {slides.map((_, i) => <div key={i} style={{ width: i===step?20:6, height: 6, borderRadius: 3, background: i===step?slide.accent:"rgba(255,255,255,0.12)", transition: "all 0.3s" }} />)}
        </div>
        <button onClick={() => isLast ? onComplete() : setStep(step+1)} style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: slide.accent, color: "#0A0A0F", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "background 0.3s" }}>{isLast ? "Начать" : "Дальше"}</button>
      </div>
    </div>
  );
};

export default Onboarding;
