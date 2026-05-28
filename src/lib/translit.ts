/* A small English→Hindi helper for the medicine editor. It covers the
   common terms a family will actually type; arbitrary brand names need a
   real transliteration service (a // TODO v2 — could use the Claude API),
   so this returns null when it can't help rather than guessing garbage. */

const DICT: Record<string, string> = {
  thyroid: 'थायराइड',
  thyronorm: 'थायरोनॉर्म',
  tablet: 'टैबलेट',
  tab: 'टैबलेट',
  bp: 'बीपी',
  blood: 'ब्लड',
  pressure: 'प्रेशर',
  antidepressant: 'एंटीडिप्रेसेंट',
  vitamin: 'विटामिन',
  calcium: 'कैल्शियम',
  iron: 'आयरन',
  sugar: 'शुगर',
  diabetes: 'डायबिटीज़',
  insulin: 'इंसुलिन',
  capsule: 'कैप्सूल',
  syrup: 'सिरप',
  medicine: 'दवाई',
  morning: 'सुबह',
  night: 'रात',
};

/** Returns a Hindi suggestion, or null if no known word was found. */
export function suggestHindi(english: string): string | null {
  const words = english.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  let matched = false;
  const out = words.map((w) => {
    const key = w.replace(/[^a-z]/g, '');
    if (DICT[key]) {
      matched = true;
      return DICT[key];
    }
    return w;
  });
  return matched ? out.join(' ') : null;
}
