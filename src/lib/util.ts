/* Small shared utilities used by both store backends. */

/** Local calendar day as YYYY-MM-DD (not UTC). */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** A stored time ("HH:MM" 24h, or legacy "7:00 AM") → "7:00 AM" for display. */
export function formatClock(value: string): string {
  if (!value) return '';
  if (/[ap]m/i.test(value)) return value.toUpperCase().replace(/\s+/g, ' ').trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return value;
  let h = Number(m[1]);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m[2]} ${ampm}`;
}

/** Any stored time → "HH:MM" 24h for a native <input type="time">. */
export function toInputTime(value: string): string {
  if (!value) return '';
  const m = /^(\d{1,2}):(\d{2})\s*([ap]m)?$/i.exec(value.trim());
  if (!m) return '';
  let h = Number(m[1]);
  const ap = m[3]?.toLowerCase();
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}
