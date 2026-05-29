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
      hi: `${g.hi} ${ctx.name} जी! वापसी पर स्वागत है — धीरू को आपकी याद आ रही थी।`,
      en: `${g.en}, ${ctx.name}! Welcome back — Dheeru missed you.`,
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
