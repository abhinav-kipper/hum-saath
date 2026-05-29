import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import Jugnu from '../components/Jugnu';
import Bi from '../components/Bi';
import { speak, useTypewriter } from '../lib/voice';
import { useApp } from '../context/AppContext';
import { chat, lines } from '../data/content';
import type { ChatItem } from '../types';

interface Message { who: 'j' | 'u'; hi: string; en?: string; fresh?: boolean }

function Msg({ m }: { m: Message }) {
  const isJ = m.who === 'j';
  const [hi, done] = useTypewriter(m.hi, !!m.fresh, 18);
  if (isJ) {
    return (
      <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '86%' }}>
        <Jugnu size={40} mood={done ? 'idle' : 'happy'} />
        <div className="bubble">
          <p className="cap-hi" style={{ fontSize: 15.5 }}>
            {hi}
            {!done && <span className="cursor" />}
          </p>
          {done && m.en && <p className="cap-en">{m.en}</p>}
        </div>
      </div>
    );
  }
  return (
    <div style={{ alignSelf: 'flex-end', maxWidth: '82%', background: 'var(--surface)', borderRadius: '22px 22px 6px 22px', padding: '12px 16px', boxShadow: '0 10px 22px -14px rgba(90,60,30,.5)' }}>
      <p className="hi" style={{ margin: 0, fontSize: 15.5, fontWeight: 600 }}>{m.hi}</p>
    </div>
  );
}

export default function Chat() {
  const app = useApp();
  const [msgs, setMsgs] = useState<Message[]>([{ who: 'j', ...lines.chatGreet }]);
  const [typing, setTyping] = useState(false);
  const [used, setUsed] = useState<string[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [msgs, typing]);

  const ask = (item: ChatItem) => {
    if (typing) return;
    setUsed((u) => [...u, item.q]);
    setMsgs((mm) => [...mm, { who: 'u', hi: item.q, en: item.qEn }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((mm) => [...mm, { who: 'j', hi: item.a, en: item.aEn, fresh: true }]);
      speak(item.a, app.sound);
    }, 1100);
  };
  const remaining = chat.filter((c) => !used.includes(c.q));

  return (
    <div className="screen-body fade-in" style={{ background: 'radial-gradient(90% 50% at 50% 0%, #fff3d6, transparent 60%)' }}>
      <div style={{ padding: '2px 18px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost" style={{ padding: 10, borderRadius: 999 }} onClick={() => app.nav('home')} aria-label="Back">
          <Icon name="chevL" size={20} sw={2.6} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Jugnu size={46} mood={typing ? 'happy' : 'idle'} />
          <Bi hi="जुगनू" en="YOUR COMPANION · ONLINE" hiSize={18} enSize={9.5} />
        </div>
      </div>

      <div className="scroll" ref={scroller} style={{ flex: 1, padding: '8px 18px 8px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {msgs.map((m, i) => <Msg key={i} m={m} />)}
        {typing && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Jugnu size={40} mood="happy" />
            <div className="bubble" style={{ padding: '12px 16px' }}>
              <div className="wave"><i /><i /><i /><i /><i /></div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '4px 16px 18px' }}>
        <div className="scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          {remaining.map((c) => (
            <button key={c.q} onClick={() => ask(c)} className="glass" style={{ flex: '0 0 auto', borderRadius: 999, padding: '9px 15px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)' }}>
              {c.q}
            </button>
          ))}
        </div>
        <div className="clay" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px 9px 16px', borderRadius: 999, marginTop: 4 }}>
          <span className="hi" style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--ink-3)' }}>जुगनू से बोलिए…</span>
          <div className="btn" style={{ width: 44, height: 44, background: app.profile.grad }}>
            <Icon name="mic" size={21} color="#fff" />
          </div>
        </div>
      </div>
    </div>
  );
}
