import { Flame, Sparkles } from 'lucide-react';
import type { StreakInfo } from '../types';
import styles from './StreakChip.module.css';

export default function StreakChip({ streak }: { streak: StreakInfo }) {
  if (streak.status === 'new') {
    return (
      <span className={styles.chip}>
        <Sparkles size={16} aria-hidden />
        <span>Start today · आज शुरू करें</span>
      </span>
    );
  }

  const dayWord = streak.count === 1 ? 'day' : 'days';
  return (
    <span className={`${styles.chip} ${styles.streak}`}>
      <Flame size={16} aria-hidden />
      <span>
        {streak.count} {dayWord}
        {streak.status === 'paused' && (
          <span className={styles.paused}> · paused</span>
        )}
      </span>
    </span>
  );
}
