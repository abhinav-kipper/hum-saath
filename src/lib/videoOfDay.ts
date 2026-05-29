/* ============================================================
   "Aaj ka video" — today's one short move to watch.

   Rotates through the profile's routine, picking one exercise
   (with a real video) per day. Uses the videos already in
   data/exercises.ts — no new/unverified links invented.
   ============================================================ */

import { getRoutine, type Exercise } from '../data/exercises';
import type { Profile } from '../types';

export interface VideoOfDay {
  exercise: Exercise;
  index: number;
}

export function getVideoOfDay(profile: Profile, date: Date = new Date()): VideoOfDay | null {
  const routine = getRoutine(profile);
  const withVideo = routine.exercises
    .map((exercise, index) => ({ exercise, index }))
    .filter(({ exercise }) => exercise.videoId && exercise.videoId !== 'REPLACE_ME');
  if (withVideo.length === 0) return null;

  const dayIndex = Math.floor(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86_400_000,
  );
  return withVideo[((dayIndex % withVideo.length) + withVideo.length) % withVideo.length];
}
