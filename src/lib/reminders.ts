/* ============================================================
   Reminders — the gentle "prompt" engine + habit anchors.

   A per-profile daily rhythm: each habit has a time and, for the
   habit-anchoring feature, an optional implementation-intention
   "anchor" ("After morning chai"). Reminders are DEVICE-LOCAL
   (notifications + times are a per-device concern), so this lives
   in localStorage only — it never goes to Supabase.

   This module is pure logic + persistence. The actual nudging
   (in-app banner + OS notification) lives in ReminderBanner, and
   notification plumbing in lib/notify.ts.
   ============================================================ */

import type { Profile } from '../types';
import { checkinKind } from './checkin';
import { todayKey, uid } from './util';

export type ReminderKind = 'movement' | 'medicines' | 'checkin' | 'walk' | 'custom';

export interface Reminder {
  id: string;
  kind: ReminderKind;
  /** "HH:MM", 24h local time. */
  time: string;
  /** Implementation-intention anchor, e.g. "After morning chai". */
  anchor?: string;
  /** custom-only free label. */
  label?: string;
  enabled: boolean;
}

const KEY = (p: Profile) => `saath.reminders.${p}.v1`;
const STATE_KEY = (p: Profile, date: string) => `saath.reminderState.${p}.${date}`;

/* ---------------------------------------------------------- */
/* The reminder list (per profile)                            */
/* ---------------------------------------------------------- */

function defaults(): Reminder[] {
  return [
    { id: uid(), kind: 'movement', time: '08:00', anchor: 'After morning chai', enabled: true },
    { id: uid(), kind: 'checkin', time: '08:30', anchor: '', enabled: true },
    { id: uid(), kind: 'medicines', time: '09:00', anchor: 'With breakfast', enabled: true },
    { id: uid(), kind: 'walk', time: '19:30', anchor: 'After dinner', enabled: true },
  ];
}

export function getReminders(profile: Profile): Reminder[] {
  try {
    const raw = localStorage.getItem(KEY(profile));
    if (!raw) {
      const seeded = defaults();
      localStorage.setItem(KEY(profile), JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Reminder[];
    return Array.isArray(parsed) ? parsed : defaults();
  } catch {
    return defaults();
  }
}

export function saveReminders(profile: Profile, list: Reminder[]): void {
  localStorage.setItem(KEY(profile), JSON.stringify(list));
}

export function addCustomReminder(profile: Profile): Reminder[] {
  const list = getReminders(profile);
  list.push({ id: uid(), kind: 'custom', time: '12:00', label: 'New reminder', enabled: true });
  saveReminders(profile, list);
  return list;
}

export function updateReminder(
  profile: Profile,
  id: string,
  patch: Partial<Reminder>,
): Reminder[] {
  const list = getReminders(profile).map((r) => (r.id === id ? { ...r, ...patch } : r));
  saveReminders(profile, list);
  return list;
}

export function removeReminder(profile: Profile, id: string): Reminder[] {
  const list = getReminders(profile).filter((r) => r.id !== id);
  saveReminders(profile, list);
  return list;
}

/** The anchor phrase set for a given habit kind, for use on Today's cards. */
export function anchorFor(profile: Profile, kind: ReminderKind): string | undefined {
  const r = getReminders(profile).find((x) => x.kind === kind && x.enabled);
  return r?.anchor?.trim() || undefined;
}

/* ---------------------------------------------------------- */
/* Labels + routing                                           */
/* ---------------------------------------------------------- */

export function reminderRoute(kind: ReminderKind): string {
  switch (kind) {
    case 'movement':
      return '/exercise';
    case 'medicines':
      return '/medicines';
    case 'checkin':
    case 'walk':
      return '/log';
    default:
      return '/';
  }
}

export interface ReminderMeta {
  title: string;
  hindi: string;
  emoji: string;
}

export function reminderMeta(r: Reminder, profile: Profile): ReminderMeta {
  switch (r.kind) {
    case 'movement':
      return { title: 'Time to move a little', hindi: 'थोड़ा हिलने का समय', emoji: '🧘' };
    case 'medicines':
      return { title: 'Time for medicines', hindi: 'दवाई का समय', emoji: '💊' };
    case 'walk':
      return { title: 'Time for a little walk', hindi: 'टहलने का समय', emoji: '🚶' };
    case 'checkin': {
      const kind = checkinKind(profile);
      if (kind === 'bp') return { title: 'Time to check your BP', hindi: 'बीपी जाँचने का समय', emoji: '🩺' };
      if (kind === 'mood') return { title: 'How is your mood today?', hindi: 'आज मन कैसा है?', emoji: '🌼' };
      return { title: 'Time to log your pain', hindi: 'दर्द दर्ज करने का समय', emoji: '📝' };
    }
    default:
      return { title: r.label?.trim() || 'Reminder', hindi: 'याद दिलावा', emoji: '🔔' };
  }
}

/* ---------------------------------------------------------- */
/* Per-day nudge state (dismiss / snooze / notified)          */
/* ---------------------------------------------------------- */

export interface DayState {
  dismissed: string[];
  snooze: Record<string, string>; // id -> ISO "show again after"
  notified: string[];
}

function emptyState(): DayState {
  return { dismissed: [], snooze: {}, notified: [] };
}

export function getDayState(profile: Profile, date: string = todayKey()): DayState {
  try {
    const raw = localStorage.getItem(STATE_KEY(profile, date));
    if (!raw) return emptyState();
    const p = JSON.parse(raw) as Partial<DayState>;
    return {
      dismissed: Array.isArray(p.dismissed) ? p.dismissed : [],
      snooze: p.snooze && typeof p.snooze === 'object' ? p.snooze : {},
      notified: Array.isArray(p.notified) ? p.notified : [],
    };
  } catch {
    return emptyState();
  }
}

function setDayState(profile: Profile, state: DayState, date: string = todayKey()): void {
  localStorage.setItem(STATE_KEY(profile, date), JSON.stringify(state));
}

export function dismissReminder(profile: Profile, id: string): void {
  const s = getDayState(profile);
  if (!s.dismissed.includes(id)) s.dismissed.push(id);
  setDayState(profile, s);
}

export function snoozeReminder(profile: Profile, id: string, minutes: number): void {
  const s = getDayState(profile);
  s.snooze[id] = new Date(Date.now() + minutes * 60_000).toISOString();
  setDayState(profile, s);
}

export function markNotified(profile: Profile, id: string): void {
  const s = getDayState(profile);
  if (!s.notified.includes(id)) s.notified.push(id);
  setDayState(profile, s);
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Reminders that should be surfaced right now: enabled, their time
 * has passed today, not dismissed, not snoozed, and the underlying
 * task isn't already done. Earliest first.
 */
export function pendingReminders(
  list: Reminder[],
  state: DayState,
  now: Date,
  isDone: (kind: ReminderKind) => boolean,
): Reminder[] {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowIso = now.toISOString();
  return list
    .filter((r) => r.enabled)
    .filter((r) => toMinutes(r.time) <= nowMin)
    .filter((r) => !state.dismissed.includes(r.id))
    .filter((r) => {
      const until = state.snooze[r.id];
      return !until || until <= nowIso;
    })
    .filter((r) => !isDone(r.kind))
    .sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
}
