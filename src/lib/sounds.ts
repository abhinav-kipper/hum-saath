/* ============================================================
   Soft sound + haptic feedback.

   Calm, low-volume confirmation tones — never game-y. Sine
   waves only, gentle attack/decay, paired with a light haptic
   buzz so a tap clearly "registers" (clarity for older hands).

   One toggle controls everything, persisted in localStorage.
   The AudioContext is created lazily on the first real call so
   we respect the browser autoplay policy (needs a user gesture).
   ============================================================ */

export type SoundName =
  | 'tap' // a single soft blip — UI taps
  | 'save' // gentle confirm — a check-in / med saved
  | 'done' // a small two-note rise — one task finished
  | 'celebrate' // warm major arpeggio — the whole day is done
  | 'streak' // a soft chime — streak milestone
  | 'cheer'; // a light sparkle — a family cheer sent/received

const MUTE_KEY = 'saath.muted.v1';
const MUTE_EVENT = 'saath:mute-changed';

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MUTE_EVENT, { detail: muted }));
  }
}

/** Subscribe to mute changes (so a toggle icon stays in sync). Returns an unsubscribe fn. */
export function onMuteChange(cb: (muted: boolean) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<boolean>).detail);
  window.addEventListener(MUTE_EVENT, handler);
  return () => window.removeEventListener(MUTE_EVENT, handler);
}

/* -------- audio -------- */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** One soft sine note with a gentle bell-like envelope. */
function note(ac: AudioContext, freq: number, start: number, dur: number, peak = 0.12): void {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const t0 = ac.currentTime + start;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.02); // soft attack
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); // gentle decay
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// Warm pentatonic-ish frequencies (C5, E5, G5, A5, C6).
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const A5 = 880.0;
const C6 = 1046.5;

const HAPTICS: Record<SoundName, number | number[]> = {
  tap: 8,
  save: 16,
  done: [12, 40, 12],
  celebrate: [16, 50, 16, 50, 24],
  streak: [20, 60, 20],
  cheer: [10, 30, 10],
};

function buzz(name: SoundName): void {
  try {
    navigator.vibrate?.(HAPTICS[name]);
  } catch {
    /* ignore */
  }
}

/** Play a soft feedback sound + matching haptic. No-op when muted. */
export function playSound(name: SoundName): void {
  if (isMuted()) return;
  buzz(name);
  const ac = audio();
  if (!ac) return;

  switch (name) {
    case 'tap':
      note(ac, A5, 0, 0.12, 0.06);
      break;
    case 'save':
      note(ac, E5, 0, 0.18, 0.1);
      note(ac, G5, 0.08, 0.22, 0.09);
      break;
    case 'done':
      note(ac, E5, 0, 0.2, 0.1);
      note(ac, A5, 0.1, 0.26, 0.1);
      break;
    case 'celebrate':
      note(ac, C5, 0, 0.3, 0.11);
      note(ac, E5, 0.1, 0.32, 0.11);
      note(ac, G5, 0.2, 0.34, 0.11);
      note(ac, C6, 0.32, 0.5, 0.12);
      break;
    case 'streak':
      note(ac, G5, 0, 0.28, 0.11);
      note(ac, C6, 0.12, 0.4, 0.12);
      break;
    case 'cheer':
      note(ac, A5, 0, 0.16, 0.08);
      note(ac, C6, 0.09, 0.24, 0.09);
      break;
  }
}
