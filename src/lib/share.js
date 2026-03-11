export async function sharePractice(practice, showToastCallback) {
  const shareUrl = `https://t.me/breathwork_with_stas_bot/breathwork?startapp=practice_${practice.id}`;
  const shareText = `${practice.title} — дыхательная практика, ${practice.duration}`;

  const tg = window.Telegram?.WebApp;

  if (tg) {
    // Telegram native share picker
    tg.openTelegramLink(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    );
  } else if (navigator.share) {
    // Web Share API (iOS/Android native sheet)
    try {
      await navigator.share({ title: practice.title, text: shareText, url: shareUrl });
    } catch (e) {
      // user cancelled share — do nothing
    }
  } else {
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToastCallback?.('Ссылка скопирована');
    } catch (e) {
      // ignore
    }
  }
}
