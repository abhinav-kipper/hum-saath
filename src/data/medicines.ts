/* ============================================================
   Medicine schedules per profile.

   EDIT THESE to match the real prescription — names, times, and
   the timing note. Generic names are used here on purpose (no
   guessed brand names or doses). Adding/removing a medicine is
   just an edit to the arrays below; the Medicines screen and the
   Today card read everything from this file.

   Papa currently has none — add his here if needed.
   ============================================================ */

import type { Profile } from '../types';

export interface Medicine {
  id: string;
  name: string;
  hindiName: string;
  /** Scheduled time, display string e.g. "7:00 AM" */
  time: string;
  /** Timing instruction, English */
  note: string;
  /** Timing instruction, Hindi */
  noteHindi: string;
}

export const MEDICINES: Record<Profile, Medicine[]> = {
  papa: [],
  mummy: [
    {
      id: 'thyroid',
      name: 'Thyroid tablet',
      hindiName: 'थायराइड की गोली',
      time: '7:00 AM',
      note: 'Empty stomach · 1 hr before food',
      noteHindi: 'खाली पेट · खाने से 1 घंटा पहले',
    },
    {
      id: 'bp',
      name: 'BP tablet',
      hindiName: 'बीपी की गोली',
      time: '9:00 AM',
      note: 'With or after breakfast',
      noteHindi: 'नाश्ते के साथ या बाद में',
    },
  ],
};

export function getMedicines(profile: Profile): Medicine[] {
  return MEDICINES[profile];
}
