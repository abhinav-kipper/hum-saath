/* Core domain types for the Jugnu redesign. */

export type ProfileId = 'papa' | 'mummy' | 'chunnu';
export type NodeKind = 'meds' | 'exercise' | 'log' | 'lesson';

export type IconName =
  | 'home' | 'activity' | 'pill' | 'chart' | 'book' | 'mic' | 'play'
  | 'check' | 'chevR' | 'chevL' | 'heart' | 'spark' | 'sun' | 'moon'
  | 'drop' | 'foot' | 'bell' | 'plus' | 'user' | 'flame' | 'leaf'
  | 'edit' | 'grip' | 'minus' | 'x' | 'video' | 'sound' | 'mute'
  | 'water' | 'smile' | 'phone';

export interface Profile {
  id: ProfileId;
  name: string;
  en: string;
  focus: string;
  focusEn: string;
  accent: string;
  accentD: string;
  grad: string;
  region: string;
}

/** A task on the day's trail. `kind` routes to a screen. */
export interface Node {
  id: string;
  kind: NodeKind;
  icon: IconName;
  hi: string;
  en: string;
  /** for tasks added from the palette — the palette id */
  baseId?: string;
  measure?: boolean;
  confirm?: boolean;
}

export interface Dose {
  id: string;
  /** angle on the day-clock dial (degrees) */
  ang: number;
  time: string;
  hi: string;
  en: string;
  sub: string;
  color: string;
  taken?: boolean;
  next?: boolean;
}

export interface ExerciseStep {
  hi: string;
  en: string;
  secs: number;
  region: string;
}

export interface Exercise {
  title: string;
  titleEn: string;
  region: string;
  videoId: string;
  steps: ExerciseStep[];
}

export interface Lesson {
  id: string;
  tag: string;
  mins: number;
  hi: string;
  en: string;
  body: string;
  bodyEn: string;
}

export interface Line {
  hi: string;
  en?: string;
}

export interface ChatItem {
  q: string;
  qEn: string;
  a: string;
  aEn: string;
}

export interface MetricRing {
  key: string;
  hi: string;
  en: string;
  pct: number;
  color: string;
}

export interface MetricTile {
  icon: IconName;
  color: string;
  hi: string;
  en: string;
  val: string;
  unit: string;
  foot: string;
}

export interface Adherence {
  hi: string;
  en: string;
  p: number;
  color: string;
}

/** Everything persisted (localStorage now, Supabase-swappable behind store.ts). */
export interface AppState {
  entered: boolean;
  sound: boolean;
  profileId: ProfileId;
  plans: Record<ProfileId, Node[]>;
  doneBy: Record<string, string[]>;
  medsBy: Record<string, string[]>;
}
