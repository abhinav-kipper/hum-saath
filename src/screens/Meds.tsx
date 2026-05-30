import Icon from '../components/Icon';
import Jugnu from '../components/Jugnu';
import JugnuSays from '../components/JugnuSays';
import Bi from '../components/Bi';
import Chip from '../components/Chip';
import { useApp } from '../context/AppContext';
import { medsByProfile, lines } from '../data/content';

export default function Meds() {
  const { sound, takeMed, medsTaken, profile } = useApp();
  const R = 100;
  const cx = 130;
  const cy = 130;
  const pos = (a: number, r: number): [number, number] => [
    cx + r * Math.cos((a * Math.PI) / 180),
    cy + r * Math.sin((a * Math.PI) / 180),
  ];
  // mark `taken` from today's history; the first untaken dose is `next`
  let foundNext = false;
  const doses = medsByProfile[profile.id].map((d) => {
    const taken = medsTaken.has(d.id);
    const isNext = !taken && !foundNext;
    if (isNext) foundNext = true;
    return { ...d, taken, next: isNext };
  });
  const next = doses.find((d) => d.next);
  const takenCount = doses.filter((d) => d.taken).length;

  return (
    <div className="screen-body fade-in">
      <div style={{ padding: '4px 22px 0' }}>
        <Bi hi="दिन की दवाइयाँ" en="TODAY’S DOSES · DAY CLOCK" hiSize={23} enSize={10.5} />
      </div>
      <div className="scroll" style={{ flex: 1, padding: '8px 18px 110px' }}>
        {/* dial */}
        <div style={{ position: 'relative', width: 260, height: 260, margin: '6px auto 0' }}>
          <svg viewBox="0 0 260 260" width="260" height="260">
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="#efe4d2" strokeWidth="20" />
            <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="#f7dd9a" strokeWidth="20" strokeLinecap="round" opacity=".5" />
            {doses.map((d) => {
              const [x, y] = pos(d.ang, R);
              return (
                <g key={d.id}>
                  <circle cx={x} cy={y} r="17" fill={d.taken ? d.color : '#fffaf2'} stroke={d.color} strokeWidth="3.5" />
                  {d.taken ? (
                    <path d={`M${x - 6} ${y} l4 4 8 -8`} stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  ) : d.next ? (
                    <circle cx={x} cy={y} r="5" fill={d.color} />
                  ) : null}
                </g>
              );
            })}
          </svg>
          <div style={{ position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)', color: 'var(--gold-d)' }}>
            <Icon name="sun" size={20} />
          </div>
          <div style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', color: 'var(--peri-d)' }}>
            <Icon name="moon" size={17} />
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Jugnu size={70} mood="idle" />
              <p className="hi" style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--ink-2)' }}>{takenCount} / {doses.length} हो गईं</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <JugnuSays line={next ? lines.meds : lines.medsTaken} size={64} sound={sound} />
        </div>

        {next && (
          <div className="clay rise" style={{ marginTop: 14, padding: 14, borderRadius: 22, display: 'flex', alignItems: 'center', gap: 13 }}>
            <Chip icon="pill" color={next.color} size={52} />
            <div style={{ flex: 1 }}>
              <Bi hi={`अगली: ${next.hi}`} en={`${next.time} · ${next.sub}`} hiSize={16.5} enSize={10.5} />
            </div>
          </div>
        )}
        {next && (
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={() => takeMed(next.id)}>
            <Icon name="check" size={20} sw={2.8} color="#fff" /> ले ली — टैप करें
          </button>
        )}

        <div style={{ marginTop: 18 }}>
          <Bi hi="आज का शेड्यूल" en="TODAY’S SCHEDULE" hiSize={15} enSize={9.5} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 10 }}>
            {doses.map((d) => (
              <div key={d.id} className="glass" style={{ borderRadius: 18, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 11, opacity: d.taken ? 0.6 : 1 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: d.color }} />
                <div style={{ flex: 1 }}>
                  <Bi hi={d.hi} en={`${d.en} · ${d.sub}`} hiSize={15} enSize={10} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-3)' }}>{d.time}</span>
                {d.taken && <Icon name="check" size={17} sw={3} color="var(--mint-d)" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
