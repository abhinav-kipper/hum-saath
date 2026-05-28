import { Flame, Sparkles } from 'lucide-react';
import type { StreakInfo } from '../types';
import styles from './StreakChip.module.css';

const MAX_DOTS = 7;

export default function StreakChip({ streak }: { streak: StreakInfo }) {
  if (streak.status === 'new') {
    return (
      <span className={styles.chip}>
        <Sparkles size={16} aria-hidden />
        <span>Start today · आज शुरू करें</span>
      </span>
    );
  }

  const active = streak.status === 'active' || streak.status === 'paused';
  const dotsOn = Math.min(streak.count, MAX_DOTS);
  const dayWord = streak.count === 1 ? 'day' : 'days';

  return (
    <span className={`${styles.chip} ${styles.streak}`}>
      <Flame
        size={16}
        className={active ? styles.flameOn : styles.flame}
        aria-hidden
      />
      <span className={styles.count}>{streak.count}</span>
      <span className={styles.label}>
        {dayWord}
        {streak.status === 'paused' && <span className={styles.paused}> · paused</span>}
      </span>
      <span className={styles.dots} aria-hidden>
        {Array.from({ length: MAX_DOTS }, (_, i) => (
          <i key={i} className={i < dotsOn ? styles.dotOn : styles.dot} />
        ))}
      </span>
    </span>
  );
}
