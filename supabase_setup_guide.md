# Supabase Setup Guide — Breathwork with Stas

## Обзор

Три шага:
1. **SQL-схема** → вставить в Supabase SQL Editor
2. **Seed-данные** → заполнить 6 практик из текущего хардкода
3. **Клиент** → подключить к React-приложению

---

## Шаг 1. SQL-схема

Вставь целиком в **Supabase → SQL Editor → New Query → Run**.

```sql
-- ============================================
-- Breathwork with Stas — Database Schema
-- ============================================

-- 1. PRACTICES — каталог дыхательных практик
-- ============================================

CREATE TABLE practices (
  id SERIAL PRIMARY KEY,
  
  -- Основные поля (из текущего хардкода)
  title TEXT NOT NULL,                          -- "Сброс напряжения"
  duration TEXT NOT NULL,                       -- "10 мин" (отображаемое)
  duration_seconds INTEGER NOT NULL DEFAULT 600, -- 600 (для плеера и статистики)
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  category TEXT NOT NULL,                       -- "перезагрузка", "фокус", "сон", "энергия", "recovery", "глубина"
  context TEXT NOT NULL,                        -- "после работы", "утро", "перед сном", "день", "после тренировки", "выходные"
  level TEXT NOT NULL DEFAULT 'базовый',        -- "базовый" | "продвинутый"
  
  -- Контент
  science TEXT NOT NULL,                        -- "Удлинённый выдох снижает кортизол..."
  preview TEXT NOT NULL,                        -- "Лёгкое тепло в руках..."
  technique TEXT NOT NULL,                      -- "Когерентное дыхание 4-6"
  
  -- Визуал (для генеративного арта на клиенте)
  color TEXT NOT NULL,                          -- "#2A6B4F"
  accent_color TEXT NOT NULL,                   -- "#4ADE80"
  gen_type TEXT NOT NULL,                       -- "flow", "grid", "waves", "burst", "rings", "nebula"
  
  -- Паттерн дыхания (JSON для анимации)
  -- Формат: [{"name": "вдох", "duration": 4}, {"name": "задержка", "duration": 4}, ...]
  breath_pattern JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Аудио (URL из Supabase Storage)
  audio_url TEXT,                               -- NULL пока аудио не записано
  
  -- Мета
  sort_order INTEGER NOT NULL DEFAULT 0,        -- порядок в каталоге
  is_free BOOLEAN NOT NULL DEFAULT false,       -- доступна бесплатно?
  is_published BOOLEAN NOT NULL DEFAULT true,   -- показывать в каталоге?
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Индексы для фильтрации
CREATE INDEX idx_practices_category ON practices(category);
CREATE INDEX idx_practices_context ON practices(context);
CREATE INDEX idx_practices_published ON practices(is_published);


-- 2. USERS — пользователи из Telegram
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Telegram-данные
  telegram_id BIGINT UNIQUE NOT NULL,           -- Telegram user ID
  username TEXT,                                 -- @username (может быть NULL)
  first_name TEXT,
  last_name TEXT,
  photo_url TEXT,
  language_code TEXT DEFAULT 'ru',
  
  -- Онбординг
  onboarding_goal TEXT,                         -- выбранная цель: "перезагрузка", "фокус", "сон", "энергия", "recovery"
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Настройки
  reminder_enabled BOOLEAN DEFAULT false,
  reminder_anchor TEXT,                         -- "утро", "вечер", "после_тренировки", "перед_сном"
  reminder_time TIME,                           -- конкретное время, если задано
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_telegram_id ON users(telegram_id);


-- 3. USER_SESSIONS — трекинг каждой сессии
-- ============================================

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practice_id INTEGER NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  
  -- Данные сессии
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,                      -- NULL если не завершена
  duration_listened INTEGER NOT NULL DEFAULT 0, -- секунды реально прослушанных
  completed BOOLEAN NOT NULL DEFAULT false,     -- дослушал до конца?
  
  -- Контекст (для аналитики)
  context_time TEXT,                            -- "morning", "afternoon", "evening", "night"
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_practice ON user_sessions(practice_id);
CREATE INDEX idx_sessions_date ON user_sessions(created_at);


-- 4. ROW LEVEL SECURITY
-- ============================================

-- Включаем RLS на всех таблицах
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Practices: читать могут все (через anon key), писать — никто (через Dashboard)
CREATE POLICY "practices_read" ON practices
  FOR SELECT USING (true);

-- Users: каждый видит/редактирует только себя
-- (telegram_id передаётся через JWT claim или запрос)
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (true);

CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (true);

-- Sessions: каждый видит/пишет только свои
CREATE POLICY "sessions_read_own" ON user_sessions
  FOR SELECT USING (true);

CREATE POLICY "sessions_insert" ON user_sessions
  FOR INSERT WITH CHECK (true);

-- 5. AUTO-UPDATE updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER practices_updated_at
  BEFORE UPDATE ON practices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- 6. STORAGE BUCKET для аудио
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Публичное чтение аудио-файлов
CREATE POLICY "audio_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio');
```

