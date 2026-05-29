import { useState } from 'react';
import Icon from './Icon';
import Jugnu from './Jugnu';
import Sheet from './Sheet';
import { useApp } from '../context/AppContext';
import type { Node } from '../types';

export default function LogSheet({ node, onClose }: { node: Node; onClose: () => void }) {
  const app = useApp();
  const [val, setVal] = useState<number | null>(null);
  const isConfirm = node.id === 'wk' || node.confirm;

  if (isConfirm) {
    const q = node.id === 'wk'
      ? ['आज की सैर हो गई?', 'Done with today’s walk?']
      : [`${node.hi} — हो गया?`, `${node.en} — done?`];
    return (
      <Sheet onClose={onClose}>
        <div style={{ textAlign: 'center' }}>
          <Jugnu size={80} mood="happy" />
          <h2 className="hi" style={{ fontSize: 23, margin: '4px 0 2px' }}>{q[0]}</h2>
          <p style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 700, margin: 0 }}>{q[1]}</p>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 18, background: app.profile.grad }} onClick={() => app.finish(node.id)}>
          <Icon name="check" size={20} sw={2.8} color="#fff" /> हाँ, हो गया
        </button>
      </Sheet>
    );
  }

  const label = node.id === 'sugar'
    ? ['शुगर कैसा रहा?', 'Blood sugar level?']
    : node.id === 'weight'
      ? ['आज वज़न कितना लगा?', 'How’s your weight today?']
      : app.profile.id === 'mummy'
        ? ['बीपी कैसा रहा?', 'How was your BP?']
        : app.profile.id === 'chunnu'
          ? ['आज मूड कैसा है?', 'How’s your mood today?']
          : ['आज दर्द कैसा है?', 'How is the pain today?'];

  return (
    <Sheet onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <h2 className="hi" style={{ fontSize: 23, margin: '2px 0' }}>{label[0]}</h2>
        <p style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 700, margin: 0 }}>{label[1]}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 9, marginTop: 14 }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const n = i + 1;
          const on = val === n;
          const c = n <= 3 ? 'var(--mint)' : n <= 6 ? 'var(--gold)' : 'var(--coral)';
          return (
            <button
              key={n}
              onClick={() => setVal(n)}
              className={on ? '' : 'glass'}
              style={{ aspectRatio: '1', border: on ? 'none' : '1px solid rgba(255,255,255,.7)', borderRadius: 16, background: on ? c : undefined, color: on ? '#fff' : 'var(--ink)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, boxShadow: on ? `0 8px 16px -7px ${c}` : 'none', transition: '.15s' }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px 0', fontSize: 11, fontWeight: 800, color: 'var(--ink-3)' }}>
        <span className="hi">कम · low</span>
        <span className="hi">ज़्यादा · high</span>
      </div>
      <button className="btn btn-primary" style={{ width: '100%', marginTop: 16, opacity: val ? 1 : 0.5, background: app.profile.grad }} disabled={!val} onClick={() => app.finish(node.id)}>
        नोट कर लें · Save
      </button>
    </Sheet>
  );
}
