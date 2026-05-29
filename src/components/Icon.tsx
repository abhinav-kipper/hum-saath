import type { CSSProperties } from 'react';
import {
  Home, Activity, Pill, LineChart, BookOpen, Mic, Play, Check,
  ChevronRight, ChevronLeft, Heart, Sparkles, Sun, Moon, Droplet,
  Footprints, Bell, Plus, Minus, User, Flame, Leaf, Pencil,
  GripVertical, X, Video, Volume2, VolumeX, Smile, Phone,
  type LucideIcon,
} from 'lucide-react';
import type { IconName } from '../types';

const MAP: Record<IconName, LucideIcon> = {
  home: Home, activity: Activity, pill: Pill, chart: LineChart, book: BookOpen,
  mic: Mic, play: Play, check: Check, chevR: ChevronRight, chevL: ChevronLeft,
  heart: Heart, spark: Sparkles, sun: Sun, moon: Moon, drop: Droplet, water: Droplet,
  foot: Footprints, bell: Bell, plus: Plus, minus: Minus, user: User, flame: Flame,
  leaf: Leaf, edit: Pencil, grip: GripVertical, x: X, video: Video, sound: Volume2,
  mute: VolumeX, smile: Smile, phone: Phone,
};

export default function Icon({
  name,
  size = 24,
  sw = 2,
  color = 'currentColor',
  fill = 'none',
  style,
}: {
  name: IconName;
  size?: number;
  sw?: number;
  color?: string;
  fill?: string;
  style?: CSSProperties;
}) {
  const C = MAP[name];
  return <C size={size} strokeWidth={sw} color={color} fill={fill} style={style} aria-hidden />;
}
