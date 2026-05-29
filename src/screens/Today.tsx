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
  Flower2,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import {
  getLog,
  getLogs,
  getMedLogs,
  getMedCountsByDate,
  getStreak,
  listMedicines,
  shouldCelebrate,
  markCelebrated,
} from '../lib/store';
import { computeGarden } from '../lib/garden';
import { anchorFor, type ReminderKind } from '../lib/reminders';
import { getRoutine } from '../data/exercises';
import type { Medicine } from '../data/medicines';
import { todayLesson } from '../data/lessons';
import { checkinKind } from '../lib/checkin';
import { todayAffirmation } from '../data/affirmations';
import { composeDailyUpdate } from '../lib/dailyUpdate';
import { shareOnWhatsApp } from '../lib/share';
import { launchConfetti } from '../lib/confetti';
import { playSound } from '../lib/sounds';
import type { DayLog, MedLog, StreakInfo } from '../types';
import TaskCard from '../components/TaskCard';
import StreakChip from '../components/StreakChip';
import SaathiHost from '../components/SaathiHost';
import SoundToggle from '../components/SoundToggle';
import FamilyCheers from '../components/FamilyCheers';
import InstallPrompt from '../components/InstallPrompt';
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
  const [gardenFlowers, setGardenFlowers] = useState(0);
  const [anchors, setAnchors] = useState<Partial<Record<ReminderKind, string>>>({});
  const [lowEnergy, setLowEnergy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    getLog(profile).then(setLog);
    getStreak(profile).then(setStreak);
    getMedLogs(profile).then(setMedLogs);
    listMedicines(profile).then(setMeds);
    Promise.all([getLogs(profile), getMedCountsByDate(profile)]).then(([ls, mc]) =>
      setGardenFlowers(computeGarden(ls, mc).flowers),
    );
    setAnchors({
      movement: anchorFor(profile, 'movement'),
      checkin: anchorFor(profile, 'checkin'),
      medicines: anchorFor(profile, 'medicines'),
      walk: anchorFor(profile, 'walk'),
    });
  }, [profile]);

  // Fire confetti once per day when everything for the day is done.
  useEffect(() => {
    if (!profile) return;
    const allMeds = meds.length > 0 && medLogs.length >= meds.length;
    const ck = checkinKind(profile);
    const checkIn =
      ck === 'pain'
        ? typeof log?.painScore === 'number'
        : ck === 'mood'
          ? typeof log?.moodScore === 'number'
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
          playSound('celebrate');
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

  const kind = checkinKind(profile);
  const checkInDone =
    kind === 'pain'
      ? typeof log?.painScore === 'number'
      : kind === 'mood'
        ? typeof log?.moodScore === 'number'
        : typeof log?.systolic === 'number';

  const checkInTitle =
    kind === 'pain'
      ? 'Log back & leg pain'
      : kind === 'mood'
        ? 'Log your mood'
        : 'Log blood pressure';
  const checkInHindi =
    kind === 'pain' ? 'दर्द दर्ज करें' : kind === 'mood' ? 'मूड दर्ज करें' : 'बीपी दर्ज करें';
  const checkInMeta = checkInDone
    ? kind === 'pain'
      ? `Pain: ${log?.painScore}/10`
      : kind === 'mood'
        ? `Mood: ${log?.moodScore}/5`
        : `BP: ${log?.systolic}/${log?.diastolic}`
    : 'Takes 20 seconds';

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
  if (doneCount === 0) encourage = 'Chalo, shuru karte hain 🌱';
  else if (doneCount >= totalCount) encourage = 'Aaj sab ho gaya — wah! 🎉';
  else encourage = `${doneCount}/${totalCount} ho gaya — lage raho 👏`;

  // "Bad day" minimum — the single tiniest step that still counts.
  const checkInMicro =
    kind === 'pain'
      ? 'Just log your pain — 20 seconds'
      : kind === 'mood'
        ? 'Just check in your mood — 20 seconds'
        : 'Just take your BP — 20 seconds';
  const microOptions = [
    !checkInDone ? { label: checkInMicro, route: '/log' } : null,
    !log?.exerciseDone ? { label: 'Just 2 minutes of movement', route: '/exercise' } : null,
    !log?.walked ? { label: 'Just a 5-minute walk', route: '/log' } : null,
  ].filter((x): x is { label: string; route: string } => x !== null);
  const micro = microOptions[0];

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
      <InstallPrompt />

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
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => navigate('/reminders')}
              aria-label="Reminders"
            >
              <Bell size={18} aria-hidden />
            </button>
            <SoundToggle />
          </div>
        </div>
      </header>

      <SaathiHost
        ctx={{
          name: info.name,
          hour: new Date().getHours(),
          doneCount,
          totalCount,
          remaining: Math.max(0, totalCount - doneCount),
          streakStatus: streak?.status ?? 'new',
        }}
        encourage={encourage}
      />
      <p className={styles.affirm}>{todayAffirmation()}</p>

      <button
        type="button"
        className={styles.gardenChip}
        onClick={() => navigate('/garden')}
      >
        <Flower2 size={20} aria-hidden />
        <span className={styles.gardenChipText}>
          Your garden · {gardenFlowers} {gardenFlowers === 1 ? 'flower' : 'flowers'}
          <span className={styles.gardenChipHindi}>बगीचा देखें</span>
        </span>
        <ChevronRight size={18} aria-hidden />
      </button>

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
          anchor={anchors.movement}
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
          anchor={anchors.medicines}
          done={allMedsTaken}
          onClick={() => navigate('/medicines')}
        />

        <TaskCard
          icon={<HeartPulse size={26} />}
          title={checkInTitle}
          hindi={checkInHindi}
          meta={checkInMeta}
          anchor={anchors.checkin}
          done={checkInDone}
          onClick={() => navigate('/log')}
        />

        <TaskCard
          icon={<Footprints size={26} />}
          title="Walk after a meal"
          hindi="खाने के बाद टहलें"
          meta={log?.walked ? 'Done — nice!' : '10 minutes is enough'}
          anchor={anchors.walk}
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

      <div className={styles.badDay}>
        {!lowEnergy ? (
          <button
            type="button"
            className={styles.badDayToggle}
            onClick={() => setLowEnergy(true)}
          >
            Low on energy today? <span className="hindi">· मन नहीं है?</span>
          </button>
        ) : (
          <div className={styles.badDayCard}>
            {micro ? (
              <>
                <p className={styles.badDayLead}>Then just do one small thing 🌱</p>
                <button
                  type="button"
                  className={styles.badDayCta}
                  onClick={() => navigate(micro.route)}
                >
                  {micro.label}
                </button>
                <p className={styles.badDayNote}>
                  Itna hi kaafi hai. Baaki phir kabhi. 💛
                </p>
              </>
            ) : (
              <p className={styles.badDayLead}>
                You’ve already done today — rest easy 💛
              </p>
            )}
          </div>
        )}
      </div>

      <FamilyCheers />

      <button type="button" className={styles.shareDayBtn} onClick={shareDay}>
        <Send size={20} aria-hidden />
        Share today with family
        <span className={styles.shareDayHindi}>परिवार को आज का अपडेट भेजें</span>
      </button>
    </div>
  );
}
