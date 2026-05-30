import { useEffect, useRef } from 'react';
import Jugnu, { type JugnuMood } from './Jugnu';
import { playMoment, speak, stopSpeak, useTypewriter } from '../lib/voice';
import { pickJugnuLine } from '../data/content';
import type { Line } from '../types';

/* Jugnu + a glass bubble that types the Hindi line, then reveals the English
   subtitle. Speaks aloud when sound is on.

   Pass a `moment` key (preferred): Jugnu rotates through that moment's line
   variants and plays the matching pre-recorded clip, falling back to device
   TTS. Or pass an explicit `line` for an ad-hoc one-off. */
export default function JugnuSays({
  line,
  moment,
  size = 96,
  sound = false,
  mood = 'happy',
  compact = false,
}: {
  line?: Line;
  moment?: string;
  size?: number;
  sound?: boolean;
  mood?: JugnuMood;
  compact?: boolean;
}) {
  // Pick once per distinct moment/line, stable across re-renders. Re-picks
  // (a fresh variant) only when the moment key — or explicit line — changes.
  const selKey = line ? `line:${line.hi}` : `moment:${moment ?? ''}`;
  const pick = useRef<{ key: string; line: Line; idx: number } | null>(null);
  if (!pick.current || pick.current.key !== selKey) {
    const chosen = line ? { line, idx: 0 } : moment ? pickJugnuLine(moment) : { line: { hi: '', en: '' }, idx: 0 };
    pick.current = { key: selKey, line: chosen.line, idx: chosen.idx };
  }
  const { line: chosen, idx } = pick.current;

  const [hi, done] = useTypewriter(chosen.hi, true, 26);
  useEffect(() => {
    if (moment && !line) playMoment(moment, idx, chosen.hi, sound);
    else speak(chosen.hi, sound);
    return stopSpeak;
  }, [moment, line, chosen.hi, idx, sound]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: compact ? 8 : 10 }}>
      <div style={{ flex: '0 0 auto', marginBottom: -6 }}>
        <Jugnu size={size} mood={done ? 'idle' : mood} />
      </div>
      <div className="bubble" style={{ flex: 1 }}>
        <p className="cap-hi">
          {hi}
          {!done && <span className="cursor" />}
        </p>
        {done && chosen.en && <p className="cap-en">{chosen.en}</p>}
        {!done && (
          <div className="wave" style={{ marginTop: 6 }}>
            <i /><i /><i /><i /><i />
          </div>
        )}
      </div>
    </div>
  );
}
