import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  X,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Check,
  Video,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { getRoutine } from '../data/exercises';
import { upsertLog } from '../lib/store';
import { playSound } from '../lib/sounds';
import { useSaathi } from '../lib/saathi/voice';
import { buildExerciseCue, buildRoutineStart, buildRoutineDone } from '../lib/saathi/moments';
import styles from './ExercisePlayer.module.css';

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const RING_R = 92;
const RING_C = 2 * Math.PI * RING_R;

export default function ExercisePlayer() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { play, muted, toggleMuted, speaking } = useSaathi();
  const routine = profile ? getRoutine(profile) : null;
  const exercises = routine?.exercises ?? [];

  const startIndex = Math.max(
    0,
    Math.min(
      (location.state as { startIndex?: number } | null)?.startIndex ?? 0,
      Math.max(0, exercises.length - 1),
    ),
  );

  const [index, setIndex] = useState(startIndex);
  const [remaining, setRemaining] = useState(exercises[startIndex]?.durationSec ?? 0);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);

  // Dheeru coaches: announce + cue each move as it becomes active.
  const coachedIndex = useRef(-1);
  useEffect(() => {
    if (finished || exercises.length === 0) return;
    if (coachedIndex.current === index) return;
    const firstCoach = coachedIndex.current === -1;
    coachedIndex.current = index;
    const cue = buildExerciseCue(exercises[index]);
    play(firstCoach ? [...buildRoutineStart(), ...cue] : cue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, finished]);

  // tick
  useEffect(() => {
    if (!running || finished) return;
    const id = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running, finished, index]);

  // auto-advance at zero
  useEffect(() => {
    if (remaining !== 0 || finished || exercises.length === 0) return;
    if (index + 1 >= exercises.length) {
      setFinished(true);
      setRunning(false);
    } else {
      setIndex(index + 1);
      setRemaining(exercises[index + 1].durationSec);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  // record completion once
  useEffect(() => {
    if (finished && profile) {
      upsertLog(profile, { exerciseDone: true });
      playSound('done');
      play(buildRoutineDone());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, profile]);

  if (!profile || !routine) return null;

  const goTo = (i: number) => {
    if (i < 0 || i >= exercises.length) return;
    setIndex(i);
    setRemaining(exercises[i].durationSec);
    setRunning(true);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className={styles.dark}>
        <div className={styles.doneWrap}>
          <span className={styles.doneBadge} aria-hidden>
            <Check size={48} strokeWidth={3} />
          </span>
          <h1 className={styles.doneTitle}>Routine complete</h1>
          <p className={styles.doneHindi}>शाबाश! आज पूरा हुआ।</p>
          <p className={styles.doneSub}>
            Now the important part — tell us how you feel so we can track it.
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => navigate('/log')}
          >
            {profile === 'papa'
              ? 'Log how your back feels'
              : profile === 'chunnu'
                ? 'Log your mood'
                : 'Log your BP'}
            <ChevronRight size={22} />
          </button>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() => navigate('/')}
          >
            Back to today
          </button>
        </div>
      </div>
    );
  }

  const current = exercises[index];
  const progress = current.durationSec
    ? remaining / current.durationSec
    : 0;
  const dashOffset = RING_C * (1 - progress);
  const hasVideo = current.videoId && current.videoId !== 'REPLACE_ME';

  return (
    <div className={styles.dark}>
      <header className={styles.top}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => navigate('/')}
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <span className={styles.count}>
          {index + 1} / {exercises.length}
        </span>
        <button
          type="button"
          className={`${styles.iconBtn} ${speaking ? styles.coachOn : ''}`}
          onClick={toggleMuted}
          aria-pressed={!muted}
          aria-label={muted ? "Turn on Dheeru's voice" : "Mute Dheeru's voice"}
        >
          {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
        </button>
      </header>

      <div className={styles.progressTrack} aria-hidden>
        <div
          className={styles.progressFill}
          style={{ width: `${((index + 1) / exercises.length) * 100}%` }}
        />
      </div>

      <div className={styles.videoBox}>
        {hasVideo ? (
          <iframe
            key={current.id}
            className={styles.video}
            src={`https://www.youtube-nocookie.com/embed/${current.videoId}?rel=0&playsinline=1`}
            title={current.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className={styles.videoPlaceholder}>
            <Video size={32} aria-hidden />
            <span>Video coming soon</span>
            <span className="hindi">वीडियो जल्द आएगा</span>
          </div>
        )}
      </div>

      <a
        className={styles.ytLink}
        href={
          hasVideo
            ? `https://www.youtube.com/watch?v=${current.videoId}`
            : `https://www.youtube.com/results?search_query=${encodeURIComponent(
                current.name + ' exercise how to',
              )}`
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink size={15} aria-hidden />
        {hasVideo ? 'Not playing? Watch on YouTube' : 'Find this on YouTube'}
      </a>

      <div className={styles.nameBlock}>
        <h1 className={styles.exName}>{current.name}</h1>
        <p className={styles.exHindi}>{current.hindiName}</p>
        <p className={styles.target}>{current.target}</p>
      </div>

      <button
        type="button"
        className={styles.ring}
        onClick={() => setRunning((r) => !r)}
        aria-label={running ? 'Pause' : 'Play'}
      >
        <svg viewBox="0 0 200 200" className={styles.ringSvg}>
          <circle cx="100" cy="100" r={RING_R} className={styles.ringTrack} />
          <circle
            cx="100"
            cy="100"
            r={RING_R}
            className={styles.ringFill}
            strokeDasharray={RING_C}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 100 100)"
          />
        </svg>
        <span className={styles.ringInner}>
          <span className={styles.time}>{fmt(remaining)}</span>
          <span className={styles.playHint}>
            {running ? <Pause size={18} /> : <Play size={18} />}
          </span>
        </span>
      </button>

      <p className={styles.cue}>{current.cue}</p>
      <p className={styles.cueHindi}>{current.cueHindi}</p>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Previous"
        >
          <ChevronLeft size={26} />
        </button>
        <button
          type="button"
          className={styles.bigBtn}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? <Pause size={26} /> : <Play size={26} />}
          {running ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() =>
            index + 1 >= exercises.length
              ? (setFinished(true), setRunning(false))
              : goTo(index + 1)
          }
          aria-label="Next"
        >
          <ChevronRight size={26} />
        </button>
      </div>
    </div>
  );
}
