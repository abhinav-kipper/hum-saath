import { useEffect, useRef, type ComponentType } from 'react';
import Icon from './Icon';
import Jugnu from './Jugnu';
import TabBar from './TabBar';
import AmbientJugnu from './AmbientJugnu';
import Confetti from './Confetti';
import LogSheet from './LogSheet';
import ProfileSheet from './ProfileSheet';
import Onboarding from '../screens/Onboarding';
import Home from '../screens/Home';
import Meds from '../screens/Meds';
import Exercise from '../screens/Exercise';
import Dash from '../screens/Dash';
import Lessons from '../screens/Lessons';
import Chat from '../screens/Chat';
import { useApp, type Route } from '../context/AppContext';

const SCREENS: Record<Route, ComponentType> = {
  home: Home, meds: Meds, exercise: Exercise, dash: Dash, lessons: Lessons, chat: Chat,
};

const TAB_ROUTES: Route[] = ['home', 'exercise', 'meds', 'dash', 'lessons'];

export default function AppShell() {
  const app = useApp();
  const routeRef = useRef(app.route);
  routeRef.current = app.route;
  const navRef = useRef(app.nav);
  navRef.current = app.nav;

  // Native horizontal swipe between tab routes (not on Chat).
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      startX = e.clientX;
      startY = e.clientY;
      tracking = true;
    };
    const onUp = (e: PointerEvent) => {
      if (!tracking) return;
      tracking = false;
      const r = routeRef.current;
      if (r === 'chat') return;
      const idx = TAB_ROUTES.indexOf(r);
      if (idx === -1) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const next = dx < 0 ? Math.min(idx + 1, TAB_ROUTES.length - 1) : Math.max(0, idx - 1);
        if (next !== idx) navRef.current(TAB_ROUTES[next]);
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', () => { tracking = false; });
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
    };
  }, []);

  if (!app.entered) return <Onboarding />;

  const fullScreen = app.route === 'chat' || app.route === 'exercise';
  const Screen = SCREENS[app.route];

  return (
    <>
      {!fullScreen && <AmbientJugnu />}

      <div
        key={app.route + app.profileId}
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2, paddingTop: 'calc(env(safe-area-inset-top) + 34px)' }}
      >
        <Screen />
      </div>

      {/* floating chat button on non-home, non-fullscreen screens (home has its own) */}
      {!fullScreen && app.route !== 'home' && (
        <div style={{ position: 'absolute', right: 16, bottom: 'calc(86px + env(safe-area-inset-bottom))', zIndex: 45, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => app.nav('chat')}
            aria-label="Talk to Jugnu"
            style={{ width: 62, height: 62, borderRadius: 999, background: 'rgba(255,250,242,.82)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 14px 30px -12px rgba(236,170,60,.8), 0 0 0 1px rgba(255,255,255,.6) inset', display: 'grid', placeItems: 'center' }}
          >
            <Jugnu size={50} mood="idle" />
          </button>
          <span className="hi" style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--ink-2)', background: 'rgba(255,250,242,.85)', padding: '3px 9px', borderRadius: 999, boxShadow: '0 4px 10px -6px rgba(90,60,30,.4)' }}>
            जुगनू से बात
          </span>
        </div>
      )}

      {!fullScreen && <TabBar />}

      {/* voice toggle */}
      <button
        onClick={app.toggleSound}
        aria-label="Toggle Jugnu's voice"
        aria-pressed={app.sound}
        style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top) + 4px)', right: 16, width: 38, height: 38, borderRadius: 999, background: 'rgba(255,250,242,.8)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', boxShadow: '0 6px 14px -8px rgba(90,60,30,.5)', display: 'grid', placeItems: 'center', color: app.sound ? 'var(--gold-d)' : 'var(--ink-3)', zIndex: 55 }}
      >
        <Icon name={app.sound ? 'sound' : 'mute'} size={18} sw={2.1} />
      </button>

      {app.celebrate && <Confetti />}
      {app.logNode && <LogSheet node={app.logNode} onClose={() => app.setLogNode(null)} />}
      {app.profileOpen && <ProfileSheet onClose={() => app.setProfileOpen(false)} />}
    </>
  );
}
