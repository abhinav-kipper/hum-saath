/* ============================================================
   Month adherence heatmap — inspired by Almanac's year grid.
   Each day is shaded 0–4 by how much of the routine was done.
   Great for motivation and to show the doctor.
   ============================================================ */

import { todayKey } from '../lib/store';
import styles from './CalendarHeatmap.module.css';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function keyFor(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function CalendarHeatmap({
  levels,
  month = new Date(),
}: {
  levels: Record<string, number>;
  month?: Date;
}) {
  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = todayKey();
  const monthName = first.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const cells: ({ day: number; key: string } | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, key: keyFor(y, m, d) });

  const lvlClass = (n: number) =>
    styles[`lvl${Math.max(0, Math.min(4, n))}` as keyof typeof styles];

  return (
    <div>
      <div className={styles.monthName}>{monthName}</div>
      <div className={styles.weekdays}>
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {cells.map((c, i) =>
          c === null ? (
            <span key={i} className={styles.blank} />
          ) : (
            <span
              key={i}
              className={[
                styles.cell,
                lvlClass(levels[c.key] ?? 0),
                c.key === today ? styles.today : '',
                c.key > today ? styles.future : '',
              ].join(' ')}
            >
              {c.day}
            </span>
          ),
        )}
      </div>
      <div className={styles.legend}>
        <span>Less</span>
        <i className={`${styles.swatch} ${styles.lvl0}`} />
        <i className={`${styles.swatch} ${styles.lvl1}`} />
        <i className={`${styles.swatch} ${styles.lvl2}`} />
        <i className={`${styles.swatch} ${styles.lvl3}`} />
        <i className={`${styles.swatch} ${styles.lvl4}`} />
        <span>More</span>
      </div>
    </div>
  );
}
