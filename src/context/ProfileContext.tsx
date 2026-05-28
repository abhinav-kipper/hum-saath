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

/** Repaint the accent CSS variables to match the active profile. */
function applyAccent(profile: Profile | null) {
  const root = document.documentElement;
  const sage = profile === 'mummy';
  root.style.setProperty('--accent', sage ? 'var(--sage)' : 'var(--terracotta)');
  root.style.setProperty(
    '--accent-dark',
    sage ? 'var(--sage-dark)' : 'var(--terracotta-d)',
  );
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
