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
import type { ComponentType } from 'react';

const SCREENS: Record<Route, ComponentType> = {
  home: Home,
  meds: Meds,
  exercise: Exercise,
  dash: Dash,
  lessons: Lessons,
  chat: Chat,
};

export default function AppShell() {
  const app = useApp();

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
        <button
          onClick={() => app.nav('chat')}
          aria-label="Talk to Jugnu"
          style={{ position: 'absolute', right: 16, bottom: 'calc(88px + env(safe-area-inset-bottom))', width: 62, height: 62, borderRadius: 999, background: 'rgba(255,250,242,.82)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 14px 30px -12px rgba(236,170,60,.8), 0 0 0 1px rgba(255,255,255,.6) inset', display: 'grid', placeItems: 'center', zIndex: 45 }}
        >
          <Jugnu size={50} mood="idle" />
        </button>
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
