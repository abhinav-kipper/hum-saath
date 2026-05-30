/* WhatsApp share for the weekly report. */

import { metrics } from '../data/content';
import type { Profile } from '../types';

export function shareOnWhatsApp(text: string): void {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function composeReport(profile: Profile): string {
  const m = metrics;
  const lines: string[] = [
    `🪔 ${profile.name} की हफ़्तावार रिपोर्ट · ${profile.en}'s week`,
    '',
    ...m.rings.map((r) => `${r.hi} · ${r.en}: ${Math.round(r.pct * 100)}%`),
    '',
    `🩺 BP ${m.tiles[0].val} · 👣 ${m.tiles[1].val} · दर्द ${m.tiles[2].val}/10 · नींद ${m.tiles[3].val} ${m.tiles[3].unit}`,
    `🔥 ${m.daysKept} दिन लगातार · दर्द ↓${m.painDrop}%`,
    '',
    'Saath 🪔',
  ];
  return lines.join('\n');
}
