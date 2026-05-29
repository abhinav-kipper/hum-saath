import { useEffect, useRef, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { PROFILE_LIST } from '../data/profiles';
import { getCheers, sendCheer } from '../lib/store';
import { playSound } from '../lib/sounds';
import { reactSaathi } from '../lib/saathi/react';
import { buildCheerReceived } from '../lib/saathi/moments';
import { CHEER_EMOJIS, type Cheer, type ProfileInfo } from '../types';
import styles from './FamilyCheers.module.css';

export default function FamilyCheers() {
  const { profile, info } = useProfile();
  const [received, setReceived] = useState<Cheer[]>([]);
  const [emoji, setEmoji] = useState<string>(CHEER_EMOJIS[0]);
  const [sentMsg, setSentMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!profile) return;
    getCheers(profile).then((cs) => {
      setReceived(cs);
      if (cs.length === 0) return;
      const key = `saath.cheerSeen.${profile}`;
      if (sessionStorage.getItem(key) !== String(cs.length)) {
        sessionStorage.setItem(key, String(cs.length));
        // Delay so it follows Dheeru's opening greeting on Today.
        setTimeout(() => reactSaathi(buildCheerReceived()), 3500);
      }
    });
  }, [profile]);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!profile || !info) return null;
  const others = PROFILE_LIST.filter((p) => p.id !== profile);

  const send = async (target: ProfileInfo) => {
    await sendCheer(info.name, target.id, emoji);
    playSound('cheer');
    setSentMsg(`Sent ${emoji} to ${target.name}!`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSentMsg(null), 2800);
  };

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>
        Family <span className="hindi">· परिवार</span>
      </h2>

      {received.length > 0 && (
        <div className={styles.received}>
          <p className={styles.receivedHead}>
            Cheers for you today <span className="hindi">· आज की शाबाशी</span>
          </p>
          <ul className={styles.cheerList}>
            {received.map((c) => (
              <li key={c.id} className={styles.cheerItem}>
                <span className={styles.cheerEmoji} aria-hidden>
                  {c.emoji}
                </span>
                <span className={styles.cheerFrom}>{c.fromName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className={styles.sendHead}>
        Send a cheer <span className="hindi">· शाबाशी भेजें</span>
      </p>
      <div className={styles.emojiRow} role="group" aria-label="Pick a cheer">
        {CHEER_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            className={`${styles.emojiBtn} ${e === emoji ? styles.emojiOn : ''}`}
            onClick={() => setEmoji(e)}
            aria-pressed={e === emoji}
            aria-label={`Cheer ${e}`}
          >
            {e}
          </button>
        ))}
      </div>

      <div className={styles.targets}>
        {others.map((p) => (
          <button
            key={p.id}
            type="button"
            className={styles.target}
            onClick={() => send(p)}
          >
            <span className={styles.targetAvatar} aria-hidden>
              {p.name[0]}
            </span>
            Cheer {p.name}
          </button>
        ))}
      </div>

      {sentMsg && (
        <p className={styles.sent} role="status">
          {sentMsg}
        </p>
      )}
    </section>
  );
}
