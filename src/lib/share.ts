/* WhatsApp share — opens WA with a pre-filled text. */

export function shareOnWhatsApp(text: string): void {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
