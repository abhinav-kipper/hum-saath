/* ============================================================
   Growing plant mascot — adapted from Almanac (todo-calendar).
   Grows through 5 stages as the day's tasks get done; blinks,
   wiggles on each new completion, and blooms with sparkles at
   100%. Reuses the original SVG art, retyped + recoloured to
   Saath tokens (outlines = --ink, pot = --accent).
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import styles from './PlantMascot.module.css';

const INK = 'var(--ink)';
const HIGHLIGHT = '#FFFDF9';
const BLUSH = '#E8A0A0';

type Mood = 'happy' | 'wow' | 'sleep' | 'party';

function Face({ mood, x, y, size }: { mood: Mood; x: number; y: number; size: number }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 2400 + Math.random() * 1600);
    return () => clearInterval(id);
  }, []);

  const eye = (cx: number) => {
    if (mood === 'sleep')
      return (
        <path
          d={`M${cx - 4} 0 q4 -3 8 0`}
          stroke={INK}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      );
    if (mood === 'wow') return <circle cx={cx} cy={0} r={2.2} fill={INK} />;
    if (blink)
      return (
        <path
          d={`M${cx - 3.5} 0 H${cx + 3.5}`}
          stroke={INK}
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    return (
      <g>
        <circle cx={cx} cy={0} r={3} fill={INK} />
        <circle cx={cx + 0.9} cy={-1} r={0.9} fill={HIGHLIGHT} />
      </g>
    );
  };

  const mouth =
    mood === 'party' ? (
      <path d="M-5 6 q5 6 10 0" stroke={INK} strokeWidth="2" strokeLinecap="round" fill={BLUSH} />
    ) : mood === 'wow' ? (
      <ellipse cx="0" cy="6" rx="3" ry="3.4" fill={INK} />
    ) : mood === 'sleep' ? (
      <path d="M-3 6 h6" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    ) : (
      <path d="M-4 5 q4 4 8 0" stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none" />
    );

  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <circle cx={-7} cy={3} r={2.4} fill={BLUSH} opacity="0.7" />
      <circle cx={7} cy={3} r={2.4} fill={BLUSH} opacity="0.7" />
      {eye(-4)}
      {eye(4)}
      {mouth}
    </g>
  );
}

function Pot() {
  return (
    <g>
      <ellipse cx="100" cy="158" rx="40" ry="6" fill="#5C3A1E" stroke={INK} strokeWidth="2.5" />
      <path
        d="M62 160 L70 195 Q70 198 73 198 L127 198 Q130 198 130 195 L138 160 Z"
        fill="var(--accent)"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="58" y="152" width="84" height="12" rx="3" fill="var(--accent)" stroke={INK} strokeWidth="2.5" />
      <path d="M67 165 L72 188" stroke={HIGHLIGHT} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    </g>
  );
}

const LEAF_A = '#8FB87A';
const LEAF_B = '#A9CF8E';

function Sparkle({ x, y, delay = '0s' }: { x: number; y: number; delay?: string }) {
  return (
    <g transform={`translate(${x} ${y})`} className={styles.sparkle} style={{ animationDelay: delay }}>
      <path
        d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"
        fill="var(--gold)"
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </g>
  );
}

function StageArt({ stage, mood, dancing }: { stage: number; mood: Mood; dancing: boolean }) {
  if (stage <= 0)
    return (
      <g>
        <Pot />
        <ellipse cx="100" cy="154" rx="9" ry="6.5" fill="#8B5A2B" stroke={INK} strokeWidth="2.5" />
        <Face mood="sleep" x={100} y={152} size={0.55} />
      </g>
    );

  if (stage === 1)
    return (
      <g>
        <Pot />
        <path d="M100 152 V120" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <path d="M100 152 V120" stroke={LEAF_A} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M100 132 q-12 -6 -16 -16 q10 -2 18 8 Z" fill={LEAF_B} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M100 128 q12 -6 16 -16 q-10 -2 -18 8 Z" fill={LEAF_B} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <Face mood={mood} x={100} y={114} size={0.65} />
      </g>
    );

  if (stage === 2)
    return (
      <g>
        <Pot />
        <path d="M100 152 V80" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M100 152 V80" stroke={LEAF_A} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M100 140 q-18 -4 -26 -18 q14 -4 26 10 Z" fill={LEAF_B} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M100 130 q18 -4 26 -18 q-14 -4 -26 10 Z" fill={LEAF_B} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M100 108 q-14 -6 -20 -18 q12 -3 22 8 Z" fill={LEAF_A} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M100 100 q14 -6 20 -18 q-12 -3 -22 8 Z" fill={LEAF_A} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <Face mood={mood} x={100} y={76} size={0.75} />
      </g>
    );

  if (stage === 3)
    return (
      <g>
        <Pot />
        <path d="M100 152 V62" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M100 152 V62" stroke={LEAF_A} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M100 138 q-20 -4 -28 -20 q16 -4 28 12 Z" fill={LEAF_B} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M100 126 q20 -4 28 -20 q-16 -4 -28 12 Z" fill={LEAF_B} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M100 104 q-16 -6 -22 -20 q14 -3 24 10 Z" fill={LEAF_A} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M100 92 q16 -6 22 -20 q-14 -3 -24 10 Z" fill={LEAF_A} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <ellipse cx="100" cy="56" rx="16" ry="18" fill="var(--gold)" stroke={INK} strokeWidth="2.5" />
        <path d="M88 56 q12 -8 24 0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <Face mood={mood} x={100} y={56} size={0.9} />
      </g>
    );

  // stage 4 — full bloom
  return (
    <g>
      <Pot />
      <path d="M100 152 V60" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M100 152 V60" stroke={LEAF_A} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M100 140 q-20 -4 -30 -22 q18 -4 30 12 Z" fill={LEAF_B} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M100 124 q22 -4 30 -22 q-18 -4 -30 12 Z" fill={LEAF_B} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M100 104 q-18 -6 -24 -22 q16 -3 26 12 Z" fill={LEAF_A} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M100 90 q18 -6 24 -22 q-16 -3 -26 12 Z" fill={LEAF_A} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <g className={dancing ? styles.danceFlower : ''}>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = i * 72 - 90;
          const rad = (angle * Math.PI) / 180;
          const cx = 100 + Math.cos(rad) * 18;
          const cy = 56 + Math.sin(rad) * 18;
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={14}
              ry={11}
              fill={BLUSH}
              stroke={INK}
              strokeWidth="2.5"
              transform={`rotate(${angle + 90} ${cx} ${cy})`}
            />
          );
        })}
        <circle cx="100" cy="56" r="14" fill="var(--gold)" stroke={INK} strokeWidth="2.5" />
        <Face mood={mood} x={100} y={56} size={1} />
      </g>
      {dancing && (
        <g>
          <Sparkle x={60} y={40} />
          <Sparkle x={150} y={36} delay="0.2s" />
          <Sparkle x={150} y={92} delay="0.4s" />
          <Sparkle x={48} y={92} delay="0.6s" />
        </g>
      )}
    </g>
  );
}

export default function PlantMascot({
  done,
  total,
  label,
}: {
  done: number;
  total: number;
  label?: string;
}) {
  const progress = total === 0 ? 0 : done / total;
  const stage =
    total === 0 ? 0 : progress >= 1 ? 4 : progress >= 0.66 ? 3 : progress >= 0.34 ? 2 : progress > 0 ? 1 : 0;
  const mood: Mood = total === 0 ? 'sleep' : progress >= 1 ? 'party' : 'happy';
  const dancing = stage === 4;

  const [wiggling, setWiggling] = useState(false);
  const prevDone = useRef(done);
  useEffect(() => {
    if (done > prevDone.current) {
      setWiggling(true);
      const t = setTimeout(() => setWiggling(false), 520);
      prevDone.current = done;
      return () => clearTimeout(t);
    }
    prevDone.current = done;
  }, [done]);

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.mascot} ${wiggling ? styles.wiggle : ''} ${dancing ? styles.dancing : ''}`}
      >
        <svg viewBox="0 0 200 210" width="100%" height="100%" role="img" aria-label="Your plant friend">
          <StageArt stage={stage} mood={mood} dancing={dancing} />
        </svg>
      </div>
      <p className={styles.label}>
        {label ?? (total === 0 ? 'Plant me a task 🌱' : `${done}/${total} done`)}
      </p>
    </div>
  );
}
