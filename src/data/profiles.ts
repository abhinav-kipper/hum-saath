import type { Profile, ProfileInfo } from '../types';

export const PROFILES: Record<Profile, ProfileInfo> = {
  papa: {
    id: 'papa',
    name: 'Papa',
    nameHindi: 'पापा',
    focus: 'Back & sciatica care',
    focusHindi: 'पीठ और साइटिका',
    accent: 'terracotta',
  },
  mummy: {
    id: 'mummy',
    name: 'Mummy',
    nameHindi: 'मम्मी',
    focus: 'BP & thyroid care',
    focusHindi: 'बीपी और थायराइड',
    accent: 'sage',
  },
};

export const PROFILE_LIST: ProfileInfo[] = [PROFILES.papa, PROFILES.mummy];
