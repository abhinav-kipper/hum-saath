/* ============================================================
   Persistence seam. The whole app state lives under one key in
   localStorage. This is the single place that touches storage —
   swap the body of load/save for a Supabase-backed version later
   without changing any UI code.
   ============================================================ */

import type { AppState, ProfileId, Node } from '../types';
import { plans as defaultPlans } from '../data/content';

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
    };
  } catch {
    return base;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}
