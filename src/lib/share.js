export async function sharePractice(practice, showToastCallback) {
  const shareUrl = `https://t.me/breathwork_with_stas_bot/breathwork?startapp=practice_${practice.id}`;
  const shareTitle = `${practice.title} — Breathwork with Stas`;
  const shareText = `${practice.title} · ${practice.duration}\n${practice.science}`;

  // Priority 1: Web Share API — native share sheet (iOS/Android)
  if (navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return; // user cancelled
    }
  }

  // Priority 2: Telegram share (if Web Share API unavailable)
  const tg = window.Telegram?.WebApp;
  if (tg) {
    try {
      tg.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
      );
      return;
    } catch (e) {
      // fallback below
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
