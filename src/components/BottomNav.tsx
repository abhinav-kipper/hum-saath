import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, BookOpen, ClipboardList } from 'lucide-react';
import styles from './BottomNav.module.css';

const ITEMS = [
  { to: '/', icon: Home, label: 'Today', hindi: 'आज', end: true },
  { to: '/log', icon: ClipboardList, label: 'Log', hindi: 'लॉग' },
  { to: '/trends', icon: TrendingUp, label: 'Trends', hindi: 'प्रगति' },
  { to: '/lessons', icon: BookOpen, label: 'Learn', hindi: 'सीखें' },
];

export default function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Main">
      {ITEMS.map(({ to, icon: Icon, label, hindi, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            isActive ? `${styles.item} ${styles.active}` : styles.item
          }
        >
          <Icon size={26} strokeWidth={2} aria-hidden />
          <span className={styles.label}>{label}</span>
          <span className={styles.hindi}>{hindi}</span>
        </NavLink>
      ))}
    </nav>
  );
}
