// Telegram WebApp integration
// Docs: https://core.telegram.org/bots/webapps

const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : null;

export function initTelegram() {
  if (!tg) return false;
  tg.ready();
  tg.expand();
  tg.setHeaderColor("#0A0A0F");
  tg.setBackgroundColor("#0A0A0F");
  return true;
}

export function isTelegram() {
  return !!tg?.initData;
}

export function getTelegramUser() {
  return tg?.initDataUnsafe?.user || null;
}

export function haptic(type = "impact") {
  if (!tg?.HapticFeedback) return;
  switch (type) {
    case "impact":
      tg.HapticFeedback.impactOccurred("medium");
      break;
    case "light":
      tg.HapticFeedback.impactOccurred("light");
      break;
    case "success":
      tg.HapticFeedback.notificationOccurred("success");
      break;
    case "select":
      tg.HapticFeedback.selectionChanged();
      break;
  }
}

export function sharePractice(practice) {
  const text = `🫁 ${practice.title} · ${practice.duration}\n\n${practice.description}\n\nПопробуй: `;
  const url = `https://t.me/breathwork_stas_bot/app?startapp=p${practice.id}`;

  if (tg) {
    tg.switchInlineQuery(text, ["users", "groups", "channels"]);
  } else {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(tgUrl, "_blank");
  }
}

export function closeApp() {
  if (tg) tg.close();
}
