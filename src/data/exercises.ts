/* ============================================================
   Exercise routines.

   The videoId values below are AI-SUGGESTED, search-sourced
   candidates — they are NOT verified. Before your parents rely
   on them, open each one and confirm (a) the link works and
   (b) the form/technique is appropriate. Swapping any is a
   one-line edit here; the player reads everything from this file.

   durationSec drives the per-exercise countdown timer.
   target is the human-readable goal (reps or time).
   ============================================================ */

import type { Profile } from '../types';

export interface Exercise {
  id: string;
  name: string;
  hindiName: string;
  /** Human-readable goal, e.g. "10 reps" or "30 sec / side" */
  target: string;
  /** Seconds for the coach-mode countdown */
  durationSec: number;
  /** One-line cue, English */
  cue: string;
  /** One-line cue, Hindi */
  cueHindi: string;
  /** YouTube video id (unverified candidate — confirm before use). */
  videoId: string;
}

export interface Routine {
  profile: Profile;
  title: string;
  titleHindi: string;
  /** Rough total minutes, for the Today card */
  minutes: number;
  exercises: Exercise[];
}

/* ---------------- Papa — cervical / upper-back mobility ----- */

const papaRoutine: Routine = {
  profile: 'papa',
  title: 'Neck & upper-back routine',
  titleHindi: 'गर्दन और पीठ की एक्सरसाइज़',
  minutes: 8,
  exercises: [
    {
      id: 'chin-tucks',
      name: 'Chin tucks',
      hindiName: 'ठोड़ी अंदर खींचें',
      target: '10 reps',
      durationSec: 45,
      cue: 'Make a gentle double chin, hold 2 sec, release.',
      cueHindi: 'हल्के से ठोड़ी पीछे खींचें, 2 सेकंड रोकें।',
      videoId: '7rnlAVhAK-8',
    },
    {
      id: 'neck-side-stretch',
      name: 'Neck side stretch',
      hindiName: 'गर्दन साइड स्ट्रेच',
      target: '30 sec / side',
      durationSec: 60,
      cue: 'Ear toward shoulder, no shrugging. Breathe.',
      cueHindi: 'कान कंधे की ओर झुकाएँ, कंधा न उठाएँ।',
      videoId: 't_q9JQh_-7A',
    },
    {
      id: 'shoulder-rolls',
      name: 'Shoulder rolls',
      hindiName: 'कंधे घुमाएँ',
      target: '10 back + 10 forward',
      durationSec: 40,
      cue: 'Big slow circles, back then forward.',
      cueHindi: 'बड़े धीमे गोल घुमाव — पीछे फिर आगे।',
      videoId: 'EOsdkHH5QvI',
    },
    {
      id: 'scapular-squeeze',
      name: 'Scapular squeeze',
      hindiName: 'कंधे के ब्लेड दबाएँ',
      target: '10 reps',
      durationSec: 40,
      cue: 'Pinch shoulder blades together, hold 2 sec.',
      cueHindi: 'दोनों कंधे के ब्लेड पीछे दबाएँ, 2 सेकंड रोकें।',
      videoId: 'QN1oZVMMRjE',
    },
    {
      id: 'doorway-chest-stretch',
      name: 'Doorway chest stretch',
      hindiName: 'दरवाज़े पर चेस्ट स्ट्रेच',
      target: '30 sec',
      durationSec: 35,
      cue: 'Forearms on frame, lean through gently.',
      cueHindi: 'दरवाज़े पर हाथ रखें, हल्के से आगे झुकें।',
      videoId: 'NePr1XKRTLU',
    },
    {
      id: 'wall-angels',
      name: 'Wall angels',
      hindiName: 'वॉल एंजेल्स',
      target: '10 reps',
      durationSec: 45,
      cue: 'Back to wall, slide arms up and down slowly.',
      cueHindi: 'पीठ दीवार से लगाकर हाथ ऊपर-नीचे करें।',
      videoId: 'CwoPzrBDfpk',
    },
    {
      id: 'seated-cat-cow',
      name: 'Seated cat-cow',
      hindiName: 'बैठकर कैट-काउ',
      target: '10 reps',
      durationSec: 45,
      cue: 'Round the back, then arch and open the chest.',
      cueHindi: 'पीठ गोल करें, फिर सीना खोलकर पीछे झुकें।',
      videoId: 'PMxA3xlFpAk',
    },
    {
      id: 'thoracic-extension',
      name: 'Thoracic extension over chair',
      hindiName: 'कुर्सी पर पीठ खोलें',
      target: '30 sec',
      durationSec: 35,
      cue: 'Upper back over chair edge, open and breathe.',
      cueHindi: 'ऊपरी पीठ कुर्सी पर टिकाकर पीछे खुलें।',
      videoId: 'U2-q4ruoSQU',
    },
  ],
};

