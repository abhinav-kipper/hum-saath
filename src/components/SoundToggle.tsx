import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isMuted, setMuted, onMuteChange, playSound } from '../lib/sounds';
import styles from './SoundToggle.module.css';

export default function SoundToggle() {
  const [muted, setMutedState] = useState(isMuted);

  useEffect(() => onMuteChange(setMutedState), []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playSound('tap'); // give a tiny preview when turning sound on
  };

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={toggle}
      aria-pressed={!muted}
      aria-label={muted ? 'Turn sounds on' : 'Turn sounds off'}
      title={muted ? 'Sounds off · आवाज़ बंद' : 'Sounds on · आवाज़ चालू'}
    >
      {muted ? <VolumeX size={18} aria-hidden /> : <Volume2 size={18} aria-hidden />}
    </button>
  );
}
