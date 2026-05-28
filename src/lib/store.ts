/* ============================================================
   Data layer — the ONLY module that touches persistence.
   UI code must import from here and never read localStorage
   directly. Every function is async so swapping localStorage
   for Supabase later is a single-file change with no UI edits.

   // TODO v2: replace the localStorage body of each function
   // with Supabase calls. Signatures + types stay identical.
   ============================================================ */

import type { DayLog, DayLogPatch, MedLog, Profile, StreakInfo } from '../types';

const KEYS = {
  profile: 'saath.activeProfile.v1',
  logs: 'saath.logs.v1',
  medLogs: 'saath.medLogs.v1',
  celebrated: 'saath.celebrated.v1',
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
/* Medicine logs                                              */
/* ---------------------------------------------------------- */

function readMedLogs(): MedLog[] {
  try {
    const raw = localStorage.getItem(KEYS.medLogs);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MedLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMedLogs(logs: MedLog[]): void {
  localStorage.setItem(KEYS.medLogs, JSON.stringify(logs));
}

/** Medicine entries taken on a given day for a profile. */
export async function getMedLogs(
  profile: Profile,
  date: string = todayKey(),
): Promise<MedLog[]> {
  return readMedLogs().filter((m) => m.profile === profile && m.date === date);
}

/** Mark a medicine taken (idempotent for the day — keeps first time). */
export async function markMedTaken(
  profile: Profile,
  medId: string,
  date: string = todayKey(),
): Promise<MedLog> {
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

/** Undo a medicine-taken entry for the day. */
export async function unmarkMedTaken(
  profile: Profile,
  medId: string,
  date: string = todayKey(),
): Promise<void> {
  const next = readMedLogs().filter(
    (m) => !(m.profile === profile && m.medId === medId && m.date === date),
  );
  writeMedLogs(next);
}

/** Count of meds taken per day for a profile (date -> count). */
export async function getMedCountsByDate(
  profile: Profile,
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const m of readMedLogs()) {
    if (m.profile === profile) counts[m.date] = (counts[m.date] ?? 0) + 1;
  }
  return counts;
}

/* ---------------------------------------------------------- */
/* Daily celebration (fire confetti once per day per profile) */
/* ---------------------------------------------------------- */

function readCelebrated(): Record<string, string> {
  try {
    const raw = localStorage.getItem(KEYS.celebrated);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** True if this profile hasn't yet celebrated a full day today. */
export async function shouldCelebrate(
  profile: Profile,
  date: string = todayKey(),
): Promise<boolean> {
  return readCelebrated()[profile] !== date;
}

/** Record that today's celebration has fired for this profile. */
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

/** Wipe everything (used by a hidden reset in onboarding). */
export async function resetAll(): Promise<void> {
  localStorage.removeItem(KEYS.logs);
  localStorage.removeItem(KEYS.medLogs);
  localStorage.removeItem(KEYS.celebrated);
  localStorage.removeItem(KEYS.profile);
}
