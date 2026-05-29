import type { ReactNode } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  icon: ReactNode;
  title: string;
  hindi: string;
  /** small supporting line, e.g. "8 moves · 8 min" */
  meta?: string;
  /** implementation-intention anchor, e.g. "After morning chai" */
  anchor?: string;
  done?: boolean;
  onClick: () => void;
}

export default function TaskCard({
  icon,
  title,
  hindi,
  meta,
  anchor,
  done = false,
  onClick,
}: TaskCardProps) {
  return (
    <button
      type="button"
      className={`${styles.card} ${done ? styles.done : ''}`}
      onClick={onClick}
      aria-pressed={done}
    >
      <span className={styles.iconWrap} aria-hidden>
        {icon}
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.hindi}>{hindi}</span>
        {anchor && <span className={styles.anchor}>↳ {anchor}</span>}
        {meta && <span className={styles.meta}>{meta}</span>}
      </span>
      <span className={styles.right} aria-hidden>
        {done ? (
          <span className={styles.checkBubble}>
            <Check size={20} strokeWidth={3} />
          </span>
        ) : (
          <ChevronRight size={24} className={styles.chevron} />
        )}
      </span>
    </button>
  );
}
