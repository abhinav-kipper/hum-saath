import { useEffect } from 'react';
import Jugnu, { type JugnuMood } from './Jugnu';
import { speak, stopSpeak, useTypewriter } from '../lib/voice';
import type { Line } from '../types';

/* Jugnu + a glass bubble that types the Hindi line, then reveals
   the English subtitle. Speaks aloud when sound is on. */
export default function JugnuSays({
  line,
  size = 96,
  sound = false,
  mood = 'happy',
  compact = false,
}: {
  line: Line;
  size?: number;
  sound?: boolean;
  mood?: JugnuMood;
  compact?: boolean;
}) {
  const [hi, done] = useTypewriter(line.hi, true, 26);
  useEffect(() => {
    speak(line.hi, sound);
    return stopSpeak;
  }, [line.hi, sound]);

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
        {done && line.en && <p className="cap-en">{line.en}</p>}
        {!done && (
          <div className="wave" style={{ marginTop: 6 }}>
            <i /><i /><i /><i /><i />
          </div>
        )}
      </div>
    </div>
  );
}
