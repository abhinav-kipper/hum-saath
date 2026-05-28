/* ============================================================
   Supabase backend (household-code sharing model).

   Activation (all done by you, outside the sandbox):
   1. Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (env).
   2. Run supabase/migrations/0001_init.sql in your project.
   3. Enter a household code once per device (HouseholdSetup).

   Sharing: every row carries a `household` column. The client
   sends the code as an `x-household` header and RLS only exposes
   rows whose household matches that header — so the code acts
   like a shared password across all family devices. No logins.

   If env vars OR a household code are missing, store.ts stays on
   localStorage, so the app keeps working until you wire this up.
   ============================================================ */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { DayLog, DayLogPatch, MedLog, Profile } from '../types';
import type { Medicine, MedicineInput } from '../data/medicines';
import { todayKey } from './util';

const HOUSEHOLD_KEY = 'saath.household.v1';

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(URL && ANON);
}

export function getHousehold(): string | null {
  try {
    return localStorage.getItem(HOUSEHOLD_KEY);
  } catch {
    return null;
  }
}

export function setHousehold(code: string): void {
  localStorage.setItem(HOUSEHOLD_KEY, code.trim());
  client = null; // rebuild with the new header
}

export function clearHousehold(): void {
  localStorage.removeItem(HOUSEHOLD_KEY);
  client = null;
}

/** True when we have everything needed to talk to Supabase. */
export function useSupabase(): boolean {
  return isSupabaseConfigured() && Boolean(getHousehold());
}

let client: SupabaseClient | null = null;
function sb(): SupabaseClient {
  if (!client) {
    const household = getHousehold() ?? '';
    client = createClient(URL!, ANON!, {
      auth: { persistSession: false },
      global: { headers: { 'x-household': household } },
    });
  }
  return client;
}

function household(): string {
  const h = getHousehold();
  if (!h) throw new Error('No household code set');
  return h;
}

/* -------- row <-> domain mapping -------- */

interface LogRow {
  id: string;
  profile: Profile;
  date: string;
  created_at: string;
  updated_at: string;
  pain_score: number | null;
  systolic: number | null;
  diastolic: number | null;
  walked: boolean | null;
  exercise_done: boolean | null;
}

function toDayLog(r: LogRow): DayLog {
  return {
    id: r.id,
    profile: r.profile,
    date: r.date,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    painScore: r.pain_score ?? undefined,
    systolic: r.systolic ?? undefined,
    diastolic: r.diastolic ?? undefined,
    walked: r.walked ?? undefined,
    exerciseDone: r.exercise_done ?? undefined,
  };
}

function patchToRow(patch: DayLogPatch): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if ('painScore' in patch) row.pain_score = patch.painScore ?? null;
  if ('systolic' in patch) row.systolic = patch.systolic ?? null;
  if ('diastolic' in patch) row.diastolic = patch.diastolic ?? null;
  if ('walked' in patch) row.walked = patch.walked ?? null;
  if ('exerciseDone' in patch) row.exercise_done = patch.exerciseDone ?? null;
  return row;
}

/* -------- data operations -------- */

export async function getLogs(profile: Profile): Promise<DayLog[]> {
  const { data, error } = await sb()
    .from('logs')
    .select('*')
    .eq('household', household())
    .eq('profile', profile)
    .order('date', { ascending: true });
  if (error) {
    console.error('supabase getLogs', error);
    return [];
  }
  return (data as LogRow[]).map(toDayLog);
}

export async function getLog(
  profile: Profile,
  date: string = todayKey(),
): Promise<DayLog | undefined> {
  const { data, error } = await sb()
    .from('logs')
    .select('*')
    .eq('household', household())
    .eq('profile', profile)
    .eq('date', date)
    .maybeSingle();
  if (error) {
    console.error('supabase getLog', error);
    return undefined;
  }
  return data ? toDayLog(data as LogRow) : undefined;
}

export async function upsertLog(
  profile: Profile,
  patch: DayLogPatch,
  date: string = todayKey(),
): Promise<DayLog> {
  const now = new Date().toISOString();
  const existing = await getLog(profile, date);
  if (existing) {
    const { data, error } = await sb()
      .from('logs')
      .update({ ...patchToRow(patch), updated_at: now })
      .eq('household', household())
      .eq('profile', profile)
      .eq('date', date)
      .select('*')
      .single();
    if (error) throw error;
    return toDayLog(data as LogRow);
  }
  const { data, error } = await sb()
    .from('logs')
    .insert({
      household: household(),
      profile,
      date,
      created_at: now,
      updated_at: now,
      ...patchToRow(patch),
    })
    .select('*')
    .single();
  if (error) throw error;
  return toDayLog(data as LogRow);
}

