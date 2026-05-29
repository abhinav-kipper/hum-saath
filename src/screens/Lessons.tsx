import { useState } from 'react';
import Icon from '../components/Icon';
import Bi from '../components/Bi';
import Chip from '../components/Chip';
import JugnuSays from '../components/JugnuSays';
import { useApp } from '../context/AppContext';
import { lessons, lines } from '../data/content';

export default function Lessons() {
  const app = useApp();
  const [active, setActive] = useState(lessons[0]);

  return (
    <div className="screen-body fade-in">
      <div style={{ padding: '4px 22px 0' }}>
        <Bi hi="आज की सीख" en="LEARN · 2-MIN HABITS" hiSize={23} enSize={10.5} />
      </div>
      <div className="scroll" style={{ flex: 1, padding: '10px 18px 110px' }}>
        <JugnuSays line={lines.lesson} size={84} sound={app.sound} />

        {/* featured */}
        <div className="clay rise" style={{ borderRadius: 28, padding: 18, marginTop: 14 }}>
          <span className="pill" style={{ background: 'rgba(246,178,92,.2)', color: 'var(--gold-d)', fontSize: 11 }}>{active.tag} · {active.mins} मिनट</span>
          <h2 className="hi" style={{ fontSize: 23, fontWeight: 700, margin: '12px 0 4px', lineHeight: 1.2 }}>{active.hi}</h2>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', margin: 0 }}>{active.en}</p>
          <div className="inset" style={{ borderRadius: 18, padding: 16, marginTop: 14, background: '#fffaf2' }}>
            <p className="hi" style={{ fontSize: 16.5, lineHeight: 1.5, margin: 0 }}>{active.body}</p>
            <p style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--ink-3)', margin: '8px 0 0', fontWeight: 600 }}>{active.bodyEn}</p>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 14, background: app.profile.grad }} onClick={() => app.finish(app.activeNode?.id || 'ls')}>
            <Icon name="check" size={19} sw={2.8} color="#fff" /> समझ गया · पूरा
          </button>
        </div>

        {/* more */}
        <div style={{ marginTop: 18 }}>
          <Bi hi="और सीखें" en="MORE LESSONS" hiSize={15} enSize={9.5} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {lessons.map((l) => (
              <button
                key={l.id}
                onClick={() => setActive(l)}
                className="glass"
                style={{ border: active.id === l.id ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,.75)', textAlign: 'left', borderRadius: 18, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <Chip icon="book" color="var(--gold)" size={42} />
                <div style={{ flex: 1 }}>
                  <Bi hi={l.hi} en={`${l.tag} · ${l.mins} min`} hiSize={15} enSize={10} />
                </div>
                <Icon name="chevR" size={18} sw={2.4} color="var(--ink-3)" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
