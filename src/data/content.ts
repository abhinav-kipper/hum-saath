/* ============================================================
   All content + scripts for the app (ported from the design's
   proto-data, typed). Profiles, per-profile day plans, the task
   palette, day-clock doses, exercise steps, lessons, dashboard
   metrics, Jugnu's narration lines, and the chat scripts.
   ============================================================ */

import type {
  Profile,
  ProfileId,
  Node,
  Dose,
  Exercise,
  Lesson,
  Line,
  ChatItem,
} from '../types';

export const profiles: Record<ProfileId, Profile> = {
  papa: { id: 'papa', name: 'पापा', en: 'Papa', focus: 'पीठ व साइटिका', focusEn: 'Back & sciatica', accent: 'var(--coral)', accentD: 'var(--coral-d)', grad: 'linear-gradient(160deg,#f6b25c,#ec8a4e)', region: 'back' },
  mummy: { id: 'mummy', name: 'मम्मी', en: 'Mummy', focus: 'बीपी व थायराइड', focusEn: 'BP & thyroid', accent: 'var(--mint)', accentD: 'var(--mint-d)', grad: 'linear-gradient(160deg,#7fc9a6,#4fae87)', region: 'heart' },
  chunnu: { id: 'chunnu', name: 'चुन्नू', en: 'Chunnu', focus: 'मन व मूड', focusEn: 'Mind & mood', accent: 'var(--peri)', accentD: 'var(--peri-d)', grad: 'linear-gradient(160deg,#9b9bf0,#7b7be8)', region: 'mind' },
};

export const profileList: Profile[] = [profiles.papa, profiles.mummy, profiles.chunnu];

export const plans: Record<ProfileId, Node[]> = {
  papa: [
    { id: 'm1', kind: 'meds', icon: 'pill', hi: 'सुबह की दवाई', en: 'Morning medicines' },
    { id: 'ex', kind: 'exercise', icon: 'activity', hi: 'गर्दन व पीठ खोलें', en: 'Neck & back mobility · 6 min' },
    { id: 'lg', kind: 'log', icon: 'heart', measure: true, hi: 'दर्द कैसा?', en: 'Log today’s pain' },
    { id: 'ls', kind: 'lesson', icon: 'book', hi: 'आज की छोटी सीख', en: 'Today’s 2-min lesson' },
    { id: 'wk', kind: 'log', icon: 'foot', hi: 'शाम की सैर', en: 'Evening walk' },
    { id: 'm2', kind: 'meds', icon: 'moon', hi: 'रात की दवाई', en: 'Evening medicines' },
  ],
  mummy: [
    { id: 'm1', kind: 'meds', icon: 'pill', hi: 'सुबह की दवाई', en: 'Morning medicines' },
    { id: 'ex', kind: 'exercise', icon: 'activity', hi: 'गहरी साँस व खिंचाव', en: 'Breathing & stretch · 5 min' },
    { id: 'lg', kind: 'log', icon: 'heart', measure: true, hi: 'बीपी नापें', en: 'Log blood pressure' },
    { id: 'ls', kind: 'lesson', icon: 'book', hi: 'आज की छोटी सीख', en: 'Today’s 2-min lesson' },
    { id: 'wk', kind: 'log', icon: 'foot', hi: 'शाम की सैर', en: 'Evening walk' },
    { id: 'm2', kind: 'meds', icon: 'moon', hi: 'रात की दवाई', en: 'Evening medicines' },
  ],
  chunnu: [
    { id: 'ex', kind: 'exercise', icon: 'activity', hi: 'सुबह की मोबिलिटी', en: 'Morning mobility · 7 min' },
    { id: 'm1', kind: 'meds', icon: 'pill', hi: 'विटामिन व सप्लिमेंट', en: 'Vitamins & supplements' },
    { id: 'lg', kind: 'log', icon: 'heart', measure: true, hi: 'मूड चेक-इन', en: 'Mood check-in' },
    { id: 'ls', kind: 'lesson', icon: 'book', hi: 'आज की छोटी सीख', en: 'Today’s 2-min lesson' },
    { id: 'wk', kind: 'log', icon: 'foot', confirm: true, hi: '10,000 कदम', en: '10k steps' },
  ],
};

