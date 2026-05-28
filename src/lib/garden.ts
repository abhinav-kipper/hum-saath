/* ============================================================
   The garden that grows over time.

   The Today plant resets each day; the GARDEN remembers. Every
   day the person tends their health (any logged action) grows
   the garden a little, and every full week of tending plants a
   permanent bloom. Growth is derived purely from log history,
   so it is monotonic and forgiving: missing days only slows
   growth, it never takes a flower away.
   ============================================================ */

import type { DayLog } from '../types';

/** Tended days needed to earn one permanent bloom. */
export const DAYS_PER_FLOWER = 7;

export interface GardenState {
  /** Total days the garden was tended (any health action logged). */
  tendedDays: number;
  /** Permanent bloomed flowers earned so far. */
  flowers: number;
  /** Progress (0–1) toward the next bloom — the plant currently growing. */
  growing: number;
  /** Tended days still needed for the next bloom. */
  daysToNext: number;
  title: string;
  titleHindi: string;
}

/** A day counts toward the garden if any health action happened that day. */
export function isTendedDay(log: DayLog | undefined, medCount: number): boolean {
  return Boolean(
    log?.exerciseDone ||
      log?.walked ||
      typeof log?.painScore === 'number' ||
      typeof log?.moodScore === 'number' ||
      typeof log?.systolic === 'number' ||
      medCount > 0,
  );
}

export function countTendedDays(
  logs: DayLog[],
  medCounts: Record<string, number>,
): number {
  const dates = new Set<string>([
    ...logs.map((l) => l.date),
    ...Object.keys(medCounts),
  ]);
  const byDate = new Map(logs.map((l) => [l.date, l]));
  let n = 0;
  dates.forEach((d) => {
    if (isTendedDay(byDate.get(d), medCounts[d] ?? 0)) n++;
  });
  return n;
}

function gardenTitle(flowers: number): { en: string; hi: string } {
  if (flowers <= 0)
    return { en: 'Your garden is just beginning', hi: 'बगीचा अभी शुरू हुआ है' };
  if (flowers < 3) return { en: 'Your garden is budding', hi: 'बगीचा खिलने लगा है' };
  if (flowers < 7) return { en: 'Your garden is blooming', hi: 'बगीचा खिल रहा है' };
  if (flowers < 12)
    return { en: 'Your garden is flourishing', hi: 'बगीचा लहलहा रहा है' };
  return { en: 'Your garden is in full bloom', hi: 'बगीचा पूरा खिल गया है' };
}

export function computeGarden(
  logs: DayLog[],
  medCounts: Record<string, number>,
): GardenState {
  const tendedDays = countTendedDays(logs, medCounts);
  const flowers = Math.floor(tendedDays / DAYS_PER_FLOWER);
  const rem = tendedDays % DAYS_PER_FLOWER;
  const t = gardenTitle(flowers);
  return {
    tendedDays,
    flowers,
    growing: rem / DAYS_PER_FLOWER,
    daysToNext: DAYS_PER_FLOWER - rem,
    title: t.en,
    titleHindi: t.hi,
  };
}
