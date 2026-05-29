/* ============================================================
   Dheeru — the patient tortoise. A calm, bespectacled companion.
   SVG in the same hand-drawn ink-outline style as the garden art.
   Moods: idle (slow blink), talking (head bob + mouth flap),
   happy (bigger smile + sparkles). Shell echoes the warm palette.
   ============================================================ */

import { useEffect, useState } from 'react';
import styles from './Saathi.module.css';

const INK = 'var(--ink)';
const HIGHLIGHT = '#FFFDF9';
const BLUSH = '#E8A0A0';
const SHELL = '#7BA05B';
const SHELL_DARK = '#5C7A43';
const SKIN = '#A9CF8E';
const RIM = '#D4A53A';

export type SaathiMood = 'idle' | 'talking' | 'happy';

function Sparkle({ x, y, delay }: { x: number; y: number; delay: string }) {
  return (
    <g transform={`translate(${x} ${y})`} className={styles.sparkle} style={{ animationDelay: delay }}>
      <path
        d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z"
        fill={RIM}
        stroke={INK}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </g>
  );
}

export default function Saathi({
  mood = 'idle',
  size = 150,
}: {
  mood?: SaathiMood;
  size?: number;
}) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 2600 + Math.random() * 1800);
    return () => clearInterval(id);
  }, []);

  const talking = mood === 'talking';
  const happy = mood === 'happy';

  const eye = (cx: number) =>
    blink ? (
      <path
        d={`M${cx - 4} 0 H${cx + 4}`}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    ) : (
      <g>
        <circle cx={cx} cy={0} r={3.4} fill={INK} />
        <circle cx={cx + 1} cy={-1.1} r={1} fill={HIGHLIGHT} />
      </g>
    );

  return (
    <div
      className={`${styles.host} ${talking ? styles.talking : ''} ${happy ? styles.happy : ''}`}
      style={{ width: size, height: size * 0.853 }}
    >
      <svg viewBox="0 0 200 170" width="100%" height="100%" role="img" aria-label="Dheeru, your companion">
        {/* ground shadow */}
        <ellipse cx="100" cy="150" rx="64" ry="9" fill={INK} opacity="0.08" />

        {/* back legs */}
        <ellipse cx="52" cy="132" rx="15" ry="12" fill={SHELL_DARK} stroke={INK} strokeWidth="2.5" />
        <ellipse cx="148" cy="132" rx="15" ry="12" fill={SHELL_DARK} stroke={INK} strokeWidth="2.5" />

        {/* tail */}
        <path d="M36 120 q-12 4 -16 -2 q8 -8 18 -4 Z" fill={SKIN} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />

        {/* shell */}
        <g className={styles.shell}>
          <path
            d="M34 120 Q30 46 100 46 Q170 46 166 120 Z"
            fill={SHELL}
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* rim band */}
          <path d="M34 120 Q100 134 166 120" fill="none" stroke={INK} strokeWidth="2.5" />
          {/* scutes */}
          <path d="M100 50 L100 120" stroke={SHELL_DARK} strokeWidth="2.2" />
          <path d="M66 58 L60 120" stroke={SHELL_DARK} strokeWidth="2.2" />
          <path d="M134 58 L140 120" stroke={SHELL_DARK} strokeWidth="2.2" />
          <path
            d="M82 70 Q100 62 118 70 Q120 88 100 92 Q80 88 82 70 Z"
            fill={SHELL_DARK}
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
            opacity="0.55"
          />
        </g>

        {/* front legs */}
        <ellipse cx="62" cy="140" rx="16" ry="12" fill={SKIN} stroke={INK} strokeWidth="2.5" />
        <ellipse cx="138" cy="140" rx="16" ry="12" fill={SKIN} stroke={INK} strokeWidth="2.5" />

        {/* head */}
        <g className={styles.head}>
          <path d="M84 120 Q84 138 100 138 Q116 138 116 120 Z" fill={SKIN} stroke={INK} strokeWidth="2.5" />
          <circle cx="100" cy="118" r="30" fill={SKIN} stroke={INK} strokeWidth="3" />

          {/* cheeks */}
          <circle cx="80" cy="122" r="5" fill={BLUSH} opacity="0.65" />
          <circle cx="120" cy="122" r="5" fill={BLUSH} opacity="0.65" />

          {/* eyes */}
          <g transform="translate(0 112)">
            {eye(89)}
            {eye(111)}
          </g>

          {/* reading glasses */}
          <g stroke={INK} strokeWidth="2.4" fill="none">
            <circle cx="89" cy="112" r="11" fill={HIGHLIGHT} fillOpacity="0.18" />
            <circle cx="111" cy="112" r="11" fill={HIGHLIGHT} fillOpacity="0.18" />
            <path d="M99 110 q1 -2.5 2 0" strokeLinecap="round" />
            <path d="M78 110 q-9 -3 -13 1" strokeLinecap="round" />
            <path d="M122 110 q9 -3 13 1" strokeLinecap="round" />
          </g>

          {/* mouth */}
          {talking ? (
            <ellipse className={styles.mouth} cx="100" cy="130" rx="6" ry="5" fill={INK} />
          ) : (
            <path
              d={happy ? 'M90 128 q10 11 20 0' : 'M93 129 q7 6 14 0'}
              stroke={INK}
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </g>

        {happy && (
          <g>
            <Sparkle x={42} y={60} delay="0s" />
            <Sparkle x={160} y={56} delay="0.25s" />
            <Sparkle x={166} y={104} delay="0.5s" />
          </g>
        )}
      </svg>
    </div>
  );
}
