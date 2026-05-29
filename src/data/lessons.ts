/* ============================================================
   Lessons loader. The copy lives in lessons.json (Hinglish
   placeholders — replace with doctor-reviewed text later).
   This module just types it and picks "today's" lesson.
   ============================================================ */

import type { Profile } from '../types';
import raw from './lessons.json';

export interface Lesson {
  id: string;
  day: number;
  audience: Profile | 'both';
  title: string;
  body: string[];
  tryTonight: string;
  tryTonightHindi: string;
  /** "Aam galti" — a common belief we get wrong (Hinglish, for display). */
  myth?: string;
  /** "Sach" — what's actually true (Hinglish, for display). */
  fact?: string;
  /** What Dheeru says aloud, in Devanagari (so the Hindi TTS reads it well). */
  spokenHi?: string;
}

export const LESSONS: Lesson[] = raw as Lesson[];

/** Lessons relevant to a profile (its own + shared). */
export function lessonsFor(profile: Profile): Lesson[] {
  return LESSONS.filter((l) => l.audience === profile || l.audience === 'both');
}

/** Whole days since the Unix epoch in local time — a stable daily counter. */
function dayNumber(d: Date = new Date()): number {
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor(local.getTime() / 86_400_000);
}

/** Deterministic "lesson of the day" for a profile, cycling through the set. */
export function todayLesson(profile: Profile, d: Date = new Date()): Lesson {
  const pool = lessonsFor(profile);
  const idx = ((dayNumber(d) % pool.length) + pool.length) % pool.length;
  return pool[idx];
}
