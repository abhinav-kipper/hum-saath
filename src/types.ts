/* ============================================================
   Core domain types.
   These intentionally mirror what future Supabase tables will
   look like (snake-ish flat rows, string ids, ISO timestamps)
   so the localStorage -> Supabase swap is a single-file change
   in src/lib/store.ts and these types stay put.
   ============================================================ */

export type Profile = 'papa' | 'mummy' | 'chunnu';

export interface ProfileInfo {
  id: Profile;
  /** English display name */
  name: string;
  /** Hindi display name */
  nameHindi: string;
  /** Short condition summary, English */
  focus: string;
  /** Short condition summary, Hindi */
  focusHindi: string;
  /** Which accent token this profile uses */
  accent: 'terracotta' | 'sage' | 'indigo';
}

/**
 * One row per profile per local calendar day.
 * Maps cleanly to a Supabase `logs` table:
 *   id uuid pk, profile text, date date, created_at timestamptz, ...
 */
export interface DayLog {
  id: string;
  profile: Profile;
  /** Local calendar day, YYYY-MM-DD */
  date: string;
  /** ISO timestamp of first creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;

  /** Papa: subjective neck/back pain, 1–10 */
  painScore?: number;
  /** Mummy: blood pressure */
  systolic?: number;
  diastolic?: number;
  /** Chunnu: daily mood, 1–5 (higher is better) */
  moodScore?: number;
  /** Both: did a walk happen today */
  walked?: boolean;
  /** Both: completed the day's exercise routine */
  exerciseDone?: boolean;
}

export type DayLogPatch = Partial<
  Omit<DayLog, 'id' | 'profile' | 'date' | 'createdAt' | 'updatedAt'>
>;

export interface StreakInfo {
  /** Consecutive logged days ending at the most recent logged day */
  count: number;
  /** Whole days since the last logged day (0 = logged today) */
  daysSinceLast: number;
  /**
   * 'active'  — logged today or yesterday, streak counts
   * 'paused'  — missed 1–3 days, streak held (not reset)
   * 'welcome' — missed >3 days, show gentle welcome-back
   * 'new'     — never logged
   */
  status: 'active' | 'paused' | 'welcome' | 'new';
}

/**
 * One row each time a medicine is marked taken.
 * Maps to a Supabase `med_logs` table:
 *   id uuid pk, profile text, med_id text, date date, taken_at timestamptz
 */
export interface MedLog {
  id: string;
  profile: Profile;
  /** matches Medicine.id in src/data/medicines.ts */
  medId: string;
  /** Local calendar day, YYYY-MM-DD */
  date: string;
  /** ISO timestamp it was taken */
  takenAt: string;
}
