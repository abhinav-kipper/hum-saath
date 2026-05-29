import { useState, type ReactNode } from 'react';
import { Heart, Dumbbell, Sprout } from 'lucide-react';
import styles from './FirstRunGuide.module.css';

interface Step {
  icon: ReactNode;
  title: string;
  en: string;
  hi: string;
}

const STEPS: Step[] = [
  {
    icon: <Heart size={34} strokeWidth={2.4} />,
    title: 'Welcome to Saath',
    en: 'One small thing for your health, every day. Bas itna.',
    hi: 'रोज़ थोड़ी सेहत, बस इतना।',
  },
  {
    icon: <Dumbbell size={34} strokeWidth={2.4} />,
    title: 'Move & check in',
    en: 'Do today’s short routine, then log how you feel and your walk.',
    hi: 'आज की एक्सरसाइज़ करें, फिर दर्द/बीपी और वॉक दर्ज करें।',
  },
  {
    icon: <Sprout size={34} strokeWidth={2.4} />,
    title: 'Watch it grow',
    en: 'Dheeru cheers you on, your garden grows, and you can share the day with family.',
    hi: 'धीरू साथ देगा, बगीचा खिलेगा, और परिवार को अपडेट भेजें।',
  },
];

export default function FirstRunGuide({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.skip} onClick={onDone}>
        Skip
      </button>

      <div className={styles.card}>
        <span className={styles.icon} aria-hidden>
          {s.icon}
        </span>
        <h1 className={styles.title}>{s.title}</h1>
        <p className={styles.en}>{s.en}</p>
        <p className={styles.hi}>{s.hi}</p>
      </div>

      <div className={styles.dots} aria-hidden>
        {STEPS.map((_, i) => (
          <i key={i} className={i === step ? styles.dotOn : styles.dot} />
        ))}
      </div>

      <button
        type="button"
        className={styles.btn}
        onClick={() => (last ? onDone() : setStep((n) => n + 1))}
      >
        {last ? 'Start · शुरू करें' : 'Next · आगे'}
      </button>
    </div>
  );
}
