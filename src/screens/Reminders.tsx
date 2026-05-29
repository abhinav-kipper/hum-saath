import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, Plus, Trash2, Check } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import {
  getReminders,
  updateReminder,
  removeReminder,
  addCustomReminder,
  reminderMeta,
  type Reminder,
} from '../lib/reminders';
import {
  notificationsSupported,
  notificationPermission,
  requestNotificationPermission,
  showNotification,
} from '../lib/notify';
import styles from './Reminders.module.css';

export default function Reminders() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [list, setList] = useState<Reminder[]>([]);
  const [perm, setPerm] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (profile) setList(getReminders(profile));
    setPerm(notificationPermission());
  }, [profile]);

  if (!profile) return null;

  const set = (id: string, patch: Partial<Reminder>) =>
    setList(updateReminder(profile, id, patch));
  const remove = (id: string) => setList(removeReminder(profile, id));
  const add = () => setList(addCustomReminder(profile));

  const askPermission = async () => {
    const p = await requestNotificationPermission();
    setPerm(p);
    if (p === 'granted') {
      showNotification('🔔 Reminders are on', 'We’ll give a gentle nudge at the right time.');
    }
  };

  const supported = notificationsSupported();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate('/')}
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className={styles.title}>
          Reminders <span className={styles.titleHindi}>याद दिलाएँ</span>
        </h1>
      </header>

      {/* permission */}
      {!supported ? (
        <div className={styles.permCard}>
          <p className={styles.permText}>
            This device can’t show notifications, but reminders still pop up
            gently inside the app when it’s open.
          </p>
        </div>
      ) : perm === 'granted' ? (
        <div className={`${styles.permCard} ${styles.permOn}`}>
          <Bell size={22} aria-hidden />
          <div>
            <p className={styles.permTitle}>Reminders are on</p>
            <button type="button" className={styles.testBtn} onClick={() => showNotification('🔔 Test reminder', 'This is what a nudge looks like.')}>
              Send a test
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className={styles.permBtn} onClick={askPermission}>
          <BellOff size={20} aria-hidden />
          Turn on gentle reminders
          <span className={styles.permBtnHindi}>नोटिफ़िकेशन चालू करें</span>
        </button>
      )}

      <p className={styles.note}>
        Set a time and, if you like, tie it to something you already do — like
        “after morning chai”. That anchor shows on your Today screen too.
      </p>

      <div className={styles.list}>
        {list.map((r) => {
          const meta = reminderMeta(r, profile);
          return (
            <div key={r.id} className={`${styles.row} ${r.enabled ? '' : styles.off}`}>
              <div className={styles.rowTop}>
                <span className={styles.emoji} aria-hidden>
                  {meta.emoji}
                </span>
                {r.kind === 'custom' ? (
                  <input
                    className={styles.labelInput}
                    value={r.label ?? ''}
                    placeholder="e.g. Call the kids"
                    onChange={(e) => set(r.id, { label: e.target.value })}
                  />
                ) : (
                  <span className={styles.label}>{meta.title}</span>
                )}
                <button
                  type="button"
                  role="switch"
                  aria-checked={r.enabled}
                  className={`${styles.toggle} ${r.enabled ? styles.toggleOn : ''}`}
                  onClick={() => set(r.id, { enabled: !r.enabled })}
                  aria-label={r.enabled ? 'Turn off' : 'Turn on'}
                >
                  <span className={styles.knob} />
                </button>
              </div>

              <div className={styles.rowFields}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Time</span>
                  <input
                    className={styles.timeInput}
                    type="time"
                    value={r.time}
                    onChange={(e) => set(r.id, { time: e.target.value })}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>After… (optional)</span>
                  <input
                    className={styles.anchorInput}
                    value={r.anchor ?? ''}
                    placeholder="morning chai"
                    onChange={(e) => set(r.id, { anchor: e.target.value })}
                  />
                </label>
                {r.kind === 'custom' && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => remove(r.id)}
                    aria-label="Remove reminder"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button type="button" className={styles.addBtn} onClick={add}>
        <Plus size={20} aria-hidden /> Add a reminder
      </button>

      <p className={styles.fineprint}>
        <Check size={14} aria-hidden /> Nudges appear when you open the app and,
        with notifications on, while it’s running. For alerts when the app is
        fully closed, this needs a push setup later.
      </p>
    </div>
  );
}
