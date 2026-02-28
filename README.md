# Breathwork with Stas

Breathwork мини-апп для IT-перформеров. Тёмный минимализм, генеративный арт, визуальный гайд дыхания.

## Стек

- **React 18** + **Vite 6**
- **Telegram Mini App SDK** (опционально — работает и как обычный веб-апп)
- **Cloudflare Pages** (деплой)
- Canvas API для генеративного арта
- Нет внешних UI-библиотек — всё кастомное

## Структура

```
src/
├── App.jsx                    # Главный экран (каталог + рекомендация)
├── main.jsx                   # Entry point
├── styles.css                 # Глобальные стили и анимации
├── components/
│   ├── GenArt.jsx             # Генеративный арт (canvas)
│   ├── IntensityDots.jsx      # Индикатор интенсивности
│   ├── PracticeCard.jsx       # Карточка практики
│   ├── PracticeDetail.jsx     # Детальный экран (bottom sheet)
│   └── BreathPlayer.jsx       # Полноэкранный плеер с визуальным гайдом
├── data/
│   └── practices.js           # Контент: практики, категории, утилиты
└── utils/
    └── telegram.js            # Telegram WebApp API + шеринг
```

## Локальная разработка

```bash
npm install
npm run dev
```

Откроется на `http://localhost:3000`

## Деплой на Cloudflare Pages

### Вариант 1: через CLI (рекомендуется)

```bash
npm install -g wrangler
wrangler login
npm run build
wrangler pages deploy dist --project-name=breathwork-with-stas
```

### Вариант 2: через Claude Code

```bash
# В Claude Code просто:
npm run deploy
```

### Вариант 3: через GitHub

1. Пуш в GitHub
2. В Cloudflare Dashboard → Pages → Create project → Connect to Git
3. Build command: `npm run build`
4. Output directory: `dist`

## Подключение к Telegram Bot

1. Создай бота через @BotFather
2. `/newapp` → выбери бота → укажи URL с Cloudflare Pages
3. Или `/setmenubutton` для кнопки в боте

## Добавление аудио

Когда аудио будет записано:
1. Положи файлы в `public/audio/` (например `practice-1.mp3`)
2. Обнови `audioUrl` в `src/data/practices.js`
3. В `BreathPlayer.jsx` раскомментируй аудио-интеграцию

## Что готово

- [x] Каталог практик с фильтрами
- [x] Рекомендация по времени суток
- [x] Карточки с генеративным артом
- [x] Детальный экран (bottom sheet)
- [x] Визуальный гайд дыхания (таймер + фазы)
- [x] Шеринг в Telegram
- [x] Haptic feedback
- [x] Адаптация под Telegram Mini App

## Что добавить позже

- [ ] Реальное аудио с голосом Стаса
- [ ] Трекинг завершённых сессий
- [ ] Привязка к якорям рутины
- [ ] Профиль с историей
- [ ] Оплата (Telegram Stars или Stripe)
