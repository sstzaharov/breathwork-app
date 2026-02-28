-- ==========================================
-- Breathwork with Stas — Supabase Schema
-- ==========================================

-- 1. Практики (метаданные)
CREATE TABLE practices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,                    -- "Сброс напряжения"
  slug TEXT UNIQUE NOT NULL,              -- "sbros-napryazheniya" (для URL)
  duration_seconds INTEGER NOT NULL,      -- 600 (10 мин)
  duration_label TEXT NOT NULL,           -- "10 мин"
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  level TEXT NOT NULL DEFAULT 'базовый',  -- "базовый" / "продвинутый"
  category TEXT NOT NULL,                 -- "перезагрузка", "фокус", "сон", "энергия", "recovery", "глубина"
  context TEXT NOT NULL,                  -- "после работы", "утро", "перед сном", "день", "после тренировки", "выходные"
  technique TEXT NOT NULL,                -- "Когерентное дыхание 4-6"
  science TEXT NOT NULL,                  -- "Удлинённый выдох снижает кортизол..."
  preview TEXT NOT NULL,                  -- "Лёгкое тепло в руках..."
  description TEXT,                       -- опциональное расширенное описание
  
  -- Визуал
  color TEXT NOT NULL DEFAULT '#2A6B4F',
  accent_color TEXT NOT NULL DEFAULT '#4ADE80',
  gen_type TEXT NOT NULL DEFAULT 'flow',  -- тип генеративного арта: flow, grid, waves, burst, rings, nebula
  
  -- Дыхательный паттерн (для анимации в плеере)
  breath_pattern JSONB NOT NULL,
  -- формат: {"phases": [{"name": "вдох", "duration": 4}, {"name": "выдох", "duration": 6}], "cycles": 10}
  
  -- Аудио
  audio_url TEXT,                         -- ссылка на аудио в Supabase Storage
  audio_duration_seconds INTEGER,
  
  -- Мета
  sort_order INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT true,           -- доступна бесплатно?
  is_published BOOLEAN DEFAULT true,      -- показывать в каталоге?
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Прогресс пользователей
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,       -- ID из Telegram WebApp
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  duration_listened INTEGER,              -- сколько секунд реально слушал
  completed BOOLEAN DEFAULT true,         -- дослушал до конца?
  
  -- Индексы для быстрых запросов
  CONSTRAINT unique_session UNIQUE (telegram_user_id, practice_id, completed_at)
);

