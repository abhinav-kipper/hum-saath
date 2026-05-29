import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Footprints, Dumbbell } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { getLogs, getMedCountsByDate, listMedicines, todayKey } from '../lib/store';
import { checkinKind } from '../lib/checkin';
import type { DayLog } from '../types';
import TrendChart, { type ChartSeries } from '../components/TrendChart';
import CalendarHeatmap from '../components/CalendarHeatmap';
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

type MetricKey = 'painScore' | 'systolic' | 'diastolic' | 'moodScore';

export default function Trends() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [medCounts, setMedCounts] = useState<Record<string, number>>({});
  const [medsTotal, setMedsTotal] = useState(0);

  useEffect(() => {
    if (!profile) return;
    getLogs(profile).then(setLogs);
    getMedCountsByDate(profile).then(setMedCounts);
    listMedicines(profile).then((m) => setMedsTotal(m.length));
  }, [profile]);

  if (!profile) return null;
  const kind = checkinKind(profile);

  const days = lastNDays(DAYS);
  const byDate = new Map(logs.map((l) => [l.date, l]));
  const labels = days.map(shortLabel);

  const valueAt = (date: string, key: MetricKey) => byDate.get(date)?.[key] ?? null;

  const series: ChartSeries[] =
    kind === 'pain'
      ? [
          {
            label: 'Pain',
            color: 'var(--accent)',
            points: days.map((d) => valueAt(d, 'painScore')),
          },
        ]
      : kind === 'mood'
        ? [
            {
              label: 'Mood',
              color: 'var(--accent)',
              points: days.map((d) => valueAt(d, 'moodScore')),
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

  // mood: higher is better; pain & BP: lower is better
  const higherBetter = kind === 'mood';
  const improving = delta != null && (higherBetter ? delta > 0 : delta < 0);
  const worse = delta != null && (higherBetter ? delta < 0 : delta > 0);
  const numDir = delta == null ? 'steady' : delta < 0 ? 'down' : delta > 0 ? 'up' : 'steady';
  const metricLabel = kind === 'mood' ? 'Mood' : kind === 'bp' ? 'Systolic' : 'Pain';

  const cardTitle =
    kind === 'pain'
      ? 'Back & leg pain (1–10)'
      : kind === 'mood'
        ? 'Mood (1–5)'
        : 'Blood pressure (mmHg)';
  const yMin = kind === 'mood' ? 1 : kind === 'bp' ? 60 : 0;
  const yMax = kind === 'mood' ? 5 : kind === 'bp' ? 180 : 10;
  const unit = kind === 'mood' ? '/5' : kind === 'bp' ? 'mmHg' : '/10';

  const walkCount = days.filter((d) => byDate.get(d)?.walked).length;
  const exerciseCount = days.filter((d) => byDate.get(d)?.exerciseDone).length;

  // adherence heatmap levels (0–4) per active day
  const expected = 3 + (medsTotal > 0 ? 1 : 0);
  const heatLevels: Record<string, number> = {};
  const activityDates = new Set<string>([
    ...logs.map((l) => l.date),
    ...Object.keys(medCounts),
  ]);
  activityDates.forEach((date) => {
    const l = byDate.get(date);
    let done = 0;
    if (l?.exerciseDone) done++;
    const checkin =
      kind === 'pain'
        ? typeof l?.painScore === 'number'
        : kind === 'mood'
          ? typeof l?.moodScore === 'number'
          : typeof l?.systolic === 'number';
    if (checkin) done++;
    if (l?.walked) done++;
    if (medsTotal > 0 && (medCounts[date] ?? 0) >= medsTotal) done++;
    if (done > 0) heatLevels[date] = Math.max(1, Math.round((done / expected) * 4));
  });

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
                improving ? styles.good : worse ? styles.warn : ''
              }`}
            >
              {metricLabel} {numDir} from <b>{first}</b> to <b>{latest}</b>
              {improving && ' · behtar ho raha hai!'}
            </div>
          )}

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>{cardTitle}</h2>
            <TrendChart
              labels={labels}
              series={series}
              yMin={yMin}
              yMax={yMax}
              band={kind === 'bp' ? { from: 70, to: 120 } : undefined}
              unit={unit}
            />
            {kind === 'bp' && (
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

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>This month · इस महीना</h2>
            <CalendarHeatmap levels={heatLevels} />
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
