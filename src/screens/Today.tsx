import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  HeartPulse,
  Footprints,
  BookOpen,
  Pill,
  RefreshCw,
  Send,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import {
  getLog,
  getMedLogs,
  getStreak,
  listMedicines,
  shouldCelebrate,
  markCelebrated,
} from '../lib/store';
import { getRoutine } from '../data/exercises';
import type { Medicine } from '../data/medicines';
import { todayLesson } from '../data/lessons';
import { todayAffirmation } from '../data/affirmations';
import { composeDailyUpdate } from '../lib/dailyUpdate';
import { shareOnWhatsApp } from '../lib/share';
import { launchConfetti } from '../lib/confetti';
import type { DayLog, MedLog, StreakInfo } from '../types';
import TaskCard from '../components/TaskCard';
import StreakChip from '../components/StreakChip';
import PlantMascot from '../components/PlantMascot';
import styles from './Today.module.css';

function greeting(): { en: string; hi: string } {
  const h = new Date().getHours();
  if (h < 12) return { en: 'Good morning', hi: 'सुप्रभात' };
  if (h < 17) return { en: 'Good afternoon', hi: 'नमस्ते' };
  return { en: 'Good evening', hi: 'शुभ संध्या' };
}

const NEW_STREAK: StreakInfo = { count: 0, daysSinceLast: Infinity, status: 'new' };

export default function Today() {
  const { profile, info } = useProfile();
  const navigate = useNavigate();
  const [log, setLog] = useState<DayLog | undefined>();
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [medLogs, setMedLogs] = useState<MedLog[]>([]);
  const [meds, setMeds] = useState<Medicine[]>([]);

  useEffect(() => {
    if (!profile) return;
    getLog(profile).then(setLog);
    getStreak(profile).then(setStreak);
    getMedLogs(profile).then(setMedLogs);
    listMedicines(profile).then(setMeds);
  }, [profile]);

  // Fire confetti once per day when everything for the day is done.
  useEffect(() => {
    if (!profile) return;
    const allMeds = meds.length > 0 && medLogs.length >= meds.length;
    const checkIn =
      profile === 'papa'
        ? typeof log?.painScore === 'number'
        : typeof log?.systolic === 'number';
    const t = [
      log?.exerciseDone,
      checkIn,
      log?.walked,
      ...(meds.length > 0 ? [allMeds] : []),
    ];
    const done = t.filter(Boolean).length;
    if (t.length > 0 && done >= t.length) {
      shouldCelebrate(profile).then((yes) => {
        if (yes) {
          launchConfetti();
          markCelebrated(profile);
        }
      });
    }
  }, [profile, log, medLogs, meds]);

  if (!profile || !info) return null;

  const routine = getRoutine(profile);
  const lesson = todayLesson(profile);
  const medTaken = medLogs.length;
  const allMedsTaken = meds.length > 0 && medTaken >= meds.length;
  const g = greeting();

  const checkInDone =
    profile === 'papa'
      ? typeof log?.painScore === 'number'
      : typeof log?.systolic === 'number';

  // progress for the encouraging line
  const tasks = [
    log?.exerciseDone,
    checkInDone,
    log?.walked,
    ...(meds.length > 0 ? [allMedsTaken] : []),
  ];
  const doneCount = tasks.filter(Boolean).length;
  const totalCount = tasks.length;

  let encourage: string;
  if (doneCount === 0) encourage = 'Chaliye shuru karein 🌱';
  else if (doneCount >= totalCount) encourage = 'Aaj sab ho gaya — kamaal! 🎉';
  else encourage = `${doneCount}/${totalCount} ho gaya — bahut badhiya!`;

  const shareDay = () => {
    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
    const medStatus = meds.map((m) => ({
      name: m.name,
      takenAt: medLogs.find((l) => l.medId === m.id)?.takenAt,
    }));
    shareOnWhatsApp(
      composeDailyUpdate({
        name: info.name,
        profile,
        dateStr,
        log,
        meds: medStatus,
        streak: streak ?? NEW_STREAK,
      }),
    );
  };

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
        <div className={styles.statusRow}>
          {streak && <StreakChip streak={streak} />}
        </div>
      </header>

      <PlantMascot done={doneCount} total={totalCount} label={encourage} />
      <p className={styles.affirm}>{todayAffirmation()}</p>

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
          icon={<Pill size={26} />}
          title="Medicines"
          hindi="दवाइयाँ"
          meta={
            meds.length === 0
              ? 'Tap to add'
              : allMedsTaken
                ? 'All taken — great!'
                : `${medTaken}/${meds.length} taken today`
          }
          done={allMedsTaken}
          onClick={() => navigate('/medicines')}
        />

        <TaskCard
          icon={<HeartPulse size={26} />}
          title={profile === 'papa' ? 'Log back & leg pain' : 'Log blood pressure'}
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

      <button type="button" className={styles.shareDayBtn} onClick={shareDay}>
        <Send size={20} aria-hidden />
        Share today with family
        <span className={styles.shareDayHindi}>परिवार को आज का अपडेट भेजें</span>
      </button>
    </div>
  );
}