/* ---------------- Mummy — BP / strength + breathing -------- */

const mummyRoutine: Routine = {
  profile: 'mummy',
  title: 'BP & strength routine',
  titleHindi: 'बीपी और ताकत की एक्सरसाइज़',
  minutes: 20,
  exercises: [
    {
      id: 'brisk-walk',
      name: '10-min brisk walk',
      hindiName: '10 मिनट तेज़ चलना',
      target: '10 min',
      durationSec: 600,
      cue: 'Comfortable but quick — you can talk, not sing.',
      cueHindi: 'तेज़ चलें — बात कर सकें पर गा न सकें।',
      videoId: 'KyCXFrE9LQ4',
    },
    {
      id: 'wall-pushups',
      name: 'Wall push-ups',
      hindiName: 'दीवार पुश-अप',
      target: '10 reps',
      durationSec: 45,
      cue: 'Hands on wall, lower chest in, push back out.',
      cueHindi: 'हाथ दीवार पर, सीना अंदर लाएँ, फिर धकेलें।',
      videoId: 'QpMTk21EmaM',
    },
    {
      id: 'sit-to-stand',
      name: 'Sit-to-stand',
      hindiName: 'बैठो-उठो',
      target: '10 reps',
      durationSec: 50,
      cue: 'Stand from a chair without using hands.',
      cueHindi: 'कुर्सी से बिना हाथ लगाए उठें।',
      videoId: 'kKTXrB6n4RM',
    },
    {
      id: 'standing-marches',
      name: 'Standing marches',
      hindiName: 'खड़े होकर मार्च',
      target: '30 sec',
      durationSec: 40,
      cue: 'Lift knees high, swing arms, steady pace.',
      cueHindi: 'घुटने ऊँचे उठाएँ, हाथ हिलाएँ।',
      videoId: '8p8x6UTWIrI',
    },
    {
      id: 'band-rows',
      name: 'Resistance-band rows',
      hindiName: 'बैंड रो',
      target: '10 reps',
      durationSec: 45,
      cue: 'Pull band to ribs, squeeze, release slow.',
      cueHindi: 'बैंड पसलियों तक खींचें, दबाएँ, धीरे छोड़ें।',
      videoId: 'mnP10HI18uI',
    },
    {
      id: 'calf-raises',
      name: 'Calf raises',
      hindiName: 'एड़ी उठाएँ',
      target: '15 reps',
      durationSec: 45,
      cue: 'Up on toes, pause, lower with control.',
      cueHindi: 'पंजों पर उठें, रुकें, धीरे नीचे आएँ।',
      videoId: 'gwLzBJYoWlI',
    },
    {
      id: 'deep-breathing',
      name: 'Deep breathing',
      hindiName: 'गहरी साँस',
      target: '2 min',
      durationSec: 120,
      cue: 'In for 4, out for 6. Soften the shoulders.',
      cueHindi: '4 गिनती साँस लें, 6 में छोड़ें। कंधे ढीले।',
      videoId: 'Mg2ar-7_HfA',
    },
  ],
};

export const ROUTINES: Record<Profile, Routine> = {
  papa: papaRoutine,
  mummy: mummyRoutine,
};

export function getRoutine(profile: Profile): Routine {
  return ROUTINES[profile];
}
