import { useState } from 'react';
import { Moon, BookOpen } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { lessonsFor, todayLesson, type Lesson } from '../data/lessons';
import styles from './Lessons.module.css';

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
        {/* TODO v2: real lesson images. Placeholder banner for now. */}
        <div className={styles.banner} aria-hidden>
          <BookOpen size={30} />
          <span className={styles.day}>Day {lesson.day}</span>
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
              <Moon size={18} aria-hidden /> Try tonight · आज आज़माएँ
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
              <span className={styles.listDay}>{l.day}</span>
              <span className={styles.listText}>{l.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