/** Optional tasks the family can add to a day. */
export const taskPool: Node[] = [
  { id: 'water', kind: 'log', confirm: true, icon: 'water', hi: 'पानी पीना', en: 'Drink a glass of water' },
  { id: 'sun', kind: 'log', confirm: true, icon: 'sun', hi: 'थोड़ी धूप लें', en: 'Get some morning sun' },
  { id: 'medit', kind: 'log', confirm: true, icon: 'smile', hi: 'ध्यान · 5 मिनट', en: 'Meditate for 5 minutes' },
  { id: 'sugar', kind: 'log', measure: true, icon: 'drop', hi: 'शुगर जाँच', en: 'Blood sugar check' },
  { id: 'call', kind: 'log', confirm: true, icon: 'phone', hi: 'परिवार को कॉल', en: 'Call a family member' },
  { id: 'weight', kind: 'log', measure: true, icon: 'activity', hi: 'वज़न नोट करें', en: 'Note your weight' },
  { id: 'grat', kind: 'log', confirm: true, icon: 'heart', hi: 'आभार लिखें', en: 'Write one gratitude' },
  { id: 'breath', kind: 'exercise', icon: 'activity', hi: 'गहरी साँस', en: 'Deep breathing · 4 min' },
];

/** Day-clock doses, per profile. `ang` places each on the 24-hour
    dial. `taken` and `next` are derived at runtime from history. */
export const medsByProfile: Record<ProfileId, Dose[]> = {
  papa: [
    { id: 'p-d1', ang: -90, time: '8:00 AM', hi: 'अमलोडिपाइन', en: 'Amlodipine 5mg', sub: 'खाने के बाद · after food', color: 'var(--gold)' },
    { id: 'p-d2', ang: -18, time: '9:00 AM', hi: 'विटामिन D', en: 'Vitamin D3', sub: 'दूध के साथ · with milk', color: 'var(--coral)' },
    { id: 'p-d3', ang: 54, time: '2:00 PM', hi: 'दर्द की दवाई', en: 'Pain relief', sub: 'खाने के बाद · after lunch', color: 'var(--peri)' },
    { id: 'p-d4', ang: 200, time: '10:00 PM', hi: 'रात की दवाई', en: 'Night dose', sub: 'सोने से पहले · before bed', color: 'var(--rose)' },
  ],
  mummy: [
    { id: 'm-d1', ang: -110, time: '7:00 AM', hi: 'थायराइड', en: 'Thyronorm 50', sub: 'खाली पेट · empty stomach', color: 'var(--mint)' },
    { id: 'm-d2', ang: -40, time: '9:00 AM', hi: 'BP की दवाई', en: 'Amlodipine 5mg', sub: 'नाश्ते के बाद · after breakfast', color: 'var(--gold)' },
    { id: 'm-d3', ang: 30, time: '1:00 PM', hi: 'कैल्शियम', en: 'Calcium', sub: 'खाने के बाद · after lunch', color: 'var(--coral)' },
    { id: 'm-d4', ang: 110, time: '8:00 PM', hi: 'BP की दवाई', en: 'Amlodipine 5mg', sub: 'खाने के बाद · after dinner', color: 'var(--gold)' },
  ],
  chunnu: [
    { id: 'c-d1', ang: -50, time: '9:00 AM', hi: 'मल्टीविटामिन', en: 'Multivitamin', sub: 'नाश्ते के साथ · with breakfast', color: 'var(--peri)' },
    { id: 'c-d2', ang: 40, time: '1:00 PM', hi: 'आयरन', en: 'Iron + Folate', sub: 'खाने के बाद · after lunch', color: 'var(--rose)' },
    { id: 'c-d3', ang: 150, time: '8:00 PM', hi: 'B-कॉम्प्लेक्स', en: 'B-complex', sub: 'खाने के बाद · after dinner', color: 'var(--mint)' },
  ],
};

/* Per-profile guided exercise.

   `videoId`s are previously search-sourced YouTube candidates from the
   repo's original `exercises.ts` (AI-suggested, NOT verified). Confirm
   each link and form before relying on it; swap freely. */
