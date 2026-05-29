import Icon from '../components/Icon';
import Ring from '../components/Ring';
import Bi from '../components/Bi';
import Chip from '../components/Chip';
import JugnuSays from '../components/JugnuSays';
import { useApp } from '../context/AppContext';
import { metrics as m, lines } from '../data/content';

export default function Dash() {
  const app = useApp();
  return (
    <div className="screen-body fade-in">
      <div style={{ padding: '4px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Bi hi="आपकी रिपोर्ट" en="WEEKLY REPORT · 23–29 MAY" hiSize={22} enSize={10} />
      </div>

      <div className="scroll" style={{ flex: 1, padding: '10px 18px 110px' }}>
        <JugnuSays line={lines.dash} size={84} sound={app.sound} />

        {/* rings hero */}
        <div className="clay rise" style={{ borderRadius: 28, padding: 16, marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Ring size={148} rings={m.rings} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {m.rings.map((r) => (
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
          {m.tiles.map((t) => (
            <div key={t.en} className="clay" style={{ borderRadius: 22, padding: 13, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Chip icon={t.icon} color={t.color} size={34} r={11} />
              <Bi hi={t.hi} en={t.en} hiSize={13.5} enSize={8.5} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="hi" style={{ fontSize: 26, fontWeight: 800 }}>{t.val}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700 }}>{t.unit}</span>
              </div>
              <span style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 700 }}>{t.foot}</span>
            </div>
          ))}
        </div>

        {/* weekly report card */}
        <div className="clay" style={{ borderRadius: 28, padding: 16, marginTop: 12 }}>
          <Bi hi="रक्तचाप — रोज़" en="BLOOD PRESSURE · DAILY" hiSize={14.5} enSize={9} />
          <svg viewBox="0 0 300 96" width="100%" height="84" style={{ marginTop: 8 }}>
            {m.bp.map((v, i) => {
              const h = (v - 100) * 1.9;
              const x = 16 + i * 40;
              return (
                <g key={i}>
                  <rect x={x} y={86 - h} width="22" height={h} rx="7" fill="var(--coral)" opacity={i === 6 ? 1 : 0.34} />
                  <text x={x + 11} y={94} fontSize="10" textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--font-display)" fontWeight="700">{m.bpDays[i]}</text>
                </g>
              );
            })}
          </svg>
          <div style={{ height: 1, background: 'rgba(90,60,30,.1)', margin: '12px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {m.adherence.map((a) => (
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
            <span className="hi" style={{ fontSize: 30, fontWeight: 800, color: 'var(--coral-d)' }}>{m.daysKept}</span>
            <Bi hi="दिन लगातार" en="DAYS KEPT UP" hiSize={12} enSize={8.5} align="center" />
          </div>
          <div className="glass" style={{ borderRadius: 20, padding: 14, textAlign: 'center' }}>
            <span className="hi" style={{ fontSize: 30, fontWeight: 800, color: 'var(--mint-d)' }}>↓{m.painDrop}%</span>
            <Bi hi="दर्द कम" en="LESS PAIN" hiSize={12} enSize={8.5} align="center" />
          </div>
        </div>

        {/* share */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button className="btn" style={{ flex: 1, background: app.profile.grad, color: '#fff', padding: 14, fontSize: 15 }}>
            <Icon name="heart" size={18} color="#fff" /> परिवार को भेजें
          </button>
          <button className="btn btn-ghost" style={{ padding: '14px 20px', fontSize: 15 }}>PDF</button>
        </div>
      </div>
    </div>
  );
}
