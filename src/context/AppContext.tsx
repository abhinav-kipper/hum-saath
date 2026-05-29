/* ============================================================
   The app's brain: persisted state, derived values, the
   continuous-flow actions, and per-profile theming.
   ============================================================ */

import {
  createContext, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from 'react';
import type { Node, Profile, ProfileId } from '../types';
import { profiles } from '../data/content';
import { loadState, saveState } from '../lib/store';

export type Route = 'home' | 'meds' | 'exercise' | 'dash' | 'lessons' | 'chat';

const ROUTE_OF: Record<string, Route> = {
  meds: 'meds', exercise: 'exercise', lesson: 'lessons', lessons: 'lessons',
  home: 'home', dash: 'dash', chat: 'chat',
};

export interface AppCtx {
  profile: Profile;
  profileId: ProfileId;
  plan: Node[];
  done: Set<string>;
  medsTaken: Set<string>;
  sound: boolean;
  entered: boolean;
  route: Route;
  activeNode: Node | null;
  logNode: Node | null;
  profileOpen: boolean;
  celebrate: boolean;
  enter: (sound: boolean) => void;
  toggleSound: () => void;
  setProfileOpen: (v: boolean) => void;
  setLogNode: (n: Node | null) => void;
  nav: (kind: string, node?: Node) => void;
  finish: (id?: string) => void;
  setProfile: (id: ProfileId) => void;
  takeMed: (id: string) => void;
  setPlanOrder: (arr: Node[]) => void;
  removeNode: (id: string) => void;
  addNode: (t: Node) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = useRef(loadState()).current;

  const [entered, setEntered] = useState(initial.entered);
  const [sound, setSound] = useState(initial.sound);
  const [profileId, setProfileId] = useState<ProfileId>(initial.profileId);
  const [plansState, setPlansState] = useState(initial.plans);
  const [doneBy, setDoneBy] = useState(initial.doneBy);
  const [medsBy, setMedsBy] = useState(initial.medsBy);

  const [route, setRoute] = useState<Route>('home');
  const [activeNode, setActiveNode] = useState<Node | null>(null);
  const [logNode, setLogNode] = useState<Node | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // persist
  useEffect(() => {
    saveState({ entered, sound, profileId, plans: plansState, doneBy, medsBy });
  }, [entered, sound, profileId, plansState, doneBy, medsBy]);

  // repaint theme accents per active profile
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', profiles[profileId].accent);
    root.style.setProperty('--accent-d', profiles[profileId].accentD);
  }, [profileId]);

  const profile = profiles[profileId];
  const plan = plansState[profileId] ?? [];
  const done = useMemo(() => new Set(doneBy[profileId] ?? []), [doneBy, profileId]);
  const medsTaken = useMemo(() => new Set(medsBy[profileId] ?? []), [medsBy, profileId]);

  const value = useMemo<AppCtx>(() => {
    const addDone = (id: string) =>
      setDoneBy((o) => ({ ...o, [profileId]: Array.from(new Set([...(o[profileId] ?? []), id])) }));
    const celebrateNow = () => {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1900);
    };
    return {
      profile, profileId, plan, done, medsTaken, sound, entered,
      route, activeNode, logNode, profileOpen, celebrate,
      enter(s) { setSound(s); setEntered(true); },
      toggleSound() { setSound((s) => !s); },
      setProfileOpen,
      setLogNode,
      nav(kind, node) {
        setActiveNode(node ?? null);
        if (kind === 'log') {
          setLogNode(node ?? null);
          return;
        }
        setRoute(ROUTE_OF[kind] ?? 'home');
      },
      finish(id) {
        if (id) addDone(id);
        setLogNode(null);
        setActiveNode(null);
        setRoute('home');
        celebrateNow();
      },
      setProfile(id) {
        setProfileId(id);
        setRoute('home');
        setActiveNode(null);
      },
      takeMed(id) {
        setMedsBy((o) => ({ ...o, [profileId]: Array.from(new Set([...(o[profileId] ?? []), id])) }));
        if (activeNode && activeNode.kind === 'meds') {
          addDone(activeNode.id);
          setActiveNode(null);
          setRoute('home');
          celebrateNow();
        }
      },
      setPlanOrder(arr) { setPlansState((p) => ({ ...p, [profileId]: arr })); },
      removeNode(id) { setPlansState((p) => ({ ...p, [profileId]: (p[profileId] ?? []).filter((n) => n.id !== id) })); },
      addNode(t) { setPlansState((p) => ({ ...p, [profileId]: [...(p[profileId] ?? []), { ...t, baseId: t.id }] })); },
    };
  }, [profile, profileId, plan, done, medsTaken, sound, entered, route, activeNode, logNode, profileOpen, celebrate]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
