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
  MetricRing,
  MetricTile,
  Adherence,
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

/** Day-clock doses. `ang` places each on the 24-hour dial. */
export const meds: Dose[] = [
  { id: 'd1', ang: -90, time: '8:00 AM', hi: 'BP की दवाई', en: 'Amlodipine 5mg', sub: 'खाने के बाद · after food', color: 'var(--gold)', taken: true },
  { id: 'd2', ang: -18, time: '9:00 AM', hi: 'विटामिन D', en: 'Vitamin D3', sub: 'दूध के साथ · with milk', color: 'var(--coral)', taken: true },
  { id: 'd3', ang: 54, time: '2:00 PM', hi: 'दर्द की दवाई', en: 'Pain relief', sub: 'खाने के बाद · after lunch', color: 'var(--peri)', taken: false, next: true },
  { id: 'd4', ang: 128, time: '7:00 PM', hi: 'थायराइड', en: 'Thyronorm 50', sub: 'खाली पेट · empty stomach', color: 'var(--mint)', taken: false },
  { id: 'd5', ang: 200, time: '10:00 PM', hi: 'रात की दवाई', en: 'Night dose', sub: 'सोने से पहले · before bed', color: 'var(--rose)', taken: false },
];

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

export const metrics: {
  rings: MetricRing[];
  tiles: MetricTile[];
  bp: number[];
  bpDays: string[];
  adherence: Adherence[];
  streak: number;
  daysKept: number;
  painDrop: number;
} = {
  rings: [
    { key: 'move', hi: 'हलचल', en: 'Move', pct: 0.82, color: 'var(--coral)' },
    { key: 'meds', hi: 'दवाई', en: 'Meds', pct: 0.66, color: 'var(--gold)' },
    { key: 'mind', hi: 'मन', en: 'Calm', pct: 0.9, color: 'var(--mint)' },
  ],
  tiles: [
    { icon: 'heart', color: 'var(--coral)', hi: 'रक्तचाप', en: 'BLOOD PRESSURE', val: '124/82', unit: '', foot: '↓ सामान्य · normal' },
    { icon: 'foot', color: 'var(--mint)', hi: 'कदम', en: 'STEPS', val: '3.4k', unit: 'आज', foot: 'लक्ष्य 4,000' },
    { icon: 'drop', color: 'var(--peri)', hi: 'दर्द', en: 'PAIN', val: '3', unit: '/10', foot: '↓ कल से बेहतर' },
    { icon: 'moon', color: 'var(--rose)', hi: 'नींद', en: 'SLEEP', val: '7.2', unit: 'घंटे', foot: 'अच्छी नींद' },
  ],
  bp: [120, 128, 122, 118, 124, 116, 121],
  bpDays: ['सो', 'मं', 'बु', 'गु', 'शु', 'श', 'र'],
  adherence: [
    { hi: 'दवाई', en: 'Medicines', p: 0.92, color: 'var(--gold-d)' },
    { hi: 'व्यायाम', en: 'Exercise', p: 0.78, color: 'var(--coral)' },
    { hi: 'सैर', en: 'Walking', p: 0.6, color: 'var(--mint-d)' },
  ],
  streak: 12,
  daysKept: 31,
  painDrop: 34,
};

export const lines: Record<string, Line> = {
  home: { hi: 'शाबाश! दवाई हो गई। अब चलिए, थोड़ी गर्दन खोलते हैं।', en: 'Meds done — let’s loosen the neck next.' },
  home_alldone: { hi: 'अरे वाह! आज की पूरी राह पूरी हो गई। शाबाश जी! 🎉', en: 'All done for today — wonderful!' },
  meds: { hi: 'अगली दवाई दो बजे है। मैं याद दिला दूँगा।', en: 'Next dose at 2 PM. I’ll remind you.' },
  medsTaken: { hi: 'ले ली? बढ़िया। एक और काम पूरा।', en: 'Taken? Lovely — one more done.' },
  exercise: { hi: 'चलिए, साथ में करते हैं। बिल्कुल आराम से।', en: 'Let’s do it together — nice and slow.' },
  exerciseDone: { hi: 'पूरी हो गई! आपकी पीठ आपको धन्यवाद कहेगी।', en: 'Complete! Your back will thank you.' },
  log: { hi: 'बस एक टैप — आज दर्द कैसा रहा?', en: 'Just one tap — how was the pain today?' },
  logDone: { hi: 'नोट कर लिया। धीरे-धीरे बेहतर हो रहा है।', en: 'Noted — slowly getting better.' },
  lesson: { hi: 'आइए, आज एक छोटी सी बात बताता हूँ।', en: 'Come, let me share one small thing.' },
  dash: { hi: 'इस हफ़्ते की झलक — आप अच्छा कर रहे हैं!', en: 'A peek at this week — you’re doing well!' },
  chatGreet: { hi: 'नमस्ते! मैं जुगनू। कुछ भी पूछिए — दवाई, दर्द, या आज का प्लान।', en: 'Hi! I’m Jugnu. Ask me anything — meds, pain, or today’s plan.' },
};

export const chat: ChatItem[] = [
  { q: 'आज क्या-क्या करना है?', qEn: 'What’s on today?', a: 'आज तीन मुख्य काम हैं: सुबह की दवाई (हो गई ✅), गर्दन की एक्सरसाइज़, और दर्द लॉग करना। शाम को एक छोटी सैर। बस इतना!', aEn: 'Three main things: morning meds (done ✅), neck exercise, and logging pain. A short walk in the evening. That’s all!' },
  { q: 'दर्द ज़्यादा है, क्या करूँ?', qEn: 'Pain feels worse — what do I do?', a: 'पहले आराम कीजिए। आज की एक्सरसाइज़ हल्की रखिए — सिर्फ़ गर्दन वाली। अगर दर्द 7 से ऊपर रहे दो दिन, तो मैं डॉक्टर को रिपोर्ट भेजने में मदद करूँगा।', aEn: 'Rest first. Keep today’s exercise light — just the neck part. If pain stays above 7 for two days, I’ll help you send the report to the doctor.' },
  { q: 'अगली दवाई कब है?', qEn: 'When’s my next medicine?', a: 'अगली दवाई — दर्द की — दोपहर 2 बजे, खाने के बाद। मैं 1:55 पर हल्का सा याद दिला दूँगा।', aEn: 'Next up — pain relief — at 2 PM after lunch. I’ll give a gentle reminder at 1:55.' },
  { q: 'इस हफ़्ते कैसा रहा?', qEn: 'How was my week?', a: 'बहुत बढ़िया! 7 में से 6 दिन पूरे, और दर्द पिछले हफ़्ते से 34% कम। 12 दिन की लगातार लय बनी हुई है ✨', aEn: 'Great! 6 of 7 days complete, and pain down 34% from last week. A 12-day streak going strong ✨' },
];
