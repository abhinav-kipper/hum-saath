import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, HeartPulse, Footprints, BookOpen, RefreshCw } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { getLog, getStreak } from '../lib/store';
import { getRoutine } from '../data/exercises';
import { todayLesson } from '../data/lessons';
import type { DayLog, StreakInfo } from '../types';
import TaskCard from '../components/TaskCard';
import StreakChip from '../components/StreakChip';
import styles from './Today.module.css';

function greeting(): { en: string; hi: string } {
  const h = new Date().getHours();
  if (h < 12) return { en: 'Good morning', hi: 'सुप्रभात' };
  if (h < 17) return { en: 'Good afternoon', hi: 'नमस्ते' };
  return { en: 'Good evening', hi: 'शुभ संध्या' };
}

export default function Today() {
  const { profile, info } = useProfile();
  const navigate = useNavigate();
  const [log, setLog] = useState<DayLog | undefined>();
  const [streak, setStreak] = useState<StreakInfo | null>(null);

  useEffect(() => {
    if (!profile) return;
    getLog(profile).then(setLog);
    getStreak(profile).then(setStreak);
  }, [profile]);

  if (!profile || !info) return null;

  const routine = getRoutine(profile);
  const lesson = todayLesson(profile);
  const g = greeting();

  const checkInDone =
    profile === 'papa'
      ? typeof log?.painScore === 'number'
      : typeof log?.systolic === 'number';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.greetRow}>
          <div>
            <p className={styles.greet}>
              {g.en} <span className="hindi">· {g.hi}</span>
            </p>
            <h1 className={styles.name}>
              {info.name} <span className={styles.nameHindi}>{info.nameHindi}</span>
            </h1>
          </div>
          <button
            type="button"
            className={styles.switch}
            onClick={() => navigate('/onboarding')}
            aria-label="Switch profile"
          >
            <span className={styles.avatar}>{info.name[0]}</span>
            <RefreshCw size={15} aria-hidden />
          </button>
        </div>
        {streak && <StreakChip streak={streak} />}
      </header>

      {streak?.status === 'welcome' && (
        <div className={styles.welcome}>
          <p className={styles.welcomeText}>
            Welcome back — no pressure. Start with just 5 minutes today?
          </p>
          <p className="hindi">वापसी पर स्वागत है — आज सिर्फ़ 5 मिनट से शुरू करें?</p>
        </div>
      )}

      <h2 className={styles.sectionTitle}>
        Today’s plan <span className="hindi">· आज का प्लान</span>
      </h2>

      <div className={styles.cards}>
        <TaskCard
          icon={<Dumbbell size={26} />}
          title="Today’s movement"
          hindi="आज की एक्सरसाइज़"
          meta={`${routine.exercises.length} moves · ${routine.minutes} min`}
          done={log?.exerciseDone}
          onClick={() => navigate('/exercise')}
        />

        <TaskCard
          icon={<HeartPulse size={26} />}
          title={profile === 'papa' ? 'Log neck pain' : 'Log blood pressure'}
          hindi={profile === 'papa' ? 'दर्द दर्ज करें' : 'बीपी दर्ज करें'}
          meta={
            checkInDone
              ? profile === 'papa'
                ? `Pain: ${log?.painScore}/10`
                : `BP: ${log?.systolic}/${log?.diastolic}`
              : 'Takes 20 seconds'
          }
          done={checkInDone}
          onClick={() => navigate('/log')}
        />

        <TaskCard
          icon={<Footprints size={26} />}
          title="Walk after a meal"
          hindi="खाने के बाद टहलें"
          meta={log?.walked ? 'Done — nice!' : '10 minutes is enough'}
          done={log?.walked}
          onClick={() => navigate('/log')}
        />

        <TaskCard
          icon={<BookOpen size={26} />}
          title="Today’s lesson"
          hindi="आज का पाठ"
          meta={lesson.title}
          onClick={() => navigate('/lessons')}
        />
      </div>
    </div>
  );
}
