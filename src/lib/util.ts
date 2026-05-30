/** Local calendar day as YYYY-MM-DD (not UTC). */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Last N calendar day keys ending today, oldest first. */
export function lastNDays(n: number, now: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(todayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)));
  }
  return out;
}