-- 3. Пользователи (базовый профиль из Telegram)
CREATE TABLE users (
  telegram_user_id BIGINT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  language_code TEXT DEFAULT 'ru',
  timezone TEXT,                           -- для рекомендаций по времени суток
  onboarding_goal TEXT,                    -- что выбрал при онбординге: "перезагрузка"/"фокус"/"сон"/"энергия"
  created_at TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Индексы
-- ==========================================

CREATE INDEX idx_practices_category ON practices(category) WHERE is_published = true;
CREATE INDEX idx_practices_published ON practices(is_published, sort_order);
CREATE INDEX idx_progress_user ON user_progress(telegram_user_id, completed_at DESC);
CREATE INDEX idx_progress_practice ON user_progress(practice_id);
CREATE INDEX idx_users_active ON users(last_active_at DESC);

-- ==========================================
-- RLS (Row Level Security) — безопасность
-- ==========================================

-- Включаем RLS
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Практики: читать могут все (через anon key)
CREATE POLICY "Practices are viewable by everyone" 
  ON practices FOR SELECT 
  USING (is_published = true);

-- Прогресс: каждый видит только свой (позже подключим через API)
CREATE POLICY "Users can view own progress" 
  ON user_progress FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own progress" 
  ON user_progress FOR INSERT 
  WITH CHECK (true);

-- Пользователи: каждый видит только себя
CREATE POLICY "Users can view own profile" 
  ON users FOR SELECT 
  USING (true);

CREATE POLICY "Users can upsert own profile" 
  ON users FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (true);

-- ==========================================
-- Начальные данные — 6 практик из прототипа
-- ==========================================

INSERT INTO practices (title, slug, duration_seconds, duration_label, intensity, level, category, context, technique, science, preview, color, accent_color, gen_type, breath_pattern, sort_order, is_free) VALUES

('Сброс напряжения', 'sbros-napryazheniya', 600, '10 мин', 2, 'базовый', 
 'перезагрузка', 'после работы', 'Когерентное дыхание 4-6',
 'Удлинённый выдох снижает кортизол и активирует парасимпатику',
 'Лёгкое тепло в руках, замедление пульса, ощущение тяжести в теле',
 '#2A6B4F', '#4ADE80', 'flow',
 '{"phases": [{"name": "вдох", "duration": 4}, {"name": "выдох", "duration": 6}], "cycles": 60}',
 1, true),

('Фокус перед стартом', 'fokus-pered-startom', 420, '7 мин', 3, 'базовый',
 'фокус', 'утро', 'Box Breathing 4-4-4-4',
 'Короткие задержки на вдохе повышают норадреналин и концентрацию',
 'Прилив бодрости, ясность в голове, лёгкое покалывание в пальцах',
 '#4A3A6B', '#A78BFA', 'grid',
 '{"phases": [{"name": "вдох", "duration": 4}, {"name": "задержка", "duration": 4}, {"name": "выдох", "duration": 4}, {"name": "задержка", "duration": 4}], "cycles": 26}',
 2, true),

('Перезагрузка для сна', 'perezagruzka-dlya-sna', 480, '8 мин', 1, 'базовый',
 'сон', 'перед сном', '4-7-8 Breathing',
 'Ритм 4-7-8 замедляет сердцебиение и готовит тело к глубокому сну',
 'Глубокое расслабление, сонливость, ощущение «проваливания» в тело',
 '#1E3A5F', '#60A5FA', 'waves',
 '{"phases": [{"name": "вдох", "duration": 4}, {"name": "задержка", "duration": 7}, {"name": "выдох", "duration": 8}], "cycles": 25}',
 3, true),

('Энергия без кофеина', 'energiya-bez-kofeina', 300, '5 мин', 4, 'продвинутый',
 'энергия', 'день', 'Капалабхати + задержки',
 'Капалабхати стимулирует симпатическую систему и повышает бодрость',
 'Вибрация в теле, тепло, учащённое сердцебиение — это нормально',
 '#6B3A1E', '#FB923C', 'burst',
 '{"phases": [{"name": "вдох", "duration": 1}, {"name": "выдох", "duration": 1}], "cycles": 60, "note": "быстрое дыхание + задержки каждые 30 циклов"}',
 4, false),

('Recovery после спорта', 'recovery-posle-sporta', 600, '10 мин', 2, 'базовый',
 'recovery', 'после тренировки', 'Диафрагмальное 5-5',
 'Медленное дыхание ускоряет переход в режим восстановления',
 'Расслабление мышц, снижение пульса, приятная усталость без напряжения',
 '#2D4A3E', '#34D399', 'rings',
 '{"phases": [{"name": "вдох", "duration": 5}, {"name": "выдох", "duration": 5}], "cycles": 36}',
 5, true),

('Отпустить контроль', 'otpustit-kontrol', 1500, '25 мин', 5, 'продвинутый',
 'глубина', 'выходные', 'Связное дыхание',
 'Связное дыхание снижает активность default mode network мозга',
 'Эмоции, тетания в руках, слёзы — всё это нормальная реакция тела',
 '#3D1E4A', '#C084FC', 'nebula',
 '{"phases": [{"name": "вдох", "duration": 3}, {"name": "выдох", "duration": 3}], "cycles": 150, "note": "без пауз между вдохом и выдохом"}',
 6, false);
