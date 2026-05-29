import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { PROFILE_LIST } from '../data/profiles';
import type { Profile } from '../types';
import styles from './Onboarding.module.css';

export default function Onboarding() {
  const { choose } = useProfile();
  const navigate = useNavigate();

  const pick = async (id: Profile) => {
    await choose(id);
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden>
          <Heart size={26} strokeWidth={2.5} />
        </span>
        <h1 className={styles.title}>
          Saath <span className={styles.titleHindi}>साथ</span>
        </h1>
        <p className={styles.tagline}>
          A little health, together. Every day.
          <br />
          <span className="hindi">रोज़ थोड़ी सेहत, साथ मिलकर।</span>
        </p>
      </div>

      <h2 className={styles.q}>
        Who is this for?
        <span className="hindi"> · यह किसके लिए है?</span>
      </h2>

      <div className={styles.choices}>
        {PROFILE_LIST.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`${styles.choice} ${styles[p.accent]}`}
            onClick={() => pick(p.id)}
          >
            <span className={styles.avatar} aria-hidden>
              {p.name[0]}
            </span>
            <span className={styles.choiceText}>
              <span className={styles.choiceName}>
                {p.name} <span className={styles.choiceNameHindi}>{p.nameHindi}</span>
              </span>
              <span className={styles.choiceFocus}>
                {p.focus} · {p.focusHindi}
              </span>
            </span>
          </button>
        ))}
      </div>

      <p className={styles.note}>
        You can switch anytime.
        <span className="hindi"> कभी भी बदल सकते हैं।</span>
      </p>
    </div>
  );
}
