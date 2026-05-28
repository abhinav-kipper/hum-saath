import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Profile, ProfileInfo } from '../types';
import { PROFILES } from '../data/profiles';
import { getProfile, setProfile as persistProfile } from '../lib/store';

interface ProfileContextValue {
  /** null while loading, then the active profile or null if none chosen */
  profile: Profile | null;
  info: ProfileInfo | null;
  loading: boolean;
  choose: (p: Profile) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const ACCENTS: Record<Profile, [string, string]> = {
  papa: ['var(--terracotta)', 'var(--terracotta-d)'],
  mummy: ['var(--sage)', 'var(--sage-dark)'],
  chunnu: ['var(--indigo)', 'var(--indigo-dark)'],
};

/** Repaint the accent CSS variables to match the active profile. */
function applyAccent(profile: Profile | null) {
  const root = document.documentElement;
  const [accent, dark] = profile
    ? ACCENTS[profile]
    : ['var(--terracotta)', 'var(--terracotta-d)'];
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-dark', dark);
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then((p) => {
      setProfileState(p);
      applyAccent(p);
      setLoading(false);
    });
  }, []);

  const choose = async (p: Profile) => {
    await persistProfile(p);
    setProfileState(p);
    applyAccent(p);
  };

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      info: profile ? PROFILES[profile] : null,
      loading,
      choose,
    }),
    [profile, loading],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
