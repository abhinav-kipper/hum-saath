import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Footprints, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { getLog, getLogs, upsertLog } from '../lib/store';
import type { DayLog } from '../types';
import styles from './Log.module.css';

const PAIN_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function bpStatus(sys: number, dia: number): 'ok' | 'watch' | 'high' {
  if (sys >= 140 || dia >= 90) return 'high';
  if (sys >= 130 || dia >= 85) return 'watch';
  return 'ok';
}

export default function Log() {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [pain, setPain] = useState<number | null>(null);
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [walked, setWalked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<DayLog[]>([]);

  useEffect(() => {
    if (!profile) return;
    getLog(profile).then((l) => {
      if (!l) return;
      if (typeof l.painScore === 'number') setPain(l.painScore);
      if (typeof l.systolic === 'number') setSys(String(l.systolic));
      if (typeof l.diastolic === 'number') setDia(String(l.diastolic));
      setWalked(Boolean(l.walked));
    });
    getLogs(profile).then(setHistory);
  }, [profile]);

  if (!profile) return null;
  const isPapa = profile === 'papa';

  const canSave = isPapa
    ? pain !== null || walked
    : (sys !== '' && dia !== '') || walked;

  const save = async () => {
    const patch = isPapa
      ? { painScore: pain ?? undefined, walked }
      : {
          systolic: sys ? Number(sys) : undefined,
          diastolic: dia ? Number(dia) : undefined,
          walked,
        };
    await upsertLog(profile, patch);
    setHistory(await getLogs(profile));
    setSaved(true);
  };

  // improvement message comparing earliest vs current in the series
  const metric = isPapa ? 'painScore' : 'systolic';
  const series = history
    .map((l) => l[metric as 'painScore' | 'systolic'])
    .filter((v): v is number => typeof v === 'number');
  const first = series[0];
  const latest = series[series.length - 1];
  const delta = first != null && latest != null ? latest - first : null;

  if (saved) {
    const improving = delta != null && delta < 0;
    const worse = delta != null && delta > 0;
    return (
      <div className={styles.page}>
        <div className={styles.savedWrap}>
          <span className={styles.savedBadge} aria-hidden>
            <Check size={40} strokeWidth={3} />
          </span>
          <h1 className={styles.savedTitle}>Saved</h1>
          <p className="hindi">दर्ज हो गया · शुक्रिया</p>

          {delta != null && series.length >= 2 && (
            <div className={styles.trendMsg}>
              <span
                className={`${styles.trendIcon} ${
                  improving ? styles.good : worse ? styles.warn : ''
                }`}
              >
                {improving ? (
                  <TrendingDown size={20} />
                ) : worse ? (
                  <TrendingUp size={20} />
                ) : (
                  <Minus size={20} />
                )}
              </span>
              <span>
                {isPapa ? 'Pain' : 'Systolic'} {improving ? 'down' : worse ? 'up' : 'steady'} from{' '}
                <b>{first}</b> to <b>{latest}</b>
                {isPapa ? '' : ' mmHg'} over {series.length} entries.
                {improving && ' Keep going!'}
              </span>
            </div>
          )}

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => navigate('/trends')}
          >
            See your trend
          </button>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() => navigate('/')}
          >
            Back to today
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Today’s check-in <span className={styles.titleHindi}>आज की जाँच</span>
        </h1>
        <p className={styles.sub}>One quick note about how you feel.</p>
      </header>

      {isPapa ? (
        <section className={styles.card}>
          <h2 className={styles.qTitle}>
            Back / leg pain right now?
            <span className="hindi"> पीठ/टांग का दर्द?</span>
          </h2>
          <p className={styles.qHelp}>1 = no pain · 10 = worst</p>
          <div className={styles.painGrid}>
            {PAIN_SCALE.map((n) => (
              <button
                key={n}
                type="button"
                className={`${styles.painBtn} ${pain === n ? styles.painActive : ''}`}
                onClick={() => setPain(n)}
                aria-pressed={pain === n}
              >
                {n}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.card}>
          <h2 className={styles.qTitle}>
            Blood pressure <span className="hindi">रक्तचाप</span>
          </h2>
          <div className={styles.bpRow}>
            <label className={styles.bpField}>
              <span className={styles.bpLabel}>Systolic · ऊपर</span>
              <input
                className={styles.bpInput}
                type="number"
                inputMode="numeric"
                placeholder="120"
                value={sys}
                onChange={(e) => setSys(e.target.value)}
              />
            </label>
            <span className={styles.bpSlash}>/</span>
            <label className={styles.bpField}>
              <span className={styles.bpLabel}>Diastolic · नीचे</span>
              <input
                className={styles.bpInput}
                type="number"
                inputMode="numeric"
                placeholder="80"
                value={dia}
                onChange={(e) => setDia(e.target.value)}
              />
            </label>
          </div>
          {sys && dia && (
            <BpHint status={bpStatus(Number(sys), Number(dia))} />
          )}
        </section>
      )}

      <section className={styles.card}>
        <h2 className={styles.qTitle}>
          Walked after a meal today?
          <span className="hindi"> खाने के बाद टहले?</span>
        </h2>
        <button
          type="button"
          className={`${styles.walkToggle} ${walked ? styles.walkOn : ''}`}
          onClick={() => setWalked((w) => !w)}
          aria-pressed={walked}
        >
          <Footprints size={24} />
          {walked ? 'Yes — done!' : 'Not yet'}
          <span className={styles.walkDot} aria-hidden />
        </button>
      </section>

      <button
        type="button"
        className={styles.saveBtn}
        onClick={save}
        disabled={!canSave}
      >
        Save check-in · सेव करें
      </button>
    </div>
  );
}

function BpHint({ status }: { status: 'ok' | 'watch' | 'high' }) {
  const map = {
    ok: { cls: styles.hintOk, en: 'Looking good.', hi: 'अच्छा है।' },
    watch: {
      cls: styles.hintWatch,
      en: 'A little elevated — keep an eye on it.',
      hi: 'थोड़ा ज़्यादा — ध्यान रखें।',
    },
    high: {
      cls: styles.hintHigh,
      en: 'On the high side. If it stays here, tell the doctor.',
      hi: 'ज़्यादा है — डॉक्टर को बताएँ।',
    },
  } as const;
  const h = map[status];
  return (
    <p className={`${styles.bpHint} ${h.cls}`}>
      {h.en} <span className="hindi">{h.hi}</span>
    </p>
  );
}
