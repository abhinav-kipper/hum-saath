/* Warm Hinglish affirmations — one shown per day on the Today screen.
   Replace freely; keep them short and never guilt-y. */

export const AFFIRMATIONS: string[] = [
  'Aaj thoda, kal thoda — sehat aise hi banti hai 🌿',
  'Aap kar rahe ho, yahi sabse badi baat hai 💛',
  'Har chhota kadam mayne rakhta hai',
  'Dheere chalo, par roz chalo',
  'Aaj apne liye 10 minute — bas itna kaafi hai',
  'Khud ka khayal rakhna sabse zaroori hai',
  'Aapki mehnat dikh rahi hai — shaabaash!',
  'Ek waqt mein ek kaam — aaram se',
];

function dayNumber(d: Date = new Date()): number {
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor(local.getTime() / 86_400_000);
}

export function todayAffirmation(d: Date = new Date()): string {
  const i = ((dayNumber(d) % AFFIRMATIONS.length) + AFFIRMATIONS.length) % AFFIRMATIONS.length;
  return AFFIRMATIONS[i];
}