export const exercises: Record<ProfileId, Exercise> = {
  papa: {
    title: 'गर्दन व पीठ खोलें',
    titleEn: 'Neck & back mobility',
    region: 'back',
    videoId: 'jFHSB245fcM',
    steps: [
      { hi: 'सीधे बैठिए, कंधे ढीले छोड़िए।', en: 'Sit tall, drop the shoulders.', secs: 15, region: 'neck' },
      { hi: 'धीरे से गर्दन दाईं ओर झुकाइए — 10 तक।', en: 'Gently tilt the neck right — count to 10.', secs: 20, region: 'neck' },
      { hi: 'अब बाईं ओर — आराम से साँस लेते हुए।', en: 'Now to the left — breathing easy.', secs: 20, region: 'neck' },
      { hi: 'कमर सीधी, हल्का आगे झुकाव।', en: 'Straight back, a small forward fold.', secs: 25, region: 'lowerback' },
      { hi: 'शाबाश! एक गहरी साँस लीजिए।', en: 'Well done — take one deep breath.', secs: 12, region: 'full' },
    ],
  },
  mummy: {
    title: 'गहरी साँस व खिंचाव',
    titleEn: 'Breathing & stretch',
    region: 'heart',
    videoId: 'Mg2ar-7_HfA',
    steps: [
      { hi: 'सीधे बैठिए, कंधे ढीले। चार गिनती में साँस लीजिए।', en: 'Sit tall, shoulders soft. Breathe in for four.', secs: 20, region: 'heart' },
      { hi: 'कंधे आगे और पीछे — पाँच बार।', en: 'Roll the shoulders — five times each way.', secs: 25, region: 'heart' },
      { hi: 'हाथ ऊपर खींचिए, हल्के से।', en: 'Reach the arms overhead, gently.', secs: 20, region: 'heart' },
      { hi: '4-7-8: चार में लें, सात रोकें, आठ में छोड़ें।', en: 'Box-like 4-7-8: in 4, hold 7, out 8.', secs: 30, region: 'heart' },
      { hi: 'शांत बैठिए, एक मुस्कान।', en: 'Sit quietly — one small smile.', secs: 25, region: 'full' },
    ],
  },
  chunnu: {
    title: 'सुबह की मोबिलिटी',
    titleEn: 'Morning mobility',
    region: 'mind',
    videoId: 'REPLACE_ME',
    steps: [
      { hi: 'कंधे और गर्दन ढीले छोड़िए।', en: 'Loosen the shoulders and neck.', secs: 20, region: 'mind' },
      { hi: 'आँखें बंद, पाँच गहरी साँस।', en: 'Eyes closed, five deep breaths.', secs: 25, region: 'mind' },
      { hi: 'बॉक्स ब्रीदिंग — 4 लें · 4 रोकें · 4 छोड़ें · 4 रोकें।', en: 'Box breathing — 4 · 4 · 4 · 4.', secs: 30, region: 'mind' },
      { hi: 'खड़े होकर हल्की स्ट्रेच।', en: 'Stand and stretch lightly.', secs: 20, region: 'full' },
      { hi: 'शांत बैठक, एक छोटी मुस्कान।', en: 'Quiet sit, a small smile.', secs: 25, region: 'mind' },
    ],
  },
};

export const lessons: Lesson[] = [
  { id: 'l1', tag: 'पीठ · Back', mins: 2, hi: 'कुर्सी से उठने का सही तरीका', en: 'How to stand up without back strain', body: 'घुटनों को मोड़िए, कमर सीधी रखिए, और पैरों की ताक़त से उठिए — कमर पर ज़ोर मत डालिए।', bodyEn: 'Bend the knees, keep the spine neutral, push up through the legs — not the lower back.' },
  { id: 'l2', tag: 'नींद · Sleep', mins: 2, hi: 'अच्छी नींद के तीन छोटे नियम', en: 'Three tiny rules for better sleep', body: 'रोज़ एक ही समय सोएँ, सोने से पहले स्क्रीन कम, और कमरा थोड़ा ठंडा व अँधेरा रखें।', bodyEn: 'Same sleep time daily, less screen before bed, keep the room cool and dark.' },
  { id: 'l3', tag: 'पानी · Hydration', mins: 1, hi: 'दिन में पानी — कितना और कब', en: 'Water through the day — how much & when', body: 'सुबह उठते ही एक गिलास, हर खाने के साथ थोड़ा, और शाम को ज़्यादा नहीं ताकि नींद न टूटे।', bodyEn: 'A glass on waking, a little with meals, less in the late evening so sleep stays unbroken.' },
];

