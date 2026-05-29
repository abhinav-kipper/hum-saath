import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Pill,
  HeartPulse,
  Footprints,
  Bell,
  X,
  Clock,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { getLog, getMedLogs, listMedicines } from '../lib/store';
import { checkinKind } from '../lib/checkin';
import {
  getReminders,
  getDayState,
  pendingReminders,
  reminderMeta,
  reminderRoute,
  dismissReminder,
  snoozeReminder,
  markNotified,
  type Reminder,
  type ReminderKind,
} from '../lib/reminders';
import { showNotification } from '../lib/notify';
import { playSound } from '../lib/sounds';
import styles from './ReminderBanner.module.css';

type DoneMap = Record<ReminderKind, boolean>;
const NONE_DONE: DoneMap = {
  movement: false,
  medicines: false,
  checkin: false,
  walk: false,
  custom: false,
};

function KindIcon({ kind }: { kind: ReminderKind }) {
  const size = 24;
  if (kind === 'movement') return <Dumbbell size={size} aria-hidden />;
  if (kind === 'medicines') return <Pill size={size} aria-hidden />;
  if (kind === 'checkin') return <HeartPulse size={size} aria-hidden />;
  if (kind === 'walk') return <Footprints size={size} aria-hidden />;
  return <Bell size={size} aria-hidden />;
}

export default function ReminderBanner() {
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [done, setDone] = useState<DoneMap>(NONE_DONE);
  const [now, setNow] = useState(() => new Date());
  const [version, setVersion] = useState(0); // bump to re-evaluate after dismiss/snooze

  const refresh = useCallback(async () => {
    if (!profile) return;
    setReminders(getReminders(profile));
    const [log, medLogs, meds] = await Promise.all([
      getLog(profile),
      getMedLogs(profile),
      listMedicines(profile),
    ]);
    const kind = checkinKind(profile);
    const checkin =
      kind === 'pain'
        ? typeof log?.painScore === 'number'
        : kind === 'mood'
          ? typeof log?.moodScore === 'number'
          : typeof log?.systolic === 'number';
    setDone({
      movement: Boolean(log?.exerciseDone),
      walk: Boolean(log?.walked),
      checkin,
      medicines: meds.length > 0 && medLogs.length >= meds.length,
      custom: false,
    });
  }, [profile]);

  // Reload reminders + done-state on profile change, navigation, and re-eval bumps.
  useEffect(() => {
    refresh();
  }, [refresh, location.pathname, version]);

  // Re-check the clock every minute and when the app regains focus.
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        setNow(new Date());
        refresh();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      clearInterval(tick);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [refresh]);

  const state = profile ? getDayState(profile) : null;
  const pending =
    profile && state
      ? pendingReminders(reminders, state, now, (k) => done[k])
      : [];
  const current = pending[0];

  // Fire a one-time OS notification when a reminder first becomes due.
  useEffect(() => {
    if (!profile || !current) return;
    const s = getDayState(profile);
    if (!s.notified.includes(current.id)) {
      const meta = reminderMeta(current, profile);
      showNotification(`${meta.emoji} ${meta.title}`, current.anchor?.trim() || meta.hindi);
      markNotified(profile, current.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, current?.id]);

  if (!profile || !current) return null;

  const meta = reminderMeta(current, profile);
  const route = reminderRoute(current.kind);
  const isCustom = current.kind === 'custom';

  const act = () => {
    playSound('tap');
    dismissReminder(profile, current.id);
    if (!isCustom) navigate(route);
    setVersion((v) => v + 1);
  };
  const later = () => {
    snoozeReminder(profile, current.id, 30);
    setVersion((v) => v + 1);
  };
  const close = () => {
    dismissReminder(profile, current.id);
    setVersion((v) => v + 1);
  };

  return (
    <div className={styles.wrap} role="status">
      <div className={styles.icon} aria-hidden>
        <KindIcon kind={current.kind} />
      </div>
      <div className={styles.text}>
        <span className={styles.title}>{meta.title}</span>
        <span className={styles.sub}>{current.anchor?.trim() || meta.hindi}</span>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.act} onClick={act}>
          {isCustom ? 'Got it' : 'Do it'}
        </button>
        <button type="button" className={styles.later} onClick={later} aria-label="Remind me later">
          <Clock size={16} aria-hidden /> Later
        </button>
      </div>
      <button type="button" className={styles.close} onClick={close} aria-label="Dismiss">
        <X size={18} aria-hidden />
      </button>
    </div>
  );
}
