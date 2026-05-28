import { useState } from 'react';
import { Moon } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { lessonsFor, todayLesson, type Lesson } from '../data/lessons';
import styles from './Lessons.module.css';

function emojiFor(l: Lesson): string {
  const t = l.title.toLowerCase();
  const map: [string, string][] = [
    ['sona', '🛏️'],
    ['neend', '🛏️'],
    ['dawai', '💊'],
    ['thyroid', '💊'],
    ['goli', '💊'],
    ['antidepressant', '💊'],
    ['namak', '🧂'],
    ['protein', '🥚'],
    ['chaal', '🚶'],
    ['walk', '🚶'],
    ['hilna', '🏃'],
    ['baith', '🪑'],
    ['sciatica', '🌿'],
    ['barf', '🧊'],
    ['sikaai', '🔥'],
    ['paani', '💧'],
    ['potassium', '🍌'],
    ['mood', '🌼'],
    ['mann', '🌼'],
    ['din', '🎉'],
    ['bure', '🤍'],
  ];
  for (const [k, e] of map) if (t.includes(k)) return e;
  const cycle = ['🌱', '✨', '💛', '🌿', '☀️'];
  return cycle[l.day % cycle.length];
}

export default function Lessons() {
  const { profile } = useProfile();
  const [selected, setSelected] = useState<Lesson | null>(null);

  if (!profile) return null;

  const all = lessonsFor(profile);
  const lesson = selected ?? todayLesson(profile);
  const isToday = lesson.id === todayLesson(profile).id;

  const open = (l: Lesson) => {
    setSelected(l);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {isToday ? 'Today’s lesson' : 'Lesson'}
          <span className={styles.titleHindi}> {isToday ? 'आज का पाठ' : 'पाठ'}</span>
        </h1>
      </header>

      <article className={styles.lessonCard}>
        <div className={styles.banner}>
          <span className={styles.dayPill}>
            {isToday ? '✦ Today' : `Day ${lesson.day}`}
          </span>
          <span className={styles.bannerEmoji} aria-hidden>
            {emojiFor(lesson)}
          </span>
          <span className={styles.blob} aria-hidden />
        </div>

        <div className={styles.body}>
          <h2 className={styles.lessonTitle}>{lesson.title}</h2>
          {lesson.body.map((p, i) => (
            <p key={i} className={styles.para}>
              {p}
            </p>
          ))}

          <div className={styles.tryBox}>
            <span className={styles.tryHead}>
              <Moon size={16} aria-hidden /> Try tonight · आज आज़माएँ
            </span>
            <p className={styles.tryText}>{lesson.tryTonight}</p>
            <p className={styles.tryHindi}>{lesson.tryTonightHindi}</p>
          </div>
        </div>
      </article>

      <h3 className={styles.moreTitle}>
        More lessons <span className="hindi">· और पाठ</span>
      </h3>
      <ul className={styles.list}>
        {all.map((l) => (
          <li key={l.id}>
            <button
              type="button"
              className={`${styles.listItem} ${
                l.id === lesson.id ? styles.listActive : ''
              }`}
              onClick={() => open(l)}
            >
              <span className={styles.listEmoji} aria-hidden>
                {emojiFor(l)}
              </span>
              <span className={styles.listText}>{l.title}</span>
              <span className={styles.listDay}>Day {l.day}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
