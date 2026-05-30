/* ============================================================
   Persistence seam. localStorage is the synchronous source of
   truth; whenever the family has set a household code AND Supabase
   env is configured, every save is mirrored to the cloud and the
   app pulls the remote on mount, adopting it if it is newer.
   ============================================================ */

import type { AppState, ProfileId, Node } from '../types';
import { plans as defaultPlans } from '../data/content';
import { upsertRemoteState, fetchRemoteState } from './supabase';

const KEY = 'saath_jugnu_v1';

function clonePlans(): Record<ProfileId, Node[]> {
  return JSON.parse(JSON.stringify(defaultPlans));
}

export function defaultState(): AppState {
  return {
    entered: false,
    sound: false,
    profileId: 'papa',
    plans: clonePlans(),
    doneBy: {},
    medsBy: {},
    updatedAt: '',
  };
}

export function loadState(): AppState {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Partial<AppState>;
    return {
      ...base,
      ...saved,
      plans: saved.plans ?? base.plans,
      doneBy: saved.doneBy ?? {},
      medsBy: saved.medsBy ?? {},
      updatedAt: saved.updatedAt ?? '',
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
    /* storage full / unavailable — non-fatal */
  }
  void upsertRemoteState(stamped);
}

export { fetchRemoteState };
