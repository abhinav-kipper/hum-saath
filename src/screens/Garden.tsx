import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { getLogs, getMedCountsByDate } from '../lib/store';
import { computeGarden, DAYS_PER_FLOWER, type GardenState } from '../lib/garden';
import { launchConfetti } from '../lib/confetti';
import { playSound } from '../lib/sounds';
import type { DayLog } from '../types';
import styles from './Garden.module.css';

const INK = 'var(--ink)';
const LEAF_A = '#8FB87A';
const LEAF_B = '#A9CF8E';
// Warm, calm petal palette — varied but never loud.
const PETALS = ['#E8A0A0', '#D4A53A', '#C9A0D0', '#E0A87A', '#E6B8C2'];

/** One stem that grows taller and blooms as `maturity` (0–1) rises. */
function Flower({ maturity, seed }: { maturity: number; seed: number }) {
  const m = Math.max(0, Math.min(1, maturity));
  const stemH = 16 + m * 52; // 16..68px
  const topY = 86 - stemH;
  const petal = PETALS[seed % PETALS.length];
  const showLeaves = m >= 0.25;
  const stage = m >= 0.85 ? 'bloom' : m >= 0.5 ? 'bud' : 'sprout';
  const sway = `${(seed % 5) * 0.4}s`;

  return (
    <svg
      viewBox="0 0 60 96"
      className={styles.flower}
      style={{ animationDelay: sway }}
      role="img"
      aria-hidden
    >
      {/* stem */}
      <path
        d={`M30 86 V${topY}`}
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d={`M30 86 V${topY}`}
        stroke={LEAF_A}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {showLeaves && (
        <g>
          <path
            d={`M30 ${topY + stemH * 0.45} q-13 -3 -18 -13 q11 -3 18 7 Z`}
            fill={LEAF_B}
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d={`M30 ${topY + stemH * 0.6} q13 -3 18 -13 q-11 -3 -18 7 Z`}
            fill={LEAF_A}
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>
      )}

      {stage === 'sprout' && (
        <g>
          <path
            d={`M30 ${topY} q-9 -2 -12 -9 q8 -2 12 5 Z`}
            fill={LEAF_B}
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d={`M30 ${topY} q9 -2 12 -9 q-8 -2 -12 5 Z`}
            fill={LEAF_B}
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>
      )}

      {stage === 'bud' && (
        <g>
          <ellipse cx="30" cy={topY} rx="7" ry="10" fill={petal} stroke={INK} strokeWidth="2" />
          <path d={`M24 ${topY + 6} q6 5 12 0`} stroke={INK} strokeWidth="1.6" fill="none" />
        </g>
      )}

      {stage === 'bloom' && (
        <g>
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = i * 72 - 90;
            const rad = (angle * Math.PI) / 180;
            const cx = 30 + Math.cos(rad) * 11;
            const cy = topY + Math.sin(rad) * 11;
            return (
              <ellipse
                key={i}
                cx={cx}
                cy={cy}
                rx={8}
                ry={6}
                fill={petal}
                stroke={INK}
                strokeWidth="2"
                transform={`rotate(${angle + 90} ${cx} ${cy})`}
              />
            );
          })}
          <circle cx="30" cy={topY} r="7" fill="var(--gold)" stroke={INK} strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

function seenKey(profile: string): string {
  return `saath.garden.seen.${profile}.v1`;
}

export default function Garden() {
  const { profile, info } = useProfile();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<DayLog[] | null>(null);
  const [medCounts, setMedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!profile) return;
    getLogs(profile).then(setLogs);
    getMedCountsByDate(profile).then(setMedCounts);
  }, [profile]);

  const garden: GardenState | null = useMemo(
    () => (logs ? computeGarden(logs, medCounts) : null),
    [logs, medCounts],
  );

  // Celebrate when a new permanent bloom has appeared since the last visit.
  useEffect(() => {
    if (!profile || !garden) return;
    const seen = Number(localStorage.getItem(seenKey(profile)) ?? '0');
    if (garden.flowers > seen) {
      launchConfetti();
      playSound('streak');
    }
    localStorage.setItem(seenKey(profile), String(garden.flowers));
  }, [profile, garden]);

  if (!profile || !info || !garden) return null;

  const blooms = Array.from({ length: garden.flowers });
  const growingMaturity = Math.max(0.12, garden.growing);
  const pct = Math.round(garden.growing * 100);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {info.name}’s garden <span className={styles.titleHindi}>बगीचा</span>
        </h1>
        <p className={styles.sub}>{garden.title}</p>
        <p className="hindi">{garden.titleHindi}</p>
      </header>

      <section className={styles.bed}>
        {garden.tendedDays === 0 ? (
          <div className={styles.empty}>
            <Sprout size={40} aria-hidden />
            <p className={styles.emptyTitle}>Plant your first seed today</p>
            <p className="hindi">आज पहला बीज बोएँ</p>
            <p className={styles.emptySub}>
              Every day you tend your health, the garden grows a little.
            </p>
          </div>
        ) : (
          <div className={styles.row}>
            {blooms.map((_, i) => (
              <Flower key={i} maturity={1} seed={i} />
            ))}
            <span className={styles.growing}>
              <Flower maturity={growingMaturity} seed={garden.flowers} />
            </span>
          </div>
        )}
      </section>

      {garden.tendedDays > 0 && (
        <div className={styles.next}>
          <div className={styles.nextHead}>
            <span>
              {garden.daysToNext === DAYS_PER_FLOWER && garden.growing === 0
                ? 'A fresh sprout is on its way 🌱'
                : `${garden.daysToNext} more day${garden.daysToNext === 1 ? '' : 's'} to the next flower 🌸`}
            </span>
            <span className={styles.nextPct}>{pct}%</span>
          </div>
          <div className={styles.track} aria-hidden>
            <div className={styles.fill} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{garden.flowers}</span>
          <span className={styles.statLabel}>flowers · फूल</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{garden.tendedDays}</span>
          <span className={styles.statLabel}>days tended · दिन</span>
        </div>
      </div>

      <p className={styles.note}>
        One flower for every {DAYS_PER_FLOWER} days you look after yourself. Miss a day?
        No worry — your flowers stay. <span className="hindi">फूल कभी मुरझाते नहीं।</span>
      </p>

      <button type="button" className={styles.todayBtn} onClick={() => navigate('/')}>
        Tend it today · आज सँवारें
      </button>
    </div>
  );
}
