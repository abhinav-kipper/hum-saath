/* ============================================================
   Dheeru's "moments" — what he says, when.

   Pure line builders. Each moment returns an ordered list of
   SaathiLine; the voice player speaks them in sequence, showing
   each as a caption. A line may carry a `clip` key (a static,
   pre-generated MP3 from voicelines.json) — lines without a clip
   (names, counts) are spoken via live TTS. That's the hybrid.
   ============================================================ */

import type { StreakInfo } from '../../types';
import VL from '../../data/voicelines.json';

export interface SaathiCtx {
  name: string;
  hour: number;
  doneCount: number;
  totalCount: number;
  remaining: number;
  streakStatus: StreakInfo['status'];
}

export interface SaathiLine {
  hi: string;
  en: string;
  /** optional pre-generated MP3 clip key (static lines only). */
  clip?: string;
}

function greetWord(hour: number): { hi: string; en: string } {
  if (hour < 12) return { hi: 'सुप्रभात', en: 'Good morning' };
  if (hour < 17) return { hi: 'नमस्ते', en: 'Good afternoon' };
  return { hi: 'शुभ संध्या', en: 'Good evening' };
}

/** A static, clip-backed line straight from the voiceline catalog. */
function clipLine(key: keyof typeof VL): SaathiLine {
  return { hi: VL[key].hi, en: VL[key].en, clip: key };
}

/** The opening: greet by name, then frame today's plan. */
export function buildOpening(ctx: SaathiCtx): SaathiLine[] {
  const g = greetWord(ctx.hour);
  const lines: SaathiLine[] = [];

  if (ctx.streakStatus === 'welcome') {
    lines.push({
      hi: `${g.hi} ${ctx.name} जी! आप आ गए, धीरू को आपकी याद आ रही थी।`,
      en: `${g.en}, ${ctx.name}! You're back. Dheeru missed you.`,
    });
  } else {
    lines.push({
      hi: `${g.hi} ${ctx.name} जी! धीरू हाज़िर है।`,
      en: `${g.en}, ${ctx.name}! Dheeru is here.`,
    });
  }

  if (ctx.totalCount === 0) {
    lines.push(clipLine('plan_empty'));
  } else if (ctx.doneCount >= ctx.totalCount) {
    lines.push(clipLine('plan_alldone'));
  } else {
    lines.push(clipLine('plan_intro'));
    const r = ctx.remaining;
    lines.push({
      hi: `बस ${r} ${r === 1 ? 'काम' : 'छोटे काम'} बाकी हैं। धीरे-धीरे कर लेंगे।`,
      en: `Just ${r} ${r === 1 ? 'thing' : 'small things'} left. We'll do them slowly.`,
    });
    lines.push(clipLine('encourage_steady'));
  }

  return lines;
}

/** Coach a single exercise: name it, then speak its form cue. */
export function buildExerciseCue(ex: {
  name: string;
  hindiName: string;
  cue: string;
  cueHindi: string;
}): SaathiLine[] {
  return [
    { hi: `${ex.hindiName}।`, en: ex.name },
    { hi: ex.cueHindi, en: ex.cue },
  ];
}

/** Kick off the routine. */
export function buildRoutineStart(): SaathiLine[] {
  return [clipLine('exercise_start')];
}

/** Celebrate finishing the routine. */
export function buildRoutineDone(): SaathiLine[] {
  return [clipLine('exercise_done'), clipLine('encourage_steady')];
}

/* ---- reactions (fired from any screen via reactSaathi) ---- */

/** "{Name} जी, " prefix when we know who we're talking to. */
function ji(name?: string): { hi: string; en: string } {
  return name ? { hi: `${name} जी, `, en: `${name}, ` } : { hi: '', en: '' };
}

export function buildCheckinReaction(p: {
  kind: 'pain' | 'mood' | 'bp';
  name?: string;
  painScore?: number;
  moodScore?: number;
  systolic?: number;
  diastolic?: number;
}): SaathiLine[] {
  const j = ji(p.name);
  if (p.kind === 'pain') {
    const v = p.painScore ?? 0;
    if (v >= 7)
      return [{ hi: `${j.hi}दर्द ज़्यादा लग रहा है। आराम कीजिए, ज़रूरत हो तो डॉक्टर को बताइए।`, en: `${j.en}that looks painful. Please rest.` }];
    if (v <= 3) return [{ hi: `${j.hi}आज दर्द कम है! बढ़िया।`, en: `${j.en}less pain today. Lovely.` }];
    return [{ hi: `${j.hi}दर्ज हो गया। धीरे-धीरे बेहतर होगा।`, en: `${j.en}noted. It will ease, slowly.` }];
  }
  if (p.kind === 'mood') {
    const v = p.moodScore ?? 3;
    if (v >= 4) return [{ hi: `${j.hi}अच्छा मूड! ऐसे ही मुस्कुराते रहिए।`, en: `${j.en}good mood! Keep smiling.` }];
    if (v <= 2) return [{ hi: `${j.hi}आज मन थोड़ा भारी है। कोई बात नहीं, मैं साथ हूँ।`, en: `${j.en}a heavy day. I am with you.` }];
    return [{ hi: `${j.hi}दर्ज हो गया। अपना ख्याल रखिए।`, en: `${j.en}noted. Take care.` }];
  }
  const s = p.systolic ?? 0;
  const d = p.diastolic ?? 0;
  const reading = `${s} बटा ${d}`;
  if (s >= 140 || d >= 90)
    return [{ hi: `${j.hi}बीपी ${reading} है, थोड़ा ज़्यादा। आराम से बैठिए, और ऐसा बना रहे तो डॉक्टर को बताइए।`, en: `${j.en}BP ${s}/${d}, a bit high. Please rest.` }];
  if (s >= 130 || d >= 85)
    return [{ hi: `${j.hi}बीपी ${reading} है, थोड़ा ऊपर। ध्यान रखिए।`, en: `${j.en}BP ${s}/${d}, slightly up. Keep an eye on it.` }];
  return [{ hi: `${j.hi}बीपी ${reading} है, अच्छा है। बढ़िया!`, en: `${j.en}BP ${s}/${d} looks good. Lovely!` }];
}

export function buildAllMedsDone(name?: string): SaathiLine[] {
  const j = ji(name);
  return [{ hi: `${j.hi}सारी दवाई हो गई। शाबाश जी!`, en: `${j.en}all medicines done. Shaabaash!` }];
}

export function buildGardenBloom(flowers: number): SaathiLine[] {
  return [
    { hi: `नया फूल खिल गया! अब ${flowers} हो गए। शाबाश।`, en: `A new flower bloomed. ${flowers} now.` },
  ];
}

export function buildCheerReceived(): SaathiLine[] {
  return [{ hi: 'देखिए, परिवार ने आपको शाबाशी भेजी है!', en: 'Your family sent you a cheer!' }];
}

export function buildStreakMilestone(days: number, name?: string): SaathiLine[] {
  const j = ji(name);
  return [
    { hi: `${j.hi}${days} दिन लगातार! क्या बात है, शाबाश।`, en: `${j.en}${days} days in a row. Kya baat hai!` },
  ];
}

/** Narrate a lesson: a warm opener, then its Hindi gist. */
export function buildLessonNarration(l: {
  spokenHi?: string;
  tryTonight: string;
  tryTonightHindi: string;
  fact?: string;
  title: string;
}): SaathiLine[] {
  const gist = l.spokenHi
    ? { hi: l.spokenHi, en: l.fact ?? l.title }
    : { hi: l.tryTonightHindi, en: l.tryTonight };
  return [clipLine('lesson_intro'), gist];
}
