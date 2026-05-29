import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import ReminderBanner from './ReminderBanner';
import SaathiReactions from './SaathiReactions';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  return (
    <div className={styles.shell}>
      <ReminderBanner />
      <main className={styles.main}>
        <Outlet />
      </main>
      <SaathiReactions />
      <BottomNav />
    </div>
  );
}
