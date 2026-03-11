export async function sharePractice(practice, showToastCallback) {
  const shareUrl = `https://t.me/breathwork_with_stas_bot/breathwork?startapp=practice_${practice.id}`;

  // Всё в одном text — гарантирует что ссылка будет на любой платформе
  const shareText = `${practice.title} · ${practice.duration}\n${practice.science}\n\n${shareUrl}`;

  // Priority 1: Web Share API — only text (no separate url to avoid platform inconsistencies)
  if (navigator.share) {
    try {
      await navigator.share({
        text: shareText,
      });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }

  // Priority 2: Telegram share
  const tg = window.Telegram?.WebApp;
  if (tg) {
    try {
      tg.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`${practice.title} · ${practice.duration}\n${practice.science}`)}`
      );
      return;
    } catch (e) {
      // fallthrough
    }
  }

  // Priority 3: Clipboard fallback
  try {
    await navigator.clipboard.writeText(shareUrl);
    showToastCallback?.('Ссылка скопирована');
  } catch (e) {
    // ignore
  }
}
