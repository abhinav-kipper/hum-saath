import { useEffect, useState } from 'react';
import { Pill, Clock, Check, Send } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { getMedicines } from '../data/medicines';
import { getMedLogs, markMedTaken, unmarkMedTaken } from '../lib/store';
import { shareOnWhatsApp } from '../lib/share';
import { composeMedsUpdate } from '../lib/dailyUpdate';
import type { MedLog } from '../types';
import styles from './Medicines.module.css';

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function Medicines() {
  const { profile, info } = useProfile();
  const [taken, setTaken] = useState<Record<string, MedLog>>({});

  const reload = async () => {
    if (!profile) return;
    const logs = await getMedLogs(profile);
    const map: Record<string, MedLog> = {};
    logs.forEach((l) => {
      map[l.medId] = l;
    });
    setTaken(map);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  if (!profile || !info) return null;
  const meds = getMedicines(profile);

  const toggle = async (medId: string) => {
    if (taken[medId]) await unmarkMedTaken(profile, medId);
    else await markMedTaken(profile, medId);
    await reload();
  };

  const buildSummary = (): string => {
    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
    const medStatus = meds.map((m) => ({
      name: m.name,
      takenAt: taken[m.id]?.takenAt,
    }));
    return composeMedsUpdate(info.name, dateStr, medStatus);
  };

  const anyTaken = meds.some((m) => taken[m.id]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Medicines <span className={styles.titleHindi}>दवाइयाँ</span>
        </h1>
        <p className={styles.sub}>Tap when taken — then share to the family group.</p>
      </header>

      {meds.length === 0 ? (
        <div className={styles.empty}>
          <Pill size={38} aria-hidden />
          <p className={styles.emptyTitle}>No medicines added</p>
          <p className={styles.emptySub}>
            Add them in <code>src/data/medicines.ts</code>.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {meds.map((m) => {
              const done = Boolean(taken[m.id]);
              return (
                <div
                  key={m.id}
                  className={`${styles.card} ${done ? styles.cardDone : ''}`}
                >
                  <div className={styles.info}>
                    <div className={styles.nameRow}>
                      <span className={styles.name}>{m.name}</span>
                      <span className={styles.nameHindi}>{m.hindiName}</span>
                    </div>
                    <div className={styles.metaRow}>
                      <Clock size={15} aria-hidden />
                      <span>{m.time}</span>
                      <span className={styles.dot}>·</span>
                      <span>{m.note}</span>
                    </div>
                    <div className={styles.noteHindi}>{m.noteHindi}</div>
                    {done && (
                      <div className={styles.takenAt}>
                        Taken at {fmtTime(taken[m.id].takenAt)} · ली गई
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`${styles.takeBtn} ${done ? styles.takeBtnDone : ''}`}
                    onClick={() => toggle(m.id)}
                    aria-pressed={done}
                  >
                    {done ? (
                      <>
                        <Check size={22} strokeWidth={3} />
                        <span>Taken</span>
                      </>
                    ) : (
                      <span>Took it · ली</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className={styles.shareBtn}
            onClick={() => shareOnWhatsApp(buildSummary())}
            disabled={!anyTaken}
          >
            <Send size={20} aria-hidden />
            Share update on WhatsApp
          </button>
          <p className={styles.shareNote}>
            Opens WhatsApp with the message ready — just pick the group.
            <span className="hindi"> ग्रुप चुनकर भेजें।</span>
          </p>
        </>
      )}
    </div>
  );
}