/** Hindi day-of-week abbreviations (Sun-Sat). */
export const HI_DAY = ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'] as const;

/* ─── Jugnu's spoken lines ──────────────────────────────────────────────────
   Each moment has a few warm, young-female variants so Jugnu never says the
   same thing twice in a row (pickJugnuLine rotates them, never repeating the
   last index). The generator (scripts/generate-jugnu-voice.mjs) renders one
   ElevenLabs clip per variant → /public/voice/<key>-<idx>.mp3; lib/voice.ts
   prefers the clip and falls back to the device's Hindi TTS.

   IMPORTANT for the generator: keep this a plain object literal of strings —
   no references, no template literals — so the build-time parser can read it.
*/
export const momentLines: Record<string, Line[]> = {
  home: [
    { hi: 'शाबाश! दवाई हो गई। अब चलिए, थोड़ी गर्दन खोलते हैं।', en: 'Meds done — let’s loosen the neck next.' },
    { hi: 'वाह, एक काम हो गया! अब बारी है थोड़ी सी हलचल की।', en: 'One thing done! A little movement next.' },
    { hi: 'बढ़िया चल रहे हैं आप। चलिए, अगला छोटा सा कदम।', en: 'You’re doing lovely — one small step more.' },
  ],
  home_alldone: [
    { hi: 'अरे वाह! आज की पूरी राह पूरी हो गई। शाबाश जी! 🎉', en: 'All done for today — wonderful!' },
    { hi: 'क्या बात है! आज सब हो गया। अब आराम कीजिए। 🌼', en: 'Everything’s done today — now rest easy.' },
    { hi: 'पूरा दिन पूरा! मुझे आप पर बहुत गर्व है। ✨', en: 'A full day, complete — I’m so proud of you.' },
  ],
  meds: [
    { hi: 'अगली दवाई दो बजे है। मैं याद दिला दूँगी।', en: 'Next dose at 2 PM. I’ll remind you.' },
    { hi: 'अभी आराम कीजिए — अगली दवाई का ध्यान मैं रखूँगी।', en: 'Rest for now — I’ll watch for the next dose.' },
    { hi: 'दवाई का समय मैं बता दूँगी, आप चिंता मत कीजिए।', en: 'I’ll tell you when it’s time — don’t worry.' },
  ],
  medsTaken: [
    { hi: 'ले ली? बढ़िया। एक और काम पूरा।', en: 'Taken? Lovely — one more done.' },
    { hi: 'शाबाश! दवाई हो गई। मेरा दिल खुश हो गया।', en: 'Well done — meds taken. That makes me happy.' },
    { hi: 'हो गई दवाई! आप अपना कितना अच्छा ख़याल रखते हैं।', en: 'Done! You take such good care of yourself.' },
  ],
  exercise: [
    { hi: 'चलिए, साथ में करते हैं। बिल्कुल आराम से।', en: 'Let’s do it together — nice and slow.' },
    { hi: 'मैं भी आपके साथ हूँ — एकदम धीरे, कोई जल्दी नहीं।', en: 'I’m right here with you — slow, no rush.' },
  ],
  exerciseDone: [
    { hi: 'पूरी हो गई! आपकी पीठ आपको धन्यवाद कहेगी।', en: 'Complete! Your back will thank you.' },
    { hi: 'शाबाश! शरीर थोड़ा हल्का लग रहा होगा ना?', en: 'Well done — feeling a little lighter now?' },
  ],
  log: [
    { hi: 'बस एक टैप — आज दर्द कैसा रहा?', en: 'Just one tap — how was the pain today?' },
    { hi: 'एक छोटा सा सवाल — आज कैसा महसूस हुआ?', en: 'One small question — how did today feel?' },
  ],
  logDone: [
    { hi: 'नोट कर लिया। धीरे-धीरे बेहतर हो रहा है।', en: 'Noted — slowly getting better.' },
    { hi: 'लिख लिया! हर दिन का हिसाब आपकी बहुत मदद करता है।', en: 'Noted! Tracking each day really helps.' },
  ],
  lesson: [
    { hi: 'आइए, आज एक छोटी सी बात बताती हूँ।', en: 'Come, let me share one small thing.' },
    { hi: 'दो मिनट दीजिए — एक प्यारी सी सीख तैयार है।', en: 'Give me two minutes — a sweet little lesson.' },
    { hi: 'चलिए, आज कुछ नया और आसान सीखते हैं।', en: 'Let’s learn something new and easy today.' },
  ],
  dash: [
    { hi: 'इस हफ़्ते की झलक — आप अच्छा कर रहे हैं!', en: 'A peek at this week — you’re doing well!' },
    { hi: 'देखिए ज़रा — इस हफ़्ते की मेहनत रंग ला रही है।', en: 'Look — this week’s effort is paying off.' },
    { hi: 'वाह! हफ़्ता बढ़िया जा रहा है। ऐसे ही चलते रहिए।', en: 'Lovely week so far — keep going just like this.' },
  ],
  chatGreet: [
    { hi: 'नमस्ते! मैं जुगनू। कुछ भी पूछिए — दवाई, दर्द, या आज का प्लान।', en: 'Hi! I’m Jugnu. Ask me anything — meds, pain, or today’s plan.' },
    { hi: 'नमस्ते जी! मैं जुगनू हूँ। बताइए, आज किसमें मदद करूँ?', en: 'Hello! I’m Jugnu. How can I help today?' },
    { hi: 'अरे, आप आ गए! मैं जुगनू। चलिए, कुछ भी पूछिए।', en: 'Oh, you’re here! I’m Jugnu — ask me anything.' },
  ],
};

