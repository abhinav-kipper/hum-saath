/* Which daily check-in a profile uses. */
import type { Profile } from '../types';

export type CheckinKind = 'pain' | 'bp' | 'mood';

export function checkinKind(profile: Profile): CheckinKind {
  if (profile === 'mummy') return 'bp';
  if (profile === 'chunnu') return 'mood';
  return 'pain';
}
