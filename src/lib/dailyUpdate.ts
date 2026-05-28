/* ============================================================
   Builds the warm Hinglish messages shared to the family
   WhatsApp group. Pure functions — the screen gathers the data
   and passes it in, so this stays easy to tweak and test.
   ============================================================ */

import type { DayLog, Profile, StreakInfo } from '../types';

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const DONE = '✅';
const PENDING = '⏳';

export interface MedStatus {
  name: string;
  takenAt?: string;
}

export interface DailyUpdateInput {
  name: string;
  profile: Profile;
  dateStr: string;
  log?: DayLog;
  meds: MedStatus[];
  streak: StreakInfo;
}

/** One message summarising the whole day, for the family group. */
export function composeDailyUpdate(i: DailyUpdateInput): string {
  const flower = i.profile === 'mummy' ? '🌸' : i.profile === 'chunnu' ? '🌼' : '🌿';
  const lines: string[] = [`${flower} ${i.name} ki aaj ki update — ${i.dateStr}`, ''];

  if (i.meds.length > 0) {
    const parts = i.meds.map((m) =>
      m.takenAt ? `${m.name} ${DONE} ${fmtTime(m.takenAt)}` : `${m.name} ${PENDING}`,
    );
    lines.push(`💊 Dawai: ${parts.join(' · ')}`);
  }

  lines.push(`🧘 Exercise: ${i.log?.exerciseDone ? `ho gaya ${DONE}` : `baaki ${PENDING}`}`);
  lines.push(`🚶 Walk: ${i.log?.walked ? `ho gaya ${DONE}` : `baaki ${PENDING}`}`);

  if (i.profile === 'mummy') {
    if (typeof i.log?.systolic === 'number' && typeof i.log?.diastolic === 'number') {
      lines.push(`🩺 BP: ${i.log.systolic}/${i.log.diastolic}`);
    }
  } else if (i.profile === 'chunnu') {
    if (typeof i.log?.moodScore === 'number') {
      lines.push(`🙂 Mood: ${i.log.moodScore}/5`);
    }
  } else if (typeof i.log?.painScore === 'number') {
    lines.push(`💢 Dard (back/leg): ${i.log.painScore}/10`);
  }

  if (
    (i.streak.status === 'active' || i.streak.status === 'paused') &&
    i.streak.count > 0
  ) {
    lines.push('', `🔥 ${i.streak.count} din se lagataar — shaabaash!`);
  }

  lines.push('', 'Saath 💛');
  return lines.join('\n');
}

/** Shorter meds-only message (used on the Medicines screen). */
export function composeMedsUpdate(
  name: string,
  dateStr: string,
  meds: MedStatus[],
): string {
  const parts = meds.map((m) =>
    m.takenAt ? `${m.name} ${DONE} ${fmtTime(m.takenAt)}` : `${m.name} ${PENDING} baaki`,
  );
  return `💊 ${name} — dawai update (${dateStr})\n${parts.join('\n')}\n\nSaath 💛`;
}
