# Breathwork with Stas — Mini App

## Деплой

```bash
npm run build
npx wrangler pages deploy dist/ --project-name=breathwork-stas
```

URL после деплоя: https://breathwork-stas.pages.dev/

## Стек

- React 19 + Vite
- Inline styles (без CSS-фреймворков)
- Cloudflare Pages (хостинг)
- Telegram Web App SDK (подключён в index.html)

## Структура

```
src/
├── App.jsx              — главный экран (каталог, рекомендация, роутинг)
├── main.jsx             — точка входа
├── styles.css           — глобальные стили + keyframes
├── components/
│   ├── Card.jsx         — карточка практики с кнопкой ▶
│   ├── Detail.jsx       — детальный просмотр (bottom sheet)
│   ├── Dots.jsx         — индикатор интенсивности
│   ├── GenArt.jsx       — статичный генеративный арт (canvas)
│   ├── OnboardingBg.jsx — анимированный breathing-фон (rAF canvas)
│   ├── Onboarding.jsx   — 2-экранный онбординг
│   └── Player.jsx       — плеер с синхронизированным счётом
├── data/
│   └── practices.js     — данные практик, паттерны, labels
└── utils/
    └── helpers.js       — hex2rgb и утилиты
```

## Правила

- Маленькие диффы: максимум 3 файла за раз
- `npm run build` после каждой правки — убедись что билд чистый
- Не менять стили/конфиги без явного запроса
- Шрифты: Outfit (UI) + JetBrains Mono (моно)
- Цветовая тема: тёмная (#0A0A0F база), акценты у каждой практики свои
