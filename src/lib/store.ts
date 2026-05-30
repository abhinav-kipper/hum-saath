/* ============================================================
   Persistence seam. localStorage is the synchronous source of
   truth; when the family has set a household code AND Supabase
   env is configured, every save is mirrored to the cloud and the
   app pulls the remote on mount, adopting it if it is newer.
   ============================================================ */

import type { AppState, DayRecord, ProfileId, Node } from '../types';
import { plans as defaultPlans } from '../data/content';
import { upsertRemoteState, fetchRemoteState } from './supabase';
import { todayKey } from './util';

const KEY = 'saath_jugnu_v1';

function clonePlans(): Record<ProfileId, Node[]> {
  return JSON.parse(JSON.stringify(defaultPlans));
}

function emptyHistory(): Record<ProfileId, Record<string, DayRecord>> {
  return { papa: {}, mummy: {}, chunnu: {} };
}

export function defaultState(): AppState {
  return {
    entered: false,
    sound: false,
    profileId: 'papa',
    plans: clonePlans(),
    history: emptyHistory(),
    updatedAt: '',
  };
}

/** Migrate the legacy {doneBy, medsBy} shape into the new history. */
function migrateLegacy(saved: Record<string, unknown>): Record<ProfileId, Record<string, DayRecord>> {
  const history = emptyHistory();
  const today = todayKey();
  const set = (pid: ProfileId, patch: Partial<DayRecord>) => {
    const cur = history[pid][today] ?? { done: [], meds: [], values: {} };
    history[pid][today] = { ...cur, ...patch };
  };
  const doneBy = saved.doneBy as Record<string, string[]> | undefined;
  const medsBy = saved.medsBy as Record<string, string[]> | undefined;
  if (doneBy) {
    for (const pid of Object.keys(doneBy)) {
      if (pid === 'papa' || pid === 'mummy' || pid === 'chunnu') {
        set(pid, { done: doneBy[pid] ?? [] });
      }
    }
  }
  if (medsBy) {
    for (const pid of Object.keys(medsBy)) {
      if (pid === 'papa' || pid === 'mummy' || pid === 'chunnu') {
        set(pid, { meds: medsBy[pid] ?? [] });
      }
    }
  }
  return history;
}

export function loadState(): AppState {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Record<string, unknown>;
    const history = (saved.history as AppState['history']) ?? migrateLegacy(saved);
    return {
      ...base,
      entered: Boolean(saved.entered),
      sound: Boolean(saved.sound),
      profileId: (saved.profileId as ProfileId) ?? base.profileId,
      plans: (saved.plans as AppState['plans']) ?? base.plans,
      history,
      updatedAt: (saved.updatedAt as string) ?? '',
    };
  } catch {
    return base;
  }
}

/** Persist locally and mirror to Supabase when the family is connected. */
export function saveState(state: AppState): void {
  const stamped = { ...state, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(stamped));
  } catch {
    /* non-fatal */
  }
  void upsertRemoteState(stamped);
}

export { fetchRemoteState };
