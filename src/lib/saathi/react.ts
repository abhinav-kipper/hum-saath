/* ============================================================
   A tiny bus so any screen can make Dheeru pop in and react.

   Screens call reactSaathi(lines); the <SaathiReactions> layer
   mounted once in AppLayout shows a floating Dheeru + bubble and
   speaks it. A short global debounce stops rapid double-fires;
   one-time caps (streak milestones, etc.) live in the callers.
   ============================================================ */

import type { SaathiLine } from './moments';

type Listener = (lines: SaathiLine[]) => void;

const listeners = new Set<Listener>();
let lastFire = 0;

export function onReact(cb: Listener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function reactSaathi(lines: SaathiLine[], minGapMs = 1200): void {
  if (lines.length === 0) return;
  const now = Date.now();
  if (now - lastFire < minGapMs) return;
  lastFire = now;
  listeners.forEach((l) => l(lines));
}
