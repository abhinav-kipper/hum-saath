import { useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, RotateCcw } from 'lucide-react';
import Saathi from './Saathi';
import { useSaathi, hasGestured } from '../lib/saathi/voice';
import type { SaathiCtx } from '../lib/saathi/moments';
import styles from './SaathiHost.module.css';

export default function SaathiHost({
  ctx,
  encourage,
}: {
  ctx: SaathiCtx;
  encourage: string;
}) {
  const { unlocked, muted, speaking, caption, toggleMuted, playOpening } = useSaathi();
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  const allDone = ctx.totalCount > 0 && ctx.doneCount >= ctx.totalCount;
  const mood = speaking ? 'talking' : allDone ? 'happy' : 'idle';

  // Greet on open — but only once the user has unlocked audio this session.
  useEffect(() => {
    if (!hasGestured()) return;
    const t = setTimeout(() => playOpening(ctxRef.current), 600);
    return () => clearTimeout(t);
  }, [playOpening]);

  return (
    <div className={styles.wrap}>
      <Saathi mood={mood} />

      <div className={styles.bubble}>
        {caption ? (
          <>
            <p className={styles.hi}>{caption.hi}</p>
            <p className={styles.en}>{caption.en}</p>
          </>
        ) : (
          <p className={styles.encourage}>{encourage}</p>
        )}
      </div>

      <div className={styles.controls}>
        {!unlocked ? (
          <button type="button" className={styles.listen} onClick={() => playOpening(ctx)}>
            <Play size={20} aria-hidden />
            Suniye <span className="hindi">· सुनिए</span>
          </button>
        ) : (
          <button
            type="button"
            className={styles.replay}
            onClick={() => playOpening(ctx)}
            disabled={speaking}
          >
            <RotateCcw size={18} aria-hidden />
            Phir se · फिर से
          </button>
        )}
        <button
          type="button"
          className={styles.mute}
          onClick={toggleMuted}
          aria-pressed={!muted}
          aria-label={muted ? "Turn on Dheeru's voice" : "Mute Dheeru's voice"}
        >
          {muted ? <VolumeX size={18} aria-hidden /> : <Volume2 size={18} aria-hidden />}
        </button>
      </div>
    </div>
  );
}
