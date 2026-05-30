import Icon from '../components/Icon';
import Ring from '../components/Ring';
import Bi from '../components/Bi';
import Chip from '../components/Chip';
import JugnuSays from '../components/JugnuSays';
import { useApp } from '../context/AppContext';
import { lines, medsByProfile, HI_DAY } from '../data/content';
import { lastNDays } from '../lib/util';
import { shareOnWhatsApp } from '../lib/share';
import type { Adherence, IconName, MetricRing, MetricTile, Profile } from '../types';

/* per-profile chart + tile labels (rings + adherence labels are common). */
function chartTitle(pid: Profile['id']) {
  if (pid === 'papa') return { hi: 'दर्द — रोज़', en: 'PAIN · DAILY' };
  if (pid === 'mummy') return { hi: 'बीपी स्कोर — रोज़', en: 'BP SCORE · DAILY' };
  return { hi: 'मूड — रोज़', en: 'MOOD · DAILY' };
}
function primaryTile(pid: Profile['id'], val: number | null): MetricTile {
  const v = val != null ? String(val) : '—';
  const foot = val != null ? 'पिछला लॉग · last logged' : 'अभी कोई लॉग नहीं · no log yet';
  if (pid === 'papa') return { icon: 'drop', color: 'var(--coral)', hi: 'दर्द', en: 'PAIN', val: v, unit: '/10', foot };
  if (pid === 'mummy') return { icon: 'heart', color: 'var(--coral)', hi: 'बीपी स्कोर', en: 'BP SCORE', val: v, unit: '/10', foot };
  return { icon: 'smile', color: 'var(--peri)', hi: 'मूड', en: 'MOOD', val: v, unit: '/10', foot };
}

function composeReport(profile: Profile, rings: MetricRing[], primary: MetricTile, streak: number, walkDays: number, exDays: number): string {
  const lines: string[] = [
    `🪔 ${profile.name} की हफ़्तावार रिपोर्ट · ${profile.en}'s week`,
    '',
    ...rings.map((r) => `${r.hi} · ${r.en}: ${Math.round(r.pct * 100)}%`),
    '',
    `${primary.hi}: ${primary.val}${primary.unit} · सैर ${walkDays}/7 दिन · व्यायाम ${exDays}/7 दिन`,
    `🔥 लय ${streak} दिन`,
    '',
    'Saath 🪔',
  ];
  return lines.join('\n');
}

