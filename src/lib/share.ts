/* ============================================================
   Share helpers. No backend, no WhatsApp bot — just the phone's
   native share / WhatsApp deep link, so a tap opens WhatsApp
   with the message pre-filled and the user picks the group.

   // TODO v2: a real WhatsApp Business API send would need a
   // backend + paid number; intentionally out of scope.
   ============================================================ */

/** Open WhatsApp's share sheet with pre-filled text (user picks the chat). */
export function shareOnWhatsApp(text: string): void {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/** True when the device exposes the native share sheet. */
export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/** Native share when available (falls back to WhatsApp deep link). */
export async function shareText(text: string): Promise<void> {
  if (canNativeShare()) {
    try {
      await navigator.share({ text });
      return;
    } catch (err) {
      // User cancelled — don't fall through to a second prompt.
      if (err instanceof Error && err.name === 'AbortError') return;
    }
  }
  shareOnWhatsApp(text);
}
