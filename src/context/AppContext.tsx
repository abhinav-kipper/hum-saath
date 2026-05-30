/* ============================================================
   The app's brain. State + actions + per-profile theming.
   Persisted via store.ts (localStorage, mirrored to Supabase).
   `done`, `medsTaken`, and `streak` are derived from the per-day
   history so they reset each calendar day on their own.
   ============================================================ */

import {
  createContext, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from 'react';
import type { AppState, DayRecord, Node, Profile, ProfileId } from '../types';
import { profiles } from '../data/content';
import { loadState, saveState } from '../lib/store';
import {
  fetchRemoteState,
  setHousehold as setHouseholdCode,
  clearHousehold as clearHouseholdCode,
  upsertRemoteState,
} from '../lib/supabase';
import { todayKey } from '../lib/util';

export type Route = 'home' | 'meds' | 'exercise' | 'dash' | 'lessons' | 'chat';

const ROUTE_OF: Record<string, Route> = {
  meds: 'meds', exercise: 'exercise', lesson: 'lessons', lessons: 'lessons',
  home: 'home', dash: 'dash', chat: 'chat',
};

const EMPTY_DAY: DayRecord = { done: [], meds: [], values: {} };

function dayOf(history: AppState['history'], pid: ProfileId, day: string): DayRecord {
  return history[pid]?.[day] ?? EMPTY_DAY;
}

function computeStreak(profileHistory: Record<string, DayRecord>, now: Date = new Date()): number {
  let s = 0;
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // forgiving streak — counts back while consecutive days have any activity
  while (true) {
    const key = todayKey(d);
    const rec = profileHistory[key];
    const tended = rec && (rec.done.length > 0 || rec.meds.length > 0 || Object.keys(rec.values).length > 0);
    if (!tended) break;
    s++;
    d.setDate(d.getDate() - 1);
  }
  return s;
}

export interface AppCtx {
  profile: Profile;
  profileId: ProfileId;
  plan: Node[];
  done: Set<string>;
  medsTaken: Set<string>;
  streak: number;
  history: Record<string, DayRecord>; // current profile's
  allHistory: AppState['history'];
  today: string;
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
  logValue: (id: string, val: number) => void;
  linkHousehold: (code: string) => Promise<void>;
  unlinkHousehold: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = useRef(loadState()).current;

  const [entered, setEntered] = useState(initial.entered);
  const [sound, setSound] = useState(initial.sound);
  const [profileId, setProfileId] = useState<ProfileId>(initial.profileId);
  const [plansState, setPlansState] = useState(initial.plans);
  const [history, setHistory] = useState(initial.history);

  const [route, setRoute] = useState<Route>('home');
  const [activeNode, setActiveNode] = useState<Node | null>(null);
  const [logNode, setLogNode] = useState<Node | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // persist + mirror to Supabase whenever the family is linked
  useEffect(() => {
    saveState({ entered, sound, profileId, plans: plansState, history, updatedAt: initial.updatedAt });
  }, [entered, sound, profileId, plansState, history, initial.updatedAt]);

  // pull remote state on mount; adopt if newer
  useEffect(() => {
    let live = true;
    (async () => {
      const remote = await fetchRemoteState();
      if (!live || !remote) return;
      if (!initial.updatedAt || remote.updatedAt > initial.updatedAt) {
        setEntered(remote.entered);
        setSound(remote.sound);
        setProfileId(remote.profileId);
        setPlansState(remote.plans);
        setHistory(remote.history);
      }
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // repaint accents per active profile
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', profiles[profileId].accent);
    root.style.setProperty('--accent-d', profiles[profileId].accentD);
  }, [profileId]);

  const today = todayKey();

  const profile = profiles[profileId];
  const plan = plansState[profileId] ?? [];
  const profileHistory = history[profileId] ?? {};
  const todayRec = profileHistory[today] ?? EMPTY_DAY;
  const done = useMemo(() => new Set(todayRec.done), [todayRec]);
  const medsTaken = useMemo(() => new Set(todayRec.meds), [todayRec]);
  const streak = useMemo(() => computeStreak(profileHistory), [profileHistory]);

  const value = useMemo<AppCtx>(() => {
    const patchToday = (patch: Partial<DayRecord>) =>
      setHistory((h) => {
        const cur = dayOf(h, profileId, today);
        return {
          ...h,
          [profileId]: {
            ...(h[profileId] ?? {}),
            [today]: { ...cur, ...patch },
          },
        };
      });
    const addDone = (id: string) =>
      setHistory((h) => {
        const cur = dayOf(h, profileId, today);
        if (cur.done.includes(id)) return h;
        return {
          ...h,
          [profileId]: {
            ...(h[profileId] ?? {}),
            [today]: { ...cur, done: [...cur.done, id] },
          },
        };
      });
    const celebrateNow = () => {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1900);
    };
    return {
      profile, profileId, plan, done, medsTaken, streak,
      history: profileHistory, allHistory: history, today,
      sound, entered, route, activeNode, logNode, profileOpen, celebrate,
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
        setHistory((h) => {
          const cur = dayOf(h, profileId, today);
          if (cur.meds.includes(id)) return h;
          return {
            ...h,
            [profileId]: {
              ...(h[profileId] ?? {}),
              [today]: { ...cur, meds: [...cur.meds, id] },
            },
          };
        });
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
      logValue(id, val) {
        patchToday({ values: { ...todayRec.values, [id]: val } });
      },
      async linkHousehold(code) {
        setHouseholdCode(code);
        const remote = await fetchRemoteState();
        if (remote) {
          setEntered(remote.entered);
          setSound(remote.sound);
          setProfileId(remote.profileId);
          setPlansState(remote.plans);
          setHistory(remote.history);
        } else {
          await upsertRemoteState({ entered, sound, profileId, plans: plansState, history, updatedAt: new Date().toISOString() });
        }
      },
      unlinkHousehold() {
        clearHouseholdCode();
      },
    };
  }, [profile, profileId, plan, done, medsTaken, streak, profileHistory, history, today, sound, entered, route, activeNode, logNode, profileOpen, celebrate, plansState, todayRec]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