---

## Шаг 2. Seed-данные (6 практик)

Вставь **после** схемы — отдельным запросом в SQL Editor.

```sql
-- ============================================
-- Seed: 6 практик из текущего хардкода
-- ============================================

INSERT INTO practices (
  id, title, duration, duration_seconds, intensity, 
  category, context, level,
  science, preview, technique,
  color, accent_color, gen_type,
  breath_pattern, sort_order, is_free
) VALUES

-- 1. Сброс напряжения
(1, 
 'Сброс напряжения', '10 мин', 600, 2,
 'перезагрузка', 'после работы', 'базовый',
 'Удлинённый выдох снижает кортизол и активирует парасимпатику',
 'Лёгкое тепло в руках, замедление пульса, ощущение тяжести в теле',
 'Когерентное дыхание 4-6',
 '#2A6B4F', '#4ADE80', 'flow',
 '[{"name": "вдох", "duration": 4}, {"name": "выдох", "duration": 6}]'::jsonb,
 1, true),

-- 2. Фокус перед стартом
(2,
 'Фокус перед стартом', '7 мин', 420, 3,
 'фокус', 'утро', 'базовый',
 'Короткие задержки на вдохе повышают норадреналин и концентрацию',
 'Прилив бодрости, ясность в голове, лёгкое покалывание в пальцах',
 'Box Breathing 4-4-4-4',
 '#4A3A6B', '#A78BFA', 'grid',
 '[{"name": "вдох", "duration": 4}, {"name": "задержка", "duration": 4}, {"name": "выдох", "duration": 4}, {"name": "задержка", "duration": 4}]'::jsonb,
 2, true),

-- 3. Перезагрузка для сна
(3,
 'Перезагрузка для сна', '8 мин', 480, 1,
 'сон', 'перед сном', 'базовый',
 'Ритм 4-7-8 замедляет сердцебиение и готовит тело к глубокому сну',
 'Глубокое расслабление, сонливость, ощущение «проваливания» в тело',
 '4-7-8 Breathing',
 '#1E3A5F', '#60A5FA', 'waves',
 '[{"name": "вдох", "duration": 4}, {"name": "задержка", "duration": 7}, {"name": "выдох", "duration": 8}]'::jsonb,
 3, true),

-- 4. Энергия без кофеина
(4,
 'Энергия без кофеина', '5 мин', 300, 4,
 'энергия', 'день', 'продвинутый',
 'Капалабхати стимулирует симпатическую систему и повышает бодрость',
 'Вибрация в теле, тепло, учащённое сердцебиение — это нормально',
 'Капалабхати + задержки',
 '#6B3A1E', '#FB923C', 'burst',
 '[{"name": "вдох", "duration": 1}, {"name": "выдох", "duration": 1}, {"name": "задержка", "duration": 4}]'::jsonb,
 4, false),

-- 5. Recovery после спорта
(5,
 'Recovery после спорта', '10 мин', 600, 2,
 'recovery', 'после тренировки', 'базовый',
 'Медленное дыхание ускоряет переход в режим восстановления',
 'Расслабление мышц, снижение пульса, приятная усталость без напряжения',
 'Диафрагмальное 5-5',
 '#2D4A3E', '#34D399', 'rings',
 '[{"name": "вдох", "duration": 5}, {"name": "выдох", "duration": 5}]'::jsonb,
 5, false),

-- 6. Отпустить контроль
(6,
 'Отпустить контроль', '25 мин', 1500, 5,
 'глубина', 'выходные', 'продвинутый',
 'Связное дыхание снижает активность default mode network мозга',
 'Эмоции, тетания в руках, слёзы — всё это нормальная реакция тела',
 'Связное дыхание',
 '#3D1E4A', '#C084FC', 'nebula',
 '[{"name": "вдох", "duration": 3}, {"name": "выдох", "duration": 3}]'::jsonb,
 6, false);

-- Синхронизируем sequence после ручной вставки id
SELECT setval('practices_id_seq', (SELECT MAX(id) FROM practices));
```