interface MedRow {
  id: string;
  profile: Profile;
  med_id: string;
  date: string;
  taken_at: string;
}

function toMedLog(r: MedRow): MedLog {
  return { id: r.id, profile: r.profile, medId: r.med_id, date: r.date, takenAt: r.taken_at };
}

export async function getMedLogs(
  profile: Profile,
  date: string = todayKey(),
): Promise<MedLog[]> {
  const { data, error } = await sb()
    .from('med_logs')
    .select('*')
    .eq('household', household())
    .eq('profile', profile)
    .eq('date', date);
  if (error) {
    console.error('supabase getMedLogs', error);
    return [];
  }
  return (data as MedRow[]).map(toMedLog);
}

export async function markMedTaken(
  profile: Profile,
  medId: string,
  date: string = todayKey(),
): Promise<MedLog> {
  const existing = await getMedLogs(profile, date);
  const found = existing.find((m) => m.medId === medId);
  if (found) return found;
  const { data, error } = await sb()
    .from('med_logs')
    .insert({
      household: household(),
      profile,
      med_id: medId,
      date,
      taken_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw error;
  return toMedLog(data as MedRow);
}

export async function unmarkMedTaken(
  profile: Profile,
  medId: string,
  date: string = todayKey(),
): Promise<void> {
  const { error } = await sb()
    .from('med_logs')
    .delete()
    .eq('household', household())
    .eq('profile', profile)
    .eq('med_id', medId)
    .eq('date', date);
  if (error) throw error;
}

export async function getMedCountsByDate(
  profile: Profile,
): Promise<Record<string, number>> {
  const { data, error } = await sb()
    .from('med_logs')
    .select('date')
    .eq('household', household())
    .eq('profile', profile);
  if (error) {
    console.error('supabase getMedCountsByDate', error);
    return {};
  }
  const counts: Record<string, number> = {};
  for (const r of data as { date: string }[]) {
    counts[r.date] = (counts[r.date] ?? 0) + 1;
  }
  return counts;
}

/* -------- medicine definitions -------- */

interface MedicineRow {
  id: string;
  name: string;
  hindi_name: string | null;
  time: string | null;
  note: string | null;
  note_hindi: string | null;
  sort: number;
}

function toMedicine(r: MedicineRow): Medicine {
  return {
    id: r.id,
    name: r.name,
    hindiName: r.hindi_name ?? '',
    time: r.time ?? '',
    note: r.note ?? '',
    noteHindi: r.note_hindi ?? '',
  };
}

export async function listMedicines(profile: Profile): Promise<Medicine[]> {
  const { data, error } = await sb()
    .from('medicines')
    .select('*')
    .eq('household', household())
    .eq('profile', profile)
    .order('sort', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) {
    console.error('supabase listMedicines', error);
    return [];
  }
  return (data as MedicineRow[]).map(toMedicine);
}

export async function addMedicine(
  profile: Profile,
  data: MedicineInput,
): Promise<Medicine> {
  const { data: row, error } = await sb()
    .from('medicines')
    .insert({
      household: household(),
      profile,
      name: data.name,
      hindi_name: data.hindiName,
      time: data.time,
      note: data.note,
      note_hindi: data.noteHindi,
    })
    .select('*')
    .single();
  if (error) throw error;
  return toMedicine(row as MedicineRow);
}

export async function updateMedicine(
  _profile: Profile,
  id: string,
  patch: Partial<MedicineInput>,
): Promise<void> {
  const row: Record<string, unknown> = {};
  if ('name' in patch) row.name = patch.name;
  if ('hindiName' in patch) row.hindi_name = patch.hindiName;
  if ('time' in patch) row.time = patch.time;
  if ('note' in patch) row.note = patch.note;
  if ('noteHindi' in patch) row.note_hindi = patch.noteHindi;
  const { error } = await sb()
    .from('medicines')
    .update(row)
    .eq('household', household())
    .eq('id', id);
  if (error) throw error;
}

export async function removeMedicine(_profile: Profile, id: string): Promise<void> {
  const { error } = await sb()
    .from('medicines')
    .delete()
    .eq('household', household())
    .eq('id', id);
  if (error) throw error;
}
