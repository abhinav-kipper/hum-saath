import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import Icon from '../components/Icon';
import Jugnu from '../components/Jugnu';
import JugnuSays from '../components/JugnuSays';
import Bi from '../components/Bi';
import Chip from '../components/Chip';
import Sheet from '../components/Sheet';
import { useApp } from '../context/AppContext';
import { lines, metrics, taskPool } from '../data/content';
import type { Node } from '../types';

/* connector segment in the bead column */
function Seg({ pos, lit }: { pos: 'top' | 'bot'; lit: boolean }) {
  const common: CSSProperties = { position: 'absolute', left: '50%', transform: 'translateX(-50%)', borderRadius: 3 };
  const fill: CSSProperties = lit
    ? { background: 'linear-gradient(var(--gold),var(--gold-d))', width: 5 }
    : { background: 'transparent', borderLeft: '4px dotted #e3d6c2', width: 0 };
  return <div style={{ ...common, ...fill, top: pos === 'top' ? -3 : '50%', bottom: pos === 'bot' ? -3 : '50%' }} />;
}

function Bead({ n, isDone, isCur, accent }: { n: Node; isDone: boolean; isCur: boolean; accent: string }) {
  return (
    <div style={{ position: 'relative', width: 48, height: 48, zIndex: 1 }}>
      {isCur && (
        <div
          className="host-glow"
          style={{ position: 'absolute', inset: -10, borderRadius: 999, background: `radial-gradient(circle, ${accent}, transparent 70%)`, opacity: 0.45 }}
        />
      )}
      <div
        style={{
          position: 'relative', width: 48, height: 48, borderRadius: 999,
          background: isDone ? 'linear-gradient(160deg,#f6c97a,#d99a3e)' : isCur ? accent : '#fffaf2',
          color: isDone || isCur ? '#fff' : 'var(--ink-3)',
          display: 'grid', placeItems: 'center',
          border: isDone || isCur ? 'none' : '2px solid #e7dbc6',
          boxShadow: isDone || isCur ? '0 8px 16px -8px rgba(90,60,30,.6)' : '0 4px 10px -8px rgba(90,60,30,.4)',
        }}
      >
        {isDone ? <Icon name="check" size={22} sw={3} color="#fff" /> : <Icon name={n.icon} size={22} sw={2.2} />}
        {isCur && (
          <span style={{ position: 'absolute', top: -26, right: -20 }}>
            <Jugnu size={44} mood="happy" />
          </span>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const app = useApp();
  const { profile, plan, done, sound, nav, setProfileOpen } = app;
  const [edit, setEdit] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const curIdx = plan.findIndex((n) => !done.has(n.id));
  const allDone = curIdx === -1;
  const line = allDone ? lines.home_alldone : lines.home;

  return (
    <div className="screen-body fade-in">
      {/* header */}
      <div style={{ padding: '4px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setProfileOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 999, background: profile.grad, display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 6px 14px -7px rgba(90,60,30,.6)' }}>
            <Icon name="user" size={22} />
          </div>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.05 }}>
            <span className="hi" style={{ fontSize: 21, fontWeight: 800 }}>
              {profile.name} <Icon name="chevR" size={14} sw={3} style={{ transform: 'rotate(90deg)', verticalAlign: 'middle', opacity: 0.4 }} />
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--ink-3)', letterSpacing: '.04em' }}>मंगलवार · 29 MAY</span>
          </span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!edit && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--coral-d)', fontWeight: 800, fontSize: 16 }}>
              <Icon name="flame" size={20} color="var(--coral)" fill="var(--coral)" />
              {metrics.streak}
            </div>
          )}
          <button
            onClick={() => setEdit((e) => !e)}
            aria-label="Curate day"
            style={{
              width: 40, height: 40, borderRadius: 999, display: 'grid', placeItems: 'center',
              background: edit ? profile.accent : 'var(--surface)', color: edit ? '#fff' : 'var(--ink-2)',
              boxShadow: '0 6px 14px -8px rgba(90,60,30,.5)',
            }}
          >
            <Icon name={edit ? 'check' : 'edit'} size={19} sw={2.4} />
          </button>
        </div>
      </div>

      {edit ? (
        <>
          <div className="scroll" style={{ flex: 1, padding: '14px 18px 8px' }}>
            <div className="bubble" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Jugnu size={48} />
              <div>
                <p className="cap-hi" style={{ fontSize: 15 }}>अपना दिन ख़ुद बनाइए — खींचकर क्रम बदलिए।</p>
                <p className="cap-en">Drag to reorder · tap − to remove</p>
              </div>
            </div>
            <DragList items={plan} accent={profile.accent} onReorder={app.setPlanOrder} onRemove={app.removeNode} />
            <button
              onClick={() => setAddOpen(true)}
              className="glass"
              style={{ width: '100%', marginTop: 12, border: `2px dashed ${profile.accent}`, background: 'rgba(255,250,242,.5)', borderRadius: 20, padding: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, color: profile.accentD, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}
            >
              <Icon name="plus" size={20} sw={2.6} color={profile.accentD} /> काम जोड़ें · Add a task
            </button>
          </div>
          <div style={{ padding: '0 18px 96px' }}>
            <button className="btn btn-primary" style={{ width: '100%', background: profile.grad }} onClick={() => setEdit(false)}>
              <Icon name="check" size={20} sw={2.8} color="#fff" /> हो गया · Done
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="scroll" style={{ flex: 1, padding: '14px 18px 8px' }}>
            <JugnuSays line={line} size={96} sound={sound} />

            <div style={{ marginTop: 18 }}>
              {plan.map((n, i) => {
                const isDone = done.has(n.id);
                const isCur = i === curIdx;
                const last = i === plan.length - 1;
                return (
                  <div key={n.id} style={{ display: 'flex', gap: 14, minHeight: 82, marginBottom: last ? 0 : 6 }}>
                    <div style={{ position: 'relative', width: 48, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {i > 0 && <Seg pos="top" lit={i <= curIdx} />}
                      {!last && <Seg pos="bot" lit={i < curIdx} />}
                      <Bead n={n} isDone={isDone} isCur={isCur} accent={profile.accent} />
                    </div>
                    <button
                      onClick={() => nav(n.kind, n)}
                      disabled={isDone}
                      className={isCur ? 'clay' : 'glass'}
                      style={{
                        flex: 1, textAlign: 'left', cursor: isDone ? 'default' : 'pointer',
                        borderRadius: 20, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 10,
                        opacity: isDone ? 0.6 : 1,
                        outline: isCur ? `2px solid ${profile.accent}` : 'none', outlineOffset: 2,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Bi hi={n.hi} en={n.en} hiSize={16} enSize={10.5} />
                      </div>
                      {isDone ? (
                        <span className="pill" style={{ background: 'rgba(127,201,166,.22)', color: 'var(--mint-d)', fontSize: 11, padding: '5px 10px', flex: '0 0 auto' }}>हो गया ✓</span>
                      ) : isCur ? (
                        <span className="pill" style={{ background: profile.accent, color: '#fff', fontSize: 11, padding: '5px 11px', flex: '0 0 auto' }}>अभी · now</span>
                      ) : (
                        <Icon name="chevR" size={18} sw={2.4} color="var(--ink-3)" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, padding: '0 18px 96px', alignItems: 'center' }}>
            {!allDone ? (
              <button className="btn btn-primary" style={{ flex: 1, background: profile.grad }} onClick={() => nav(plan[curIdx].kind, plan[curIdx])}>
                चलिए, शुरू करें <Icon name="chevR" size={20} sw={2.8} color="#fff" />
              </button>
            ) : (
              <div className="clay" style={{ flex: 1, borderRadius: 999, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Jugnu size={40} mood="happy" />
                <Bi hi="आज की राह पूरी! 🌼" en="All done today" hiSize={15} enSize={10} />
              </div>
            )}
            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => nav('chat')}
                aria-label="Talk to Jugnu"
                style={{ width: 60, height: 60, borderRadius: 999, background: 'rgba(255,250,242,.8)', boxShadow: '0 12px 26px -10px rgba(236,170,60,.8), 0 0 0 1px rgba(255,255,255,.6) inset', display: 'grid', placeItems: 'center' }}
              >
                <Jugnu size={48} mood="idle" />
              </button>
              <span className="hi" style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--ink-2)' }}>जुगनू से बात</span>
            </div>
          </div>
        </>
      )}

      {addOpen && <AddTaskSheet onClose={() => setAddOpen(false)} />}
    </div>
  );
}

/* ---- draggable, removable task list ---- */
function DragList({
  items,
  onReorder,
  onRemove,
  accent,
}: {
  items: Node[];
  onReorder: (arr: Node[]) => void;
  onRemove: (id: string) => void;
  accent: string;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dy, setDy] = useState(0);
  const startY = useRef(0);
  const startIdx = useRef(0);
  const live = useRef(items);
  live.current = items;
  const H = 70; // row(60) + gap(10)

  const down = (e: PointerEvent<HTMLDivElement>, id: string, idx: number) => {
    setDragId(id);
    startY.current = e.clientY;
    startIdx.current = idx;
    setDy(0);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (dragId == null) return;
    const delta = e.clientY - startY.current;
    setDy(delta);
    const from = live.current.findIndex((i) => i.id === dragId);
    let to = Math.round((startIdx.current * H + delta) / H);
    to = Math.max(0, Math.min(items.length - 1, to));
    if (to !== from && from !== -1) {
      const arr = live.current.slice();
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      onReorder(arr);
      startIdx.current = to;
      startY.current = e.clientY;
      setDy(0);
    }
  };
  const up = () => {
    setDragId(null);
    setDy(0);
  };

  return (
    <div onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((n, idx) => {
        const dragging = dragId === n.id;
        return (
          <div
            key={n.id}
            className={dragging ? 'clay' : 'glass'}
            style={{
              height: 60, borderRadius: 18, padding: '0 12px 0 8px', display: 'flex', alignItems: 'center', gap: 10,
              transform: dragging ? `translateY(${dy}px) scale(1.03)` : 'none',
              zIndex: dragging ? 9 : 1, position: 'relative',
              boxShadow: dragging ? '0 18px 36px -14px rgba(90,60,30,.5)' : undefined,
              transition: dragging ? 'none' : 'transform .18s',
            }}
          >
            <div onPointerDown={(e) => down(e, n.id, idx)} style={{ cursor: 'grab', padding: '10px 6px', touchAction: 'none', color: 'var(--ink-3)' }}>
              <Icon name="grip" size={20} sw={2} />
            </div>
            <Chip icon={n.icon} color={accent} size={38} r={12} />
            <span className="hi" style={{ flex: 1, minWidth: 0, fontSize: 15.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.hi}</span>
            <button
              onClick={() => onRemove(n.id)}
              aria-label="Remove"
              style={{ width: 30, height: 30, borderRadius: 999, background: 'rgba(216,90,60,.12)', color: 'var(--coral-d)', display: 'grid', placeItems: 'center', flex: '0 0 auto' }}
            >
              <Icon name="minus" size={18} sw={3} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function AddTaskSheet({ onClose }: { onClose: () => void }) {
  const app = useApp();
  const have = new Set(app.plan.map((n) => n.baseId || n.id));
  const pool = taskPool.filter((t) => !have.has(t.id));
  return (
    <Sheet onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h2 className="hi" style={{ fontSize: 22, margin: '2px 0' }}>क्या जोड़ें?</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700, margin: 0 }}>Add to {app.profile.name}’s day</p>
      </div>
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column', gap: 9, maxHeight: 340 }}>
        {pool.length === 0 && <p className="hi" style={{ textAlign: 'center', color: 'var(--ink-3)', fontWeight: 700 }}>सब जुड़ चुका है ✓</p>}
        {pool.map((t) => (
          <button
            key={t.id}
            onClick={() => { app.addNode(t); onClose(); }}
            className="glass"
            style={{ borderRadius: 18, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}
          >
            <Chip icon={t.icon} color={app.profile.accent} size={42} />
            <div style={{ flex: 1 }}>
              <Bi hi={t.hi} en={t.en} hiSize={15.5} enSize={10} />
            </div>
            <Icon name="plus" size={20} sw={2.6} color={app.profile.accentD} />
          </button>
        ))}
      </div>
    </Sheet>
  );
}
