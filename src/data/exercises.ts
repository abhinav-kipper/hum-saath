/* ============================================================
   Exercise routines.

   The videoId values below are AI-SUGGESTED, search-sourced
   candidates — they are NOT verified. Before your parents rely
   on them, open each one and confirm (a) the link works and
   (b) the form/technique is appropriate. Swapping any is a
   one-line edit here; the player reads everything from this file.

   NOTE: Papa's routine targets sciatica / lower-back. Sciatica
   exercises are not one-size-fits-all — have a doctor or
   physiotherapist confirm these are right for him, and stop any
   move that makes pain shoot further down the leg.

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

/* ---------------- Papa — lower-back / sciatica routine ------ */

const papaRoutine: Routine = {
  profile: 'papa',
  title: 'Lower back & sciatica routine',
  titleHindi: 'पीठ और साइटिका की एक्सरसाइज़',
  minutes: 9,
  exercises: [
    {
      id: 'pelvic-tilts',
      name: 'Pelvic tilts',
      hindiName: 'पेल्विक टिल्ट',
      target: '10 reps',
      durationSec: 45,
      cue: 'Lying down, gently flatten your low back to the floor.',
      cueHindi: 'लेटकर कमर को धीरे से ज़मीन की ओर दबाएँ।',
      videoId: 'jFHSB245fcM',
    },
    {
      id: 'single-knee-to-chest',
      name: 'Single knee to chest',
      hindiName: 'एक घुटना छाती तक',
      target: '30 sec / side',
      durationSec: 60,
      cue: 'Hug one knee in gently; keep the other leg relaxed.',
      cueHindi: 'एक घुटना धीरे से छाती तक लाएँ, दूसरी टांग ढीली।',
      videoId: 'Yd9wY25koVk',
    },
    {
      id: 'double-knee-to-chest',
      name: 'Double knee to chest',
      hindiName: 'दोनों घुटने छाती तक',
      target: '30 sec',
      durationSec: 40,
      cue: 'Hug both knees softly; breathe and let the back relax.',
      cueHindi: 'दोनों घुटने धीरे से छाती तक लाएँ, गहरी साँस।',
      videoId: '5R7eWaNWO3U',
    },
    {
      id: 'piriformis-stretch',
      name: 'Figure-4 (piriformis) stretch',
      hindiName: 'फिगर-4 स्ट्रेच',
      target: '30 sec / side',
      durationSec: 60,
      cue: 'Ankle on opposite knee, ease the stretch into the hip.',
      cueHindi: 'टखना दूसरे घुटने पर रखें, कूल्हे में हल्का खिंचाव।',
      videoId: 'E6sqUHFt6Ng',
    },
    {
      id: 'sciatic-nerve-glide',
      name: 'Seated sciatic nerve glide',
      hindiName: 'नर्व ग्लाइड (बैठकर)',
      target: '10 reps / side',
      durationSec: 50,
      cue: 'Slowly straighten the leg and lift the foot, then relax. Stop if pain shoots down the leg.',
      cueHindi: 'टांग धीरे सीधी करें, पंजा ऊपर; दर्द बढ़े तो रुकें।',
      videoId: 'A42tSJ_7-CM',
    },
    {
      id: 'glute-bridge',
      name: 'Glute bridge',
      hindiName: 'ब्रिज',
      target: '10 reps',
      durationSec: 45,
      cue: 'Press through heels, lift hips, squeeze, lower slowly.',
      cueHindi: 'एड़ियों से दबाकर कूल्हे ऊपर उठाएँ, धीरे नीचे आएँ।',
      videoId: 'PhTDzR0TpZs',
    },
    {
      id: 'bird-dog',
      name: 'Bird-dog',
      hindiName: 'बर्ड-डॉग',
      target: '10 reps',
      durationSec: 50,
      cue: 'On all fours, reach opposite arm and leg; keep the back still.',
      cueHindi: 'घुटनों-हाथों पर, उल्टा हाथ-पैर सीधा करें, पीठ स्थिर।',
      videoId: 'RUWUEVAR8RQ',
    },
    {
      id: 'childs-pose',
      name: "Child's pose",
      hindiName: 'शिशु मुद्रा',
      target: '60 sec',
      durationSec: 60,
      cue: 'Sit hips back toward heels, arms forward, breathe and unwind.',
      cueHindi: 'कूल्हे एड़ियों की ओर, हाथ आगे, गहरी साँस लें।',
      videoId: 'X-OGH5-gLUs',
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

/* ---------------- Chunnu — mind & mood (move + breathe) ---- */

const chunnuRoutine: Routine = {
  profile: 'chunnu',
  title: 'Mind & mood routine',
  titleHindi: 'मन और मूड की एक्सरसाइज़',
  minutes: 25,
  exercises: [
    {
      id: 'walk-outside',
      name: '15-min walk outside',
      hindiName: '15 मिनट बाहर टहलना',
      target: '15 min',
      durationSec: 900,
      cue: 'Get some daylight and keep an easy pace — movement lifts mood.',
      cueHindi: 'धूप लें, आराम से चलें — चलना मूड अच्छा करता है।',
      videoId: 'REPLACE_ME',
    },
    {
      id: 'shoulder-release',
      name: 'Shoulder & neck release',
      hindiName: 'कंधे और गर्दन ढीली करें',
      target: '1 min',
      durationSec: 60,
      cue: 'Roll the shoulders and drop the tension you’re holding.',
      cueHindi: 'कंधे घुमाएँ, तनाव छोड़ें।',
      videoId: 'REPLACE_ME',
    },
    {
      id: 'gentle-stretch',
      name: 'Gentle full-body stretch',
      hindiName: 'हल्की स्ट्रेचिंग',
      target: '2 min',
      durationSec: 120,
      cue: 'Reach up, fold forward, breathe into each stretch.',
      cueHindi: 'ऊपर खिंचें, आगे झुकें, साँस लेते रहें।',
      videoId: 'REPLACE_ME',
    },
    {
      id: 'box-breathing',
      name: 'Box breathing',
      hindiName: 'बॉक्स ब्रीदिंग',
      target: '3 min',
      durationSec: 180,
      cue: 'In 4 · hold 4 · out 4 · hold 4. Calms the nervous system.',
      cueHindi: '4 साँस लें · 4 रोकें · 4 छोड़ें · 4 रोकें।',
      videoId: 'REPLACE_ME',
    },
    {
      id: 'mindful-sit',
      name: 'Mindful sit',
      hindiName: 'शांत बैठक',
      target: '5 min',
      durationSec: 300,
      cue: 'Sit quietly, notice your breath, let thoughts pass.',
      cueHindi: 'शांति से बैठें, साँस पर ध्यान दें।',
      videoId: 'REPLACE_ME',
    },
  ],
};

export const ROUTINES: Record<Profile, Routine> = {
  papa: papaRoutine,
  mummy: mummyRoutine,
  chunnu: chunnuRoutine,
};

export function getRoutine(profile: Profile): Routine {
  return ROUTINES[profile];
}
