/* Warm Hinglish affirmations — one shown per day on the Today screen.
   Replace freely; keep them short and never guilt-y. */

export const AFFIRMATIONS: string[] = [
  'Aaj ke liye bas itna kaafi hai 🌿',
  'Thoda sa bhi kar liya, toh badi baat hai 💛',
  'Jaldi kuch nahi — bas roz thoda thoda',
  'Aaj apne liye thoda waqt nikaal lo',
  'Ek kaam, aaram se — sab ek saath nahi',
  'Saans lo, phir shuru karte hain',
  'Itni door aa gaye — shaabaash 👏',
  'Mann na ho tab bhi, 5 minute try kar lo',
];

function dayNumber(d: Date = new Date()): number {
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor(local.getTime() / 86_400_000);
}

export function todayAffirmation(d: Date = new Date()): string {
  const i = ((dayNumber(d) % AFFIRMATIONS.length) + AFFIRMATIONS.length) % AFFIRMATIONS.length;
  return AFFIRMATIONS[i];
}
