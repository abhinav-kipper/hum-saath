import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Footprints, Dumbbell } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { getLogs, todayKey } from '../lib/store';
import type { DayLog } from '../types';
import TrendChart, { type ChartSeries } from '../components/TrendChart';
import styles from './Trends.module.css';

const DAYS = 14;

function lastNDays(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(todayKey(d));
  }
  return out;
}

function shortLabel(key: string): string {
  const [, m, d] = key.split('-');
  return `${Number(d)}/${Number(m)}`;
}

export default function Trends() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<DayLog[]>([]);

  useEffect(() => {
    if (profile) getLogs(profile).then(setLogs);
  }, [profile]);

  if (!profile) return null;
  const isPapa = profile === 'papa';

  const days = lastNDays(DAYS);
  const byDate = new Map(logs.map((l) => [l.date, l]));
  const labels = days.map(shortLabel);

  const valueAt = (date: string, key: 'painScore' | 'systolic' | 'diastolic') =>
    byDate.get(date)?.[key] ?? null;

  const series: ChartSeries[] = isPapa
    ? [
        {
          label: 'Pain',
          color: 'var(--terracotta)',
          points: days.map((d) => valueAt(d, 'painScore')),
        },
      ]
    : [
        {
          label: 'Systolic',
          color: 'var(--terracotta)',
          points: days.map((d) => valueAt(d, 'systolic')),
        },
        {
          label: 'Diastolic',
          color: 'var(--sage-dark)',
          points: days.map((d) => valueAt(d, 'diastolic')),
        },
      ];

  const primary = series[0].points.filter((v): v is number => v != null);
  const hasData = primary.length > 0;
  const first = primary[0];
  const latest = primary[primary.length - 1];
  const delta = first != null && latest != null ? latest - first : null;

  const walkCount = days.filter((d) => byDate.get(d)?.walked).length;
  const exerciseCount = days.filter((d) => byDate.get(d)?.exerciseDone).length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Your progress <span className={styles.titleHindi}>आपकी प्रगति</span>
        </h1>
        <p className={styles.sub}>Last 14 days · show this to the doctor.</p>
      </header>

      {!hasData ? (
        <div className={styles.empty}>
          <LineChart size={40} aria-hidden />
          <p className={styles.emptyTitle}>No data yet</p>
          <p className={styles.emptySub}>
            Log a few days and your trend appears here.
            <br />
            <span className="hindi">कुछ दिन दर्ज करें, ट्रेंड यहाँ दिखेगा।</span>
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => navigate('/log')}
          >
            Log today
          </button>
        </div>
      ) : (
        <>
          {delta != null && primary.length >= 2 && (
            <div
              className={`${styles.summary} ${
                delta < 0 ? styles.good : delta > 0 ? styles.warn : ''
              }`}
            >
              {isPapa ? 'Pain' : 'Systolic'}{' '}
              {delta < 0 ? 'down' : delta > 0 ? 'up' : 'steady'} from{' '}
              <b>{first}</b> to <b>{latest}</b>
              {delta < 0 && ' — improving!'}
            </div>
          )}

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              {isPapa ? 'Back & leg pain (1–10)' : 'Blood pressure (mmHg)'}
            </h2>
            <TrendChart
              labels={labels}
              series={series}
              yMin={isPapa ? 0 : 60}
              yMax={isPapa ? 10 : 180}
              band={isPapa ? undefined : { from: 70, to: 120 }}
              unit={isPapa ? '/10' : 'mmHg'}
            />
            {!isPapa && (
              <div className={styles.legend}>
                <span>
                  <i className={styles.dotTerra} /> Systolic
                </span>
                <span>
                  <i className={styles.dotSage} /> Diastolic
                </span>
                <span className={styles.legendBand}>Shaded = healthy range</span>
              </div>
            )}
          </section>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <Footprints size={22} aria-hidden />
              <span className={styles.statNum}>{walkCount}</span>
              <span className={styles.statLabel}>walks · 14d</span>
            </div>
            <div className={styles.stat}>
              <Dumbbell size={22} aria-hidden />
              <span className={styles.statNum}>{exerciseCount}</span>
              <span className={styles.statLabel}>workouts · 14d</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