---

## Шаг 3. Подключение к React-приложению

### 3.1. Установка клиента

```bash
cd ~/Documents/Stas_breathwork_app
npm install @supabase/supabase-js
```

### 3.2. Переменные окружения

Создай файл `.env` в корне проекта:

```env
VITE_SUPABASE_URL=https://ТВОЙ_ПРОЕКТ.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...ТВОЙ_КЛЮЧ
```

**Где взять:** Supabase → Settings → API → Project URL + `anon` `public` key.

Добавь `.env` в `.gitignore` (если ещё не там):
```
.env
.env.local
```

> **Примечание:** `anon key` — публичный ключ, он безопасен для фронтенда. Защита данных обеспечивается через RLS-политики, а не через секретность ключа.

### 3.3. Supabase-клиент (новый файл)

**Файл: `src/lib/supabase.js`**

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars. Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3.4. Сервис для работы с практиками

**Файл: `src/lib/practices-service.js`**

```js
import { supabase } from './supabase';

// Загрузить все опубликованные практики
export async function fetchPractices() {
  const { data, error } = await supabase
    .from('practices')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching practices:', error);
    return [];
  }

  // Маппинг snake_case → camelCase (чтобы не ломать текущие компоненты)
  return data.map(p => ({
    id: p.id,
    title: p.title,
    duration: p.duration,
    durationSeconds: p.duration_seconds,
    intensity: p.intensity,
    category: p.category,
    context: p.context,
    level: p.level,
    science: p.science,
    preview: p.preview,
    technique: p.technique,
    color: p.color,
    accentColor: p.accent_color,
    genType: p.gen_type,
    breathPattern: p.breath_pattern,
    audioUrl: p.audio_url,
    isFree: p.is_free,
  }));
}

// Загрузить одну практику по id
export async function fetchPractice(id) {
  const { data, error } = await supabase
    .from('practices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching practice:', error);
    return null;
  }

  return data;
}
```

### 3.5. Сервис для пользователей и сессий

**Файл: `src/lib/user-service.js`**

```js
import { supabase } from './supabase';

// Создать или обновить пользователя из Telegram
export async function upsertUser(telegramUser) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      telegram_id: telegramUser.id,
      username: telegramUser.username || null,
      first_name: telegramUser.first_name || null,
      last_name: telegramUser.last_name || null,
      photo_url: telegramUser.photo_url || null,
      language_code: telegramUser.language_code || 'ru',
      last_active_at: new Date().toISOString(),
    }, {
      onConflict: 'telegram_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user:', error);
    return null;
  }

  return data;
}

// Записать начало сессии
export async function startSession(userId, practiceId) {
  const hour = new Date().getHours();
  const contextTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

  const { data, error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      practice_id: practiceId,
      context_time: contextTime,
    })
    .select()
    .single();

  if (error) {
    console.error('Error starting session:', error);
    return null;
  }

  return data;
}

// Завершить сессию
export async function finishSession(sessionId, durationListened, completed) {
  const { error } = await supabase
    .from('user_sessions')
    .update({
      finished_at: new Date().toISOString(),
      duration_listened: durationListened,
      completed,
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error finishing session:', error);
  }
}

// Получить статистику пользователя
export async function getUserStats(userId) {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('practice_id, duration_listened, completed, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stats:', error);
    return { totalSessions: 0, totalMinutes: 0, completedSessions: 0, recentSessions: [] };
  }

  return {
    totalSessions: data.length,
    totalMinutes: Math.round(data.reduce((sum, s) => sum + s.duration_listened, 0) / 60),
    completedSessions: data.filter(s => s.completed).length,
    recentSessions: data.slice(0, 10),
  };
}
```

