/* ============================================================
   Data layer — the ONLY module the UI imports for persistence.
   UI never touches localStorage or Supabase directly.

   Dual-mode: each data op runs against Supabase when it's
   configured AND a household code is set (remote.useSupabase());
   otherwise it falls back to localStorage. So the app works
   offline / before setup, and "turning on the cloud" needs no
   UI changes — just env vars + a household code.

   Device-local state (active profile, confetti-fired-today)
   stays in localStorage in both modes.
   ============================================================ */

import type { DayLog, DayLogPatch, MedLog, Profile, StreakInfo } from '../types';
import { todayKey, uid } from './util';
import * as remote from './supabase';

export { todayKey };
export {
  isSupabaseConfigured,
  useSupabase,
  getHousehold,
  setHousehold,
  clearHousehold,
} from './supabase';

const KEYS = {
  profile: 'saath.activeProfile.v1',
  logs: 'saath.logs.v1',
  medLogs: 'saath.medLogs.v1',
  celebrated: 'saath.celebrated.v1',
} as const;

/* ---------------------------------------------------------- */
/* Profile (always device-local)                              */
/* ---------------------------------------------------------- */

export async function getProfile(): Promise<Profile | null> {
  const v = localStorage.getItem(KEYS.profile);
  return v === 'papa' || v === 'mummy' ? v : null;
}

export async function setProfile(profile: Profile): Promise<void> {
  localStorage.setItem(KEYS.profile, profile);
}

/* ---------------------------------------------------------- */
/* Logs — dispatched to Supabase or localStorage             */
/* ---------------------------------------------------------- */

function readLogs(): DayLog[] {
  try {
    const raw = localStorage.getItem(KEYS.logs);
    const parsed = raw ? (JSON.parse(raw) as DayLog[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLogs(logs: DayLog[]): void {
  localStorage.setItem(KEYS.logs, JSON.stringify(logs));
}

export async function getLogs(profile: Profile): Promise<DayLog[]> {
  if (remote.useSupabase()) return remote.getLogs(profile);
  return readLogs()
    .filter((l) => l.profile === profile)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getLog(
  profile: Profile,
  date: string = todayKey(),
): Promise<DayLog | undefined> {
  if (remote.useSupabase()) return remote.getLog(profile, date);
  return readLogs().find((l) => l.profile === profile && l.date === date);
}

/** Create or update a day's log for a profile (one row per profile/day). */
export async function upsertLog(
  profile: Profile,
  patch: DayLogPatch,
  date: string = todayKey(),
): Promise<DayLog> {
  if (remote.useSupabase()) return remote.upsertLog(profile, patch, date);

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
/* Streak — derived from getLogs, so works in both modes      */
/* ---------------------------------------------------------- */

function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

export async function getStreak(profile: Profile): Promise<StreakInfo> {
  const logs = await getLogs(profile);
  if (logs.length === 0) {
    return { count: 0, daysSinceLast: Infinity, status: 'new' };
  }
  const dates = logs.map((l) => l.date);
  const last = dates[dates.length - 1];
  const daysSinceLast = daysBetween(last, todayKey());

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
/* Medicine logs — dispatched                                 */
/* ---------------------------------------------------------- */

function readMedLogs(): MedLog[] {
  try {
    const raw = localStorage.getItem(KEYS.medLogs);
    const parsed = raw ? (JSON.parse(raw) as MedLog[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMedLogs(logs: MedLog[]): void {
  localStorage.setItem(KEYS.medLogs, JSON.stringify(logs));
}

export async function getMedLogs(
  profile: Profile,
  date: string = todayKey(),
): Promise<MedLog[]> {
  if (remote.useSupabase()) return remote.getMedLogs(profile, date);
  return readMedLogs().filter((m) => m.profile === profile && m.date === date);
}

export async function markMedTaken(
  profile: Profile,
  medId: string,
  date: string = todayKey(),
): Promise<MedLog> {
  if (remote.useSupabase()) return remote.markMedTaken(profile, medId, date);

  const logs = readMedLogs();
  const existing = logs.find(
    (m) => m.profile === profile && m.medId === medId && m.date === date,
  );
  if (existing) return existing;
  const created: MedLog = {
    id: uid(),
    profile,
    medId,
    date,
    takenAt: new Date().toISOString(),
  };
  logs.push(created);
  writeMedLogs(logs);
  return created;
}

export async function unmarkMedTaken(
  profile: Profile,
  medId: string,
  date: string = todayKey(),
): Promise<void> {
  if (remote.useSupabase()) return remote.unmarkMedTaken(profile, medId, date);
  const next = readMedLogs().filter(
    (m) => !(m.profile === profile && m.medId === medId && m.date === date),
  );
  writeMedLogs(next);
}

export async function getMedCountsByDate(
  profile: Profile,
): Promise<Record<string, number>> {
  if (remote.useSupabase()) return remote.getMedCountsByDate(profile);
  const counts: Record<string, number> = {};
  for (const m of readMedLogs()) {
    if (m.profile === profile) counts[m.date] = (counts[m.date] ?? 0) + 1;
  }
  return counts;
}

/* ---------------------------------------------------------- */
/* Daily celebration (device-local: confetti once per day)    */
/* ---------------------------------------------------------- */

function readCelebrated(): Record<string, string> {
  try {
    const raw = localStorage.getItem(KEYS.celebrated);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export async function shouldCelebrate(
  profile: Profile,
  date: string = todayKey(),
): Promise<boolean> {
  return readCelebrated()[profile] !== date;
}

export async function markCelebrated(
  profile: Profile,
  date: string = todayKey(),
): Promise<void> {
  const map = readCelebrated();
  map[profile] = date;
  localStorage.setItem(KEYS.celebrated, JSON.stringify(map));
}

/* ---------------------------------------------------------- */
/* Dev / testing helpers                                      */
/* ---------------------------------------------------------- */

/** Wipe local device state (does not delete cloud rows). */
export async function resetAll(): Promise<void> {
  localStorage.removeItem(KEYS.logs);
  localStorage.removeItem(KEYS.medLogs);
  localStorage.removeItem(KEYS.celebrated);
  localStorage.removeItem(KEYS.profile);
}
