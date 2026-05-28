import { Routes, Route, Navigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useProfile } from './context/ProfileContext';
import { isSupabaseConfigured, getHousehold } from './lib/store';
import AppLayout from './components/AppLayout';
import Onboarding from './screens/Onboarding';
import HouseholdSetup from './screens/HouseholdSetup';
import Today from './screens/Today';
import ExercisePlayer from './screens/ExercisePlayer';
import Log from './screens/Log';
import Trends from './screens/Trends';
import Lessons from './screens/Lessons';
import Medicines from './screens/Medicines';
import styles from './App.module.css';

function Splash() {
  return (
    <div className={styles.splash}>
      <span className={styles.logo} aria-hidden>
        <Heart size={26} strokeWidth={2.5} />
      </span>
      <span className={styles.word}>Saath</span>
    </div>
  );
}

export default function App() {
  const { loading, profile } = useProfile();

  if (loading) return <Splash />;

  // When the cloud is configured, ask for the shared family code once.
  if (isSupabaseConfigured() && !getHousehold()) return <HouseholdSetup />;

  if (!profile) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/exercise" element={<ExercisePlayer />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Today />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/log" element={<Log />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/lessons" element={<Lessons />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