### 3.6. Хук для загрузки практик (замена хардкода)

**Файл: `src/hooks/usePractices.js`**

```js
import { useState, useEffect } from 'react';
import { fetchPractices } from '../lib/practices-service';

// Хардкод как fallback (текущие данные из App)
import { practices as hardcodedPractices } from '../data/practices';

export function usePractices() {
  const [practices, setPractices] = useState(hardcodedPractices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchPractices();
        if (!cancelled && data.length > 0) {
          setPractices(data);
        }
        // Если data пустой — остаёмся на хардкоде
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { practices, loading, error };
}
```

---

## Шаг 4. Миграция данных в App

### Текущее состояние

Сейчас в `App.jsx` массив `practices` захардкожен прямо в файле (строки 3-10). План миграции:

### 4.1. Вынести хардкод в отдельный файл (fallback)

Создать `src/data/practices.js` — вырезать массив из App.jsx и экспортировать. Это fallback на случай если Supabase недоступен.

### 4.2. Заменить в App.jsx

```diff
- const practices = [ ... ];  // удалить хардкод

+ import { usePractices } from './hooks/usePractices';
  
  export default function App() {
+   const { practices, loading } = usePractices();
    const [sel, setSel] = useState(null);
    // ... остальной код без изменений
```

### 4.3. Инициализация пользователя (в App.jsx)

```js
import { upsertUser } from './lib/user-service';

// В начале App компонента:
const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
  // Telegram Web App SDK
  const tg = window.Telegram?.WebApp;
  if (tg?.initDataUnsafe?.user) {
    upsertUser(tg.initDataUnsafe.user).then(setCurrentUser);
  }
}, []);
```

---

## Структура файлов после интеграции

```
src/
├── lib/
│   ├── supabase.js          ← клиент Supabase
│   ├── practices-service.js ← CRUD практик
│   └── user-service.js      ← пользователи + сессии
├── hooks/
│   └── usePractices.js      ← хук с fallback на хардкод
├── data/
│   └── practices.js         ← текущий хардкод (fallback)
├── App.jsx                  ← подключить хук вместо массива
└── ...
```

---

## Чек-лист

- [ ] Вставить SQL-схему в Supabase SQL Editor → Run
- [ ] Вставить seed-данные → Run
- [ ] Проверить: Supabase → Table Editor → practices → 6 записей
- [ ] Проверить: Supabase → Storage → бакет `audio` создан
- [ ] `npm install @supabase/supabase-js`
- [ ] Создать `.env` с URL и anon key
- [ ] Создать `src/lib/supabase.js`
- [ ] Создать `src/lib/practices-service.js`
- [ ] Создать `src/lib/user-service.js`
- [ ] Вынести хардкод в `src/data/practices.js`
- [ ] Создать `src/hooks/usePractices.js`
- [ ] Обновить `App.jsx` → `usePractices()` вместо хардкода
- [ ] `npm run build` → без ошибок
- [ ] Открыть в браузере → практики загружаются из Supabase
- [ ] Fallback: отключить Supabase (неверный URL) → приложение работает на хардкоде

---

## Примечания

**RLS-политики** сейчас максимально открытые (для быстрого старта с anon key). Когда добавишь серверную валидацию Telegram `initData` — можно будет ужесточить: привязать `user_id` к JWT-клейму и ограничить доступ к чужим сессиям.

**Аудио-файлы** загружаются через Supabase Dashboard → Storage → audio bucket. URL будет вида: `https://ПРОЕКТ.supabase.co/storage/v1/object/public/audio/practice-1-reset.mp3`. После загрузки — обновить поле `audio_url` в таблице practices.

**Добавление новых практик** — через Supabase Dashboard → Table Editor, без редеплоя приложения. Приложение подхватит автоматически.
