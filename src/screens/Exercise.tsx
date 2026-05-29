import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import Jugnu from '../components/Jugnu';
import BodyFigure from '../components/BodyFigure';
import Bi from '../components/Bi';
import { useApp } from '../context/AppContext';
import { exercise as ex } from '../data/content';

function PauseIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden>
      <rect x="6" y="5" width="4.5" height="14" rx="2" fill="#fff" />
      <rect x="13.5" y="5" width="4.5" height="14" rx="2" fill="#fff" />
    </svg>
  );
}

/* YouTube embed — real iframe when a videoId is set, else a placeholder. */
function VideoCard({ id, accent, title }: { id: string; accent: string; title: string }) {
  const [play, setPlay] = useState(false);
  const valid = !!id && id !== 'REPLACE_ME';
  if (play && valid) {
    return (
      <div className="clay" style={{ borderRadius: 26, overflow: 'hidden', height: 380 }}>
        <iframe
          width="100%"
          height="100%"
          style={{ border: 'none', display: 'block' }}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <div className="clay" style={{ borderRadius: 26, overflow: 'hidden', height: 380, position: 'relative' }}>
      {valid ? (
        <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(135deg, #f3ead6 0 14px, #efe2c9 14px 28px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 24px 22px', textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11.5, color: '#8a7a60', margin: 0, lineHeight: 1.6 }}>
            एक्सरसाइज़ वीडियो
            <br />
            drop an unlisted YouTube&nbsp;ID in <code>exercise.videoId</code>
          </p>
        </div>
      )}
      <button
        onClick={() => valid && setPlay(true)}
        aria-label="Play video"
        style={{
          position: 'absolute', inset: 0, margin: 'auto', width: 78, height: 78, borderRadius: 999,
          cursor: valid ? 'pointer' : 'default', background: valid ? 'rgba(236,138,78,.95)' : 'rgba(255,250,242,.85)',
          display: 'grid', placeItems: 'center', boxShadow: '0 14px 30px -10px rgba(90,60,30,.6)',
        }}
      >
        <Icon name="play" size={32} color={valid ? '#fff' : accent} fill={valid ? '#fff' : accent} />
      </button>
    </div>
  );
}

export default function Exercise() {
  const app = useApp();
  const accent = app.profile.accent;
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<'coach' | 'video'>('coach');
  const [left, setLeft] = useState(ex.steps[0].secs);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const step = ex.steps[idx];
  const total = ex.steps.length;

  useEffect(() => {
    setLeft(step.secs);
  }, [idx, step.secs]);

  useEffect(() => {
    if (!playing) {
      if (tick.current) clearInterval(tick.current);
      return;
    }
    tick.current = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          if (idx < total - 1) {
            setIdx((i) => i + 1);
            return ex.steps[idx + 1].secs;
          }
          if (tick.current) clearInterval(tick.current);
          setPlaying(false);
          setTimeout(() => app.finish(app.activeNode?.id || 'ex'), 400);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [playing, idx, total, app]);

  const ringPct = 1 - left / step.secs;
  const r = 66;
  const C = 2 * Math.PI * r;

  return (
    <div className="screen-body fade-in">
      <div style={{ padding: '4px 22px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost" style={{ padding: 11, borderRadius: 999 }} onClick={() => app.nav('home')} aria-label="Back">
          <Icon name="chevL" size={20} sw={2.6} />
        </button>
        <Bi hi={ex.title} en={`${ex.titleEn.toUpperCase()} · ${idx + 1}/${total}`} hiSize={19} enSize={10} />
      </div>

      {/* progress segments */}
      <div style={{ display: 'flex', gap: 5, padding: '12px 22px 0' }}>
        {ex.steps.map((_, i) => (
          <div key={i} className="inset" style={{ flex: 1, height: 6, borderRadius: 999, background: '#efe4d2', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 999, background: accent, width: i < idx ? '100%' : i === idx ? `${ringPct * 100}%` : '0%', transition: 'width 1s linear' }} />
          </div>
        ))}
      </div>

      {/* coach / video toggle */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 22px 0' }}>
        {([['coach', 'साथ-साथ', 'Coach'], ['video', 'वीडियो', 'Video']] as const).map(([m, hi, en]) => (
          <button
            key={m}
            onClick={() => { setMode(m); setPlaying(false); }}
            className={mode === m ? 'clay' : ''}
            style={{ flex: 1, borderRadius: 14, padding: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: mode === m ? 'var(--surface)' : 'rgba(255,250,242,.4)', color: mode === m ? app.profile.accentD : 'var(--ink-3)' }}
          >
            <Icon name={m === 'coach' ? 'activity' : 'video'} size={17} sw={2.3} />
            <span className="hi" style={{ fontWeight: 700, fontSize: 14 }}>
              {hi} <span style={{ fontSize: 9, opacity: 0.7 }}>{en}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="scroll" style={{ flex: 1, padding: '12px 18px 110px' }}>
        {mode === 'video' ? (
          <VideoCard id={ex.videoId} accent={accent} title={ex.title} />
        ) : (
          <div className="clay" style={{ borderRadius: 30, position: 'relative', overflow: 'hidden', height: 380, background: 'radial-gradient(70% 55% at 50% 22%, #fff4e0, #f7ead4)' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <BodyFigure region={step.region} accent={accent} />
            </div>
            <svg viewBox="0 0 160 160" width="116" height="116" style={{ position: 'absolute', top: 14, right: 14 }}>
              <circle cx="80" cy="80" r={r} fill="rgba(255,250,242,.7)" />
              <g transform="rotate(-90 80 80)">
                <circle cx="80" cy="80" r={r} fill="none" stroke={accent} strokeOpacity=".18" strokeWidth="10" />
                <circle cx="80" cy="80" r={r} fill="none" stroke={accent} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${C * ringPct} ${C}`} style={{ transition: 'stroke-dasharray 1s linear' }} />
              </g>
              <text x="80" y="92" fontSize="40" fontWeight="800" textAnchor="middle" fill={app.profile.accentD} fontFamily="var(--font-display)">{left}</text>
            </svg>
            <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
              <div className="bubble" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Jugnu size={48} mood={playing ? 'happy' : 'idle'} />
                <div>
                  <p className="cap-hi" style={{ fontSize: 15.5 }}>{step.hi}</p>
                  <p className="cap-en">{step.en}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {mode === 'coach' && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 92, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <button className="btn" style={{ width: 54, height: 54, background: 'var(--surface)', color: 'var(--ink-2)', boxShadow: '0 8px 18px -10px rgba(90,60,30,.5)' }} onClick={() => setIdx((i) => Math.max(0, i - 1))} aria-label="Previous">
            <Icon name="chevL" size={22} sw={2.6} />
          </button>
          <button className="btn" style={{ width: 78, height: 78, background: app.profile.grad, boxShadow: '0 14px 26px -8px rgba(236,138,78,.7)' }} onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <PauseIcon /> : <Icon name="play" size={32} color="#fff" fill="#fff" />}
          </button>
          <button className="btn" style={{ width: 54, height: 54, background: 'var(--surface)', color: 'var(--ink-2)', boxShadow: '0 8px 18px -10px rgba(90,60,30,.5)' }} onClick={() => (idx < total - 1 ? setIdx((i) => i + 1) : app.finish(app.activeNode?.id || 'ex'))} aria-label="Next">
            <Icon name="chevR" size={22} sw={2.6} />
          </button>
        </div>
      )}
    </div>
  );
}
