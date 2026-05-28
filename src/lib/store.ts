/* ============================================================
   Data layer — the ONLY module that touches persistence.
   UI code must import from here and never read localStorage
   directly. Every function is async so swapping localStorage
   for Supabase later is a single-file change with no UI edits.

   // TODO v2: replace the localStorage body of each function
   // with Supabase calls. Signatures + types stay identical.
   ============================================================ */

import type { DayLog, DayLogPatch, Profile, StreakInfo } from '../types';

const KEYS = {
  profile: 'saath.activeProfile.v1',
  logs: 'saath.logs.v1',
} as const;

/** Local calendar day as YYYY-MM-DD (not UTC). */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function readLogs(): DayLog[] {
  try {
    const raw = localStorage.getItem(KEYS.logs);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DayLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLogs(logs: DayLog[]): void {
  localStorage.setItem(KEYS.logs, JSON.stringify(logs));
}

/* ---------------------------------------------------------- */
/* Profile                                                    */
/* ---------------------------------------------------------- */

export async function getProfile(): Promise<Profile | null> {
  const v = localStorage.getItem(KEYS.profile);
  return v === 'papa' || v === 'mummy' ? v : null;
}

export async function setProfile(profile: Profile): Promise<void> {
  localStorage.setItem(KEYS.profile, profile);
}

/* ---------------------------------------------------------- */
/* Logs                                                       */
/* ---------------------------------------------------------- */

export async function getLogs(profile: Profile): Promise<DayLog[]> {
  return readLogs()
    .filter((l) => l.profile === profile)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getLog(
  profile: Profile,
  date: string = todayKey(),
): Promise<DayLog | undefined> {
  return readLogs().find((l) => l.profile === profile && l.date === date);
}

/**
 * Create or update today's (or any day's) log for a profile.
 * One row per profile per day; repeat calls merge into it.
 */
export async function upsertLog(
  profile: Profile,
  patch: DayLogPatch,
  date: string = todayKey(),
): Promise<DayLog> {
  const logs = readLogs();
  const now = new Date().toISOString();
  const idx = logs.findIndex((l) => l.profile === profile && l.date === date);

  if (idx >= 0) {
    const updated: DayLog = { ...logs[idx], ...patch, updatedAt: now };
    logs[idx] = updated;
    writeLogs(logs);
    return updated;
  }

  const created: DayLog = {
    id: uid(),
    profile,
    date,
    createdAt: now,
    updatedAt: now,
    ...patch,
  };
  logs.push(created);
  writeLogs(logs);
  return created;
}

/* ---------------------------------------------------------- */
/* Streak — forgiving: a miss pauses, never resets/guilts.    */
/* ---------------------------------------------------------- */

function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

export async function getStreak(profile: Profile): Promise<StreakInfo> {
  const logs = await getLogs(profile); // ascending by date
  if (logs.length === 0) {
    return { count: 0, daysSinceLast: Infinity, status: 'new' };
  }

  const dates = logs.map((l) => l.date);
  const last = dates[dates.length - 1];
  const daysSinceLast = daysBetween(last, todayKey());

  // Count consecutive days ending at the most recent logged day.
  let count = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    if (daysBetween(dates[i - 1], dates[i]) === 1) count++;
    else break;
  }

  let status: StreakInfo['status'];
  if (daysSinceLast <= 1) status = 'active';
  else if (daysSinceLast <= 3) status = 'paused';
  else status = 'welcome';

  return { count, daysSinceLast, status };
}

/* ---------------------------------------------------------- */
/* Dev / testing helpers                                      */
/* ---------------------------------------------------------- */

/** Wipe everything (used by a hidden reset in onboarding). */
export async function resetAll(): Promise<void> {
  localStorage.removeItem(KEYS.logs);
  localStorage.removeItem(KEYS.profile);
}
