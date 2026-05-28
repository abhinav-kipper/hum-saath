/* ============================================================
   Medicine definitions are now editable + stored (localStorage
   or Supabase) via src/lib/store.ts. This file only holds the
   suggested STARTER set used to seed a new household and the
   shared Medicine type.
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

export type MedicineInput = Omit<Medicine, 'id'>;

export const STARTER_MEDICINES: Record<Profile, MedicineInput[]> = {
  papa: [],
  chunnu: [
    {
      name: 'Antidepressant',
      hindiName: 'एंटीडिप्रेसेंट',
      time: '21:00',
      note: 'Same time every day · don’t skip',
      noteHindi: 'रोज़ एक ही समय · छोड़ें नहीं',
    },
  ],
  mummy: [
    {
      name: 'Thyroid tablet',
      hindiName: 'थायराइड की गोली',
      time: '07:00',
      note: 'Empty stomach · 1 hr before food',
      noteHindi: 'खाली पेट · खाने से 1 घंटा पहले',
    },
    {
      name: 'BP tablet',
      hindiName: 'बीपी की गोली',
      time: '09:00',
      note: 'With or after breakfast',
      noteHindi: 'नाश्ते के साथ या बाद में',
    },
  ],
};
