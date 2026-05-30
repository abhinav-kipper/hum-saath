/* ============================================================
   Supabase seam — optional, household-code RLS sharing.

   - Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in env.
   - Run supabase/migrations/0001_state.sql in the project.
   - Enter the same long, unguessable household code on every
     family device; RLS scopes every row to that code, so the
     code behaves like a shared family password. No accounts.

   Without env vars OR a household code, every store call falls
   back to localStorage; the app keeps working offline.
   ============================================================ */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppState } from '../types';

const HOUSE_KEY = 'saath_jugnu_household_v1';
const LEGACY_KEY = 'saath.household.v1';
const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function isConfigured(): boolean {
  return Boolean(URL && ANON);
}

export function getHousehold(): string | null {
  try {
    const cur = localStorage.getItem(HOUSE_KEY);
    if (cur) return cur;
    // one-time migration from the older household key
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      localStorage.setItem(HOUSE_KEY, legacy);
      return legacy;
    }
    return null;
  } catch {
    return null;
  }
}

export function setHousehold(code: string): void {
  try {
    localStorage.setItem(HOUSE_KEY, code.trim());
  } catch {
    /* ignore */
  }
  client = null; // rebuild with the new header
}

export function clearHousehold(): void {
  try {
    localStorage.removeItem(HOUSE_KEY);
  } catch {
    /* ignore */
  }
  client = null;
}

export function useRemote(): boolean {
  return isConfigured() && !!getHousehold();
}

let client: SupabaseClient | null = null;
function sb(): SupabaseClient {
  if (!client) {
    client = createClient(URL!, ANON!, {
      auth: { persistSession: false },
      global: { headers: { 'x-household': getHousehold() ?? '' } },
    });
  }
  return client;
}

interface Row {
  household: string;
  data: AppState;
  updated_at: string;
}

export async function fetchRemoteState(): Promise<AppState | null> {
  if (!useRemote()) return null;
  try {
    const { data, error } = await sb()
      .from('state')
      .select('*')
      .eq('household', getHousehold() ?? '')
      .maybeSingle();
    if (error) {
      console.error('fetchRemoteState', error);
      return null;
    }
    return (data as Row | null)?.data ?? null;
  } catch (e) {
    console.error('fetchRemoteState', e);
    return null;
  }
}

export async function upsertRemoteState(state: AppState): Promise<void> {
  if (!useRemote()) return;
  try {
    const { error } = await sb()
      .from('state')
      .upsert({
        household: getHousehold(),
        data: state,
        updated_at: new Date().toISOString(),
      });
    if (error) console.error('upsertRemoteState', error);
  } catch (e) {
    console.error('upsertRemoteState', e);
  }
}