/**
 * Back-compat single-line view (first variant of each moment), for places that
 * still want one fixed line (e.g. the chat greeting message shape).
 */
export const lines: Record<string, Line> = Object.fromEntries(
  Object.entries(momentLines).map(([k, v]) => [k, v[0]] as [string, Line]),
);

const _lastJugnuLine: Record<string, number> = {};

/**
 * Pick a line variant for a moment, rotating so it never repeats the line it
 * gave last time for the same moment. Mirrors Chaina's pickLine() on the Hindi
 * app. Returns the line plus its index, so the caller can play the matching
 * pre-recorded clip /voice/<key>-<idx>.mp3.
 */
export function pickJugnuLine(key: string): { line: Line; idx: number } {
  const arr = momentLines[key];
  if (!arr || arr.length === 0) return { line: { hi: '', en: '' }, idx: 0 };
  if (arr.length === 1) return { line: arr[0], idx: 0 };
  let i = Math.floor(Math.random() * arr.length);
  if (i === _lastJugnuLine[key]) i = (i + 1) % arr.length;
  _lastJugnuLine[key] = i;
  return { line: arr[i], idx: i };
}

export const chat: ChatItem[] = [
  { q: 'आज क्या-क्या करना है?', qEn: 'What’s on today?', a: 'आज तीन मुख्य काम हैं: सुबह की दवाई (हो गई ✅), गर्दन की एक्सरसाइज़, और दर्द लॉग करना। शाम को एक छोटी सैर। बस इतना!', aEn: 'Three main things: morning meds (done ✅), neck exercise, and logging pain. A short walk in the evening. That’s all!' },
  { q: 'दर्द ज़्यादा है, क्या करूँ?', qEn: 'Pain feels worse — what do I do?', a: 'पहले आराम कीजिए। आज की एक्सरसाइज़ हल्की रखिए — सिर्फ़ गर्दन वाली। अगर दर्द 7 से ऊपर रहे दो दिन, तो मैं डॉक्टर को रिपोर्ट भेजने में मदद करूँगी।', aEn: 'Rest first. Keep today’s exercise light — just the neck part. If pain stays above 7 for two days, I’ll help you send the report to the doctor.' },
  { q: 'अगली दवाई कब है?', qEn: 'When’s my next medicine?', a: 'अगली दवाई — दर्द की — दोपहर 2 बजे, खाने के बाद। मैं 1:55 पर हल्का सा याद दिला दूँगी।', aEn: 'Next up — pain relief — at 2 PM after lunch. I’ll give a gentle reminder at 1:55.' },
  { q: 'इस हफ़्ते कैसा रहा?', qEn: 'How was my week?', a: 'बहुत बढ़िया! 7 में से 6 दिन पूरे, और दर्द पिछले हफ़्ते से 34% कम। 12 दिन की लगातार लय बनी हुई है ✨', aEn: 'Great! 6 of 7 days complete, and pain down 34% from last week. A 12-day streak going strong ✨' },
];