export default function Dash() {
  const app = useApp();
  const pid = app.profileId;
  const profileHistory = app.history;
  const dates7 = lastNDays(7);
  const today = app.today;
  const todayRec = profileHistory[today] ?? { done: [], meds: [], values: {} };

  // ---- rings (today) ----
  const planEx = app.plan.filter((n) => n.kind === 'exercise');
  const planMind = app.plan.filter((n) => n.kind === 'lesson' || n.kind === 'log');
  const dosesAll = medsByProfile[pid];

  const movePct = planEx.length ? planEx.filter((n) => todayRec.done.includes(n.id)).length / planEx.length : 0;
  const medsPct = dosesAll.length ? todayRec.meds.length / dosesAll.length : 0;
  const mindPct = planMind.length ? planMind.filter((n) => todayRec.done.includes(n.id)).length / planMind.length : 0;

  const rings: MetricRing[] = [
    { key: 'move', hi: 'हलचल', en: 'Move', pct: movePct, color: 'var(--coral)' },
    { key: 'meds', hi: 'दवाई', en: 'Meds', pct: medsPct, color: 'var(--gold)' },
    { key: 'mind', hi: 'मन', en: 'Calm', pct: mindPct, color: 'var(--mint)' },
  ];

  // ---- last-7-day rollups ----
  const exDays = dates7.filter((k) => {
    const r = profileHistory[k];
    return r ? planEx.some((n) => r.done.includes(n.id)) : false;
  }).length;
  const walkDays = dates7.filter((k) => profileHistory[k]?.done.includes('wk') ?? false).length;
  const medsLast7 = dates7.reduce((sum, k) => sum + (profileHistory[k]?.meds.length ?? 0), 0);
  const medsAdh = dosesAll.length ? Math.min(1, medsLast7 / (7 * dosesAll.length)) : 0;

  // ---- latest logged value (the 'lg' node is each profile's primary metric) ----
  const findLatest = (key: string): number | null => {
    for (let i = dates7.length - 1; i >= 0; i--) {
      const v = profileHistory[dates7[i]]?.values?.[key];
      if (typeof v === 'number') return v;
    }
    return null;
  };
  const latestLog = findLatest('lg');

  // ---- 7-day series for the chart ----
  const series7 = dates7.map((k) => profileHistory[k]?.values?.['lg'] ?? null);
  const hasAnyValue = series7.some((v) => v != null);
  const dayLabels = dates7.map((k) => HI_DAY[new Date(`${k}T00:00:00`).getDay()]);

  // ---- tiles (per profile) ----
  const streakTile: MetricTile = {
    icon: 'flame', color: 'var(--rose)', hi: 'लय', en: 'STREAK',
    val: String(app.streak), unit: 'दिन',
    foot: app.streak > 0 ? 'लगातार · in a row' : 'शुरू करें · start today',
  };
  const walkTile: MetricTile = {
    icon: 'foot', color: 'var(--mint)', hi: 'सैर', en: 'WALKS · 7d',
    val: String(walkDays), unit: 'दिन', foot: 'लक्ष्य 5/7 · target',
  };
  const exTile: MetricTile = {
    icon: 'activity', color: 'var(--peri)', hi: 'व्यायाम', en: 'EXERCISE · 7d',
    val: String(exDays), unit: 'दिन', foot: 'लक्ष्य 5/7 · target',
  };
  const primary = primaryTile(pid, latestLog);
  const tiles: MetricTile[] = [primary, walkTile, exTile, streakTile];

  const adherence: Adherence[] = [
    { hi: 'दवाई', en: 'Medicines', p: medsAdh, color: 'var(--gold-d)' },
    { hi: 'व्यायाम', en: 'Exercise', p: exDays / 7, color: 'var(--coral)' },
    { hi: 'सैर', en: 'Walking', p: walkDays / 7, color: 'var(--mint-d)' },
  ];

  // ---- summary stats ----
  const daysKept = Object.values(profileHistory).filter((r) =>
    r.done.length > 0 || r.meds.length > 0 || Object.keys(r.values).length > 0,
  ).length;

  const allLog = Object.keys(profileHistory)
    .sort()
    .map((k) => profileHistory[k]?.values?.['lg'])
    .filter((v): v is number => typeof v === 'number');
  const drop = allLog.length >= 2 ? Math.round(((allLog[0] - allLog[allLog.length - 1]) / allLog[0]) * 100) : 0;
  const dropLabel = drop > 0 ? `↓${drop}%` : drop < 0 ? `↑${-drop}%` : '—';
  const dropLabelHi = drop > 0 ? 'कम' : drop < 0 ? 'बढ़ा' : 'स्थिर';

  const chart = chartTitle(pid);
  const chartAccent = pid === 'papa' ? 'var(--coral)' : pid === 'mummy' ? 'var(--gold)' : 'var(--peri)';

  return (
    <div className="screen-body fade-in">
      <div style={{ padding: '4px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Bi hi="आपकी रिपोर्ट" en="YOUR REPORT · LAST 7 DAYS" hiSize={22} enSize={10} />
      </div>

      <div className="scroll" style={{ flex: 1, padding: '10px 18px 110px' }}>
        <JugnuSays line={lines.dash} size={84} sound={app.sound} />

        {/* rings hero */}
        <div className="clay rise" style={{ borderRadius: 28, padding: 16, marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Ring size={148} rings={rings} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {rings.map((r) => (
              <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 11, height: 11, borderRadius: 4, background: r.color }} />
                <span className="hi" style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>
                  {r.hi} <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>{r.en}</span>
                </span>
                <span className="hi" style={{ fontSize: 16, fontWeight: 800, color: r.color }}>{Math.round(r.pct * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* metric tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 12 }}>
          {tiles.map((t) => (
            <div key={t.en} className="clay" style={{ borderRadius: 22, padding: 13, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Chip icon={t.icon as IconName} color={t.color} size={34} r={11} />
              <Bi hi={t.hi} en={t.en} hiSize={13.5} enSize={8.5} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="hi" style={{ fontSize: 26, fontWeight: 800 }}>{t.val}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700 }}>{t.unit}</span>
              </div>
              <span style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 700 }}>{t.foot}</span>
            </div>
          ))}
        </div>

        {/* weekly chart */}
        <div className="clay" style={{ borderRadius: 28, padding: 16, marginTop: 12 }}>
          <Bi hi={chart.hi} en={chart.en} hiSize={14.5} enSize={9} />
          {hasAnyValue ? (
            <svg viewBox="0 0 300 96" width="100%" height="84" style={{ marginTop: 8 }}>
              {series7.map((v, i) => {
                const x = 16 + i * 40;
                if (v == null) {
                  return (
                    <text key={i} x={x + 11} y={94} fontSize="10" textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--font-display)" fontWeight="700">
                      {dayLabels[i]}
                    </text>
                  );
                }
                const h = Math.max(4, v * 8);
                return (
                  <g key={i}>
                    <rect x={x} y={86 - h} width="22" height={h} rx="7" fill={chartAccent} opacity={i === 6 ? 1 : 0.34} />
                    <text x={x + 11} y={94} fontSize="10" textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--font-display)" fontWeight="700">
                      {dayLabels[i]}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <p style={{ margin: '12px 0 4px', fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 700, textAlign: 'center' }}>
              जब आप रोज़ लॉग करेंगे — यहाँ हफ़्तावार रुझान दिखेगा।
            </p>
          )}

          <div style={{ height: 1, background: 'rgba(90,60,30,.1)', margin: '12px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {adherence.map((a) => (
              <div key={a.en} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="hi" style={{ width: 62, fontSize: 13.5, fontWeight: 700 }}>{a.hi}</span>
                <div className="inset" style={{ flex: 1, height: 13, borderRadius: 999, background: '#efe4d2', overflow: 'hidden' }}>
                  <div style={{ width: `${a.p * 100}%`, height: '100%', borderRadius: 999, background: a.color, transition: 'width 1s' }} />
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: a.color, width: 34, textAlign: 'right' }}>{Math.round(a.p * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 12 }}>
          <div className="glass" style={{ borderRadius: 20, padding: 14, textAlign: 'center' }}>
            <span className="hi" style={{ fontSize: 30, fontWeight: 800, color: 'var(--coral-d)' }}>{daysKept}</span>
            <Bi hi="दिन लगातार" en="DAYS KEPT UP" hiSize={12} enSize={8.5} align="center" />
          </div>
          <div className="glass" style={{ borderRadius: 20, padding: 14, textAlign: 'center' }}>
            <span className="hi" style={{ fontSize: 30, fontWeight: 800, color: drop > 0 ? 'var(--mint-d)' : drop < 0 ? 'var(--coral-d)' : 'var(--ink-3)' }}>{dropLabel}</span>
            <Bi hi={`${primary.hi} ${dropLabelHi}`} en={`${primary.en} ${drop !== 0 ? 'TREND' : 'STEADY'}`} hiSize={12} enSize={8.5} align="center" />
          </div>
        </div>

        {/* share */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            className="btn"
            style={{ flex: 1, background: app.profile.grad, color: '#fff', padding: 14, fontSize: 15 }}
            onClick={() => shareOnWhatsApp(composeReport(app.profile, rings, primary, app.streak, walkDays, exDays))}
          >
            <Icon name="heart" size={18} color="#fff" /> परिवार को भेजें
          </button>
        </div>
      </div>
    </div>
  );
}
