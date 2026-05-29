/* Jugnu's voice (Hindi TTS) + the typewriter hook. */

import { useEffect, useState } from 'react';

export function speak(text: string, on: boolean): void {
  if (!on || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'hi-IN';
    u.rate = 0.92;
    u.pitch = 1.05;
    const vs = window.speechSynthesis.getVoices();
    const hi = vs.find((v) => /hi[-_]IN/i.test(v.lang)) || vs.find((v) => /hi/i.test(v.lang));
    if (hi) u.voice = hi;
    window.speechSynthesis.speak(u);
  } catch {
    /* no-op */
  }
}

export function stopSpeak(): void {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* no-op */
  }
}

/** Reveals `text` one char at a time; returns [shown, done]. */
export function useTypewriter(text: string, on = true, speed = 26): [string, boolean] {
  const [out, setOut] = useState(on ? '' : text);
  const [done, setDone] = useState(!on);
  useEffect(() => {
    if (!on) {
      setOut(text);
      setDone(true);
      return;
    }
    setOut('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, on, speed]);
  return [out, done];
}
