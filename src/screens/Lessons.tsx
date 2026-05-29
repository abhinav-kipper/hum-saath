import { useState } from 'react';
import { Moon, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { lessonsFor, todayLesson, type Lesson } from '../data/lessons';
import Saathi from '../components/Saathi';
import { useSaathi } from '../lib/saathi/voice';
import { buildLessonNarration } from '../lib/saathi/moments';
import styles from './Lessons.module.css';

function emojiFor(l: Lesson): string {
  const t = l.title.toLowerCase();
  const map: [string, string][] = [
    ['sona', '🛏️'],
    ['neend', '🛏️'],
    ['dawai', '💊'],
    ['dawa', '💊'],
    ['thyroid', '💊'],
    ['goli', '💊'],
    ['teeke', '💉'],
    ['antidepressant', '💊'],
    ['namak', '🧂'],
    ['cheeni', '🍬'],
    ['tel', '🛢️'],
    ['protein', '🥚'],
    ['chaal', '🚶'],
    ['walk', '🚶'],
    ['taqat', '💪'],
    ['hilna', '🏃'],
    ['baith', '🪑'],
    ['sciatica', '🌿'],
    ['barf', '🧊'],
    ['sikaai', '🔥'],
    ['paani', '💧'],
    ['dhoop', '☀️'],
    ['potassium', '🍌'],
    ['girne', '🛟'],
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
  const { unlocked, muted, speaking, toggleMuted, play } = useSaathi();

  if (!profile) return null;

  const all = lessonsFor(profile);
  const lesson = selected ?? todayLesson(profile);
  const isToday = lesson.id === todayLesson(profile).id;

  const open = (l: Lesson) => {
    setSelected(l);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const narrate = () => play(buildLessonNarration(lesson));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Saathi ki baat <span className={styles.titleHindi}>साथी की बात</span>
        </h1>
        <p className={styles.sub}>Roz ek chhoti seekh, Dheeru ke saath.</p>
      </header>

      {/* Dheeru reads the lesson aloud */}
      <div className={styles.narrator}>
        <Saathi mood={speaking ? 'talking' : 'idle'} size={92} />
        <div className={styles.narratorControls}>
          <button type="button" className={styles.listen} onClick={narrate} disabled={speaking}>
            {unlocked ? <RotateCcw size={18} aria-hidden /> : <Play size={18} aria-hidden />}
            {unlocked ? 'Phir se' : 'Suniye'} <span className="hindi">· सुनिए</span>
          </button>
          <button
            type="button"
            className={styles.mute}
            onClick={toggleMuted}
            aria-pressed={!muted}
            aria-label={muted ? "Turn on Dheeru's voice" : "Mute Dheeru's voice"}
          >
            {muted ? <VolumeX size={18} aria-hidden /> : <Volume2 size={18} aria-hidden />}
          </button>
        </div>
      </div>

      <article className={styles.lessonCard}>
        <div className={styles.banner}>
          <span className={styles.dayPill}>
            {isToday ? '✦ Aaj' : `Day ${lesson.day}`}
          </span>
          <span className={styles.bannerEmoji} aria-hidden>
            {emojiFor(lesson)}
          </span>
          <span className={styles.blob} aria-hidden />
        </div>

        <div className={styles.body}>
          <h2 className={styles.lessonTitle}>{lesson.title}</h2>

          {lesson.myth && lesson.fact && (
            <div className={styles.mythFact}>
              <p className={styles.myth}>
                <span className={styles.mark} aria-hidden>
                  ✗
                </span>
                <span>
                  <b>Aam galti:</b> {lesson.myth}
                </span>
              </p>
              <p className={styles.fact}>
                <span className={styles.mark} aria-hidden>
                  ✓
                </span>
                <span>
                  <b>Sach:</b> {lesson.fact}
                </span>
              </p>
            </div>
          )}

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

          <p className={styles.disclaimer}>
            Yeh aam jaankari hai. Apni dawa ya sehat ke liye doctor ki salah zaroor lein.
          </p>
        </div>
      </article>

      <h3 className={styles.moreTitle}>
        Aur baatein <span className="hindi">· और पाठ</span>
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
