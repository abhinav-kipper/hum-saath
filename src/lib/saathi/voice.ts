/* ============================================================
   Dheeru's voice — the hybrid audio player.

   For each line: if a pre-generated MP3 clip exists (the manifest
   at /voice/voice-manifest.json, produced by scripts/generate-
   voice.mjs), play it — best quality, offline, consistent voice.
   Otherwise speak the Hindi text with the device's TTS. So the
   app talks on day one and silently upgrades when clips are added.

   Browser autoplay needs a user gesture, so the first playback
   must come from a tap (the "Suniye" button). After that, within
   the session, we can greet on open.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from 'react';
import { buildOpening, type SaathiCtx, type SaathiLine } from './moments';

const MUTE_KEY = 'saath.saathiMuted.v1';
const GESTURE_KEY = 'saath.saathiGestured.v1';
const MUTE_EVENT = 'saath:saathi-mute';

let manifest: Record<string, boolean> | null = null;

async function loadManifest(): Promise<Record<string, boolean>> {
  if (manifest) return manifest;
  try {
    const res = await fetch('/voice/voice-manifest.json', { cache: 'no-cache' });
    manifest = res.ok ? ((await res.json()) as Record<string, boolean>) : {};
  } catch {
    manifest = {};
  }
  return manifest;
}

export function hasGestured(): boolean {
  try {
    return sessionStorage.getItem(GESTURE_KEY) === '1';
  } catch {
    return false;
  }
}

function markGestured(): void {
  try {
    sessionStorage.setItem(GESTURE_KEY, '1');
  } catch {
    /* ignore */
  }
}

function pickHindiVoice(): SpeechSynthesisVoice | null {
  const vs = window.speechSynthesis?.getVoices?.() ?? [];
  return (
    vs.find((v) => v.lang === 'hi-IN') ??
    vs.find((v) => v.lang?.toLowerCase().startsWith('hi')) ??
    null
  );
}

function speakTTS(text: string): Promise<void> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth) {
      // No TTS: hold the caption for a readable beat instead.
      setTimeout(resolve, Math.min(4500, 1000 + text.length * 55));
      return;
    }
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'hi-IN';
      u.rate = 0.95; // Dheeru is unhurried
      u.pitch = 1;
      const v = pickHindiVoice();
      if (v) u.voice = v;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      synth.speak(u);
    } catch {
      resolve();
    }
  });
}

function playClip(key: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio(`/voice/${key}.mp3`);
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      void audio.play().catch(() => resolve());
    } catch {
      resolve();
    }
  });
}

export function useSaathi() {
  const [unlocked, setUnlocked] = useState(hasGestured);
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [speaking, setSpeaking] = useState(false);
  const [caption, setCaption] = useState<SaathiLine | null>(null);

  const mutedRef = useRef(muted);
  const seq = useRef(0);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    // Warm up the voice list + manifest early.
    window.speechSynthesis?.getVoices?.();
    void loadManifest();
  }, []);

  // Keep every Saathi instance's mute in sync, wherever it's toggled.
  useEffect(() => {
    const handler = (e: Event) => setMuted((e as CustomEvent<boolean>).detail);
    window.addEventListener(MUTE_EVENT, handler);
    return () => window.removeEventListener(MUTE_EVENT, handler);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try {
        localStorage.setItem(MUTE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      if (next) window.speechSynthesis?.cancel?.();
      window.dispatchEvent(new CustomEvent(MUTE_EVENT, { detail: next }));
      return next;
    });
  }, []);

  const speakLines = useCallback(async (lines: SaathiLine[]) => {
    const mine = ++seq.current;
    const mf = await loadManifest();
    setSpeaking(true);
    for (const line of lines) {
      if (mine !== seq.current) break; // a newer playback superseded us
      setCaption(line);
      if (mutedRef.current) {
        // Muted: still show the caption for a readable beat.
        await new Promise((r) => setTimeout(r, Math.min(3500, 1100 + line.hi.length * 55)));
      } else if (line.clip && mf[line.clip]) {
        await playClip(line.clip);
      } else {
        await speakTTS(line.hi);
      }
    }
    if (mine === seq.current) setSpeaking(false);
  }, []);

  const stop = useCallback(() => {
    seq.current++;
    window.speechSynthesis?.cancel?.();
    setSpeaking(false);
  }, []);

  /** Greet + read the plan. Must be called from a user gesture the first time. */
  const playOpening = useCallback(
    (ctx: SaathiCtx) => {
      markGestured();
      setUnlocked(true);
      void speakLines(buildOpening(ctx));
    },
    [speakLines],
  );

  return { unlocked, muted, speaking, caption, toggleMuted, playOpening, play: speakLines, stop };
}
