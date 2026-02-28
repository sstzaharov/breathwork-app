export const practices = [
  {
    id: 1,
    title: "Сброс напряжения",
    duration: "10 мин",
    durationSec: 600,
    intensity: 2,
    category: "reset",
    context: "after_work",
    science: "Удлинённый выдох снижает кортизол и активирует парасимпатику",
    preview: "Лёгкое тепло в руках, замедление пульса, ощущение тяжести в теле",
    technique: "Когерентное дыхание 4-6",
    description: "Мягкая когерентная техника для деактивации стресса. Снижает кортизол за одну сессию.",
    color: "#2A6B4F",
    accentColor: "#4ADE80",
    level: "базовый",
    genType: "flow",
    // Breathing pattern: inhale 4s, exhale 6s
    pattern: { inhale: 4, exhale: 6 },
    audioUrl: null, // Will be added when audio is recorded
  },
  {
    id: 2,
    title: "Фокус перед стартом",
    duration: "7 мин",
    durationSec: 420,
    intensity: 3,
    category: "focus",
    context: "morning",
    science: "Короткие задержки на вдохе повышают норадреналин и концентрацию",
    preview: "Прилив бодрости, ясность в голове, лёгкое покалывание в пальцах",
    technique: "Box Breathing 4-4-4-4",
    description: "Техника военных и спецслужб для максимальной фокусировки. Используется Navy SEALs.",
    color: "#4A3A6B",
    accentColor: "#A78BFA",
    level: "базовый",
    genType: "grid",
    pattern: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
    audioUrl: null,
  },
  {
    id: 3,
    title: "Перезагрузка для сна",
    duration: "8 мин",
    durationSec: 480,
    intensity: 1,
    category: "sleep",
    context: "before_sleep",
    science: "Ритм 4-7-8 замедляет сердцебиение и готовит тело к глубокому сну",
    preview: "Глубокое расслабление, сонливость, ощущение «проваливания» в тело",
    technique: "4-7-8 Breathing",
    description: "Одна из самых эффективных техник для засыпания. Работает с первого раза.",
    color: "#1E3A5F",
    accentColor: "#60A5FA",
    level: "базовый",
    genType: "waves",
    pattern: { inhale: 4, holdIn: 7, exhale: 8 },
    audioUrl: null,
  },
  {
    id: 4,
    title: "Энергия без кофеина",
    duration: "5 мин",
    durationSec: 300,
    intensity: 4,
    category: "energy",
    context: "day",
    science: "Капалабхати стимулирует симпатическую систему и повышает бодрость",
    preview: "Вибрация в теле, тепло, учащённое сердцебиение — это нормально",
    technique: "Капалабхати + задержки",
    description: "Активная техника для мгновенного подъёма энергии. Заменяет кофе.",
    color: "#6B3A1E",
    accentColor: "#FB923C",
    level: "продвинутый",
    genType: "burst",
    pattern: { inhale: 1, exhale: 1, rounds: 30, holdIn: 15 },
    audioUrl: null,
  },
  {
    id: 5,
    title: "Recovery после спорта",
    duration: "10 мин",
    durationSec: 600,
    intensity: 2,
    category: "recovery",
    context: "after_training",
    science: "Медленное дыхание ускоряет переход в режим восстановления",
    preview: "Расслабление мышц, снижение пульса, приятная усталость без напряжения",
    technique: "Диафрагмальное 5-5",
    description: "Восстановление нервной системы после физической нагрузки.",
    color: "#2D4A3E",
    accentColor: "#34D399",
    level: "базовый",
    genType: "rings",
    pattern: { inhale: 5, exhale: 5 },
    audioUrl: null,
  },
  {
    id: 6,
    title: "Отпустить контроль",
    duration: "25 мин",
    durationSec: 1500,
    intensity: 5,
    category: "depth",
    context: "weekend",
    science: "Связное дыхание снижает активность default mode network мозга",
    preview: "Эмоции, тетания в руках, слёзы — всё это нормальная реакция тела",
    technique: "Связное дыхание",
    description: "Глубокая иммерсивная практика для внутренней работы и контакта с собой.",
    color: "#3D1E4A",
    accentColor: "#C084FC",
    level: "продвинутый",
    genType: "nebula",
    pattern: { inhale: 3, exhale: 3, connected: true },
    audioUrl: null,
  },
];

export const categories = {
  all: "Все",
  reset: "Перезагрузка",
  focus: "Фокус",
  sleep: "Сон",
  energy: "Энергия",
  recovery: "Recovery",
  depth: "Глубина",
};

export const contexts = {
  after_work: "После работы",
  morning: "Утро",
  before_sleep: "Перед сном",
  day: "Днём",
  after_training: "После тренировки",
  weekend: "Выходные",
};

export function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

export function getGreeting(tod) {
  const greetings = {
    morning: "Доброе утро",
    afternoon: "Добрый день",
    evening: "Добрый вечер",
    night: "Спокойной ночи",
  };
  return greetings[tod];
}

export function getRecommendedPractice(tod) {
  const contextMap = {
    morning: "morning",
    afternoon: "day",
    evening: "after_work",
    night: "before_sleep",
  };
  return practices.find((p) => p.context === contextMap[tod]) || practices[0];
}
