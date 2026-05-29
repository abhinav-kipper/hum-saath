import { useEffect, useRef, useState } from 'react';
import Saathi from './Saathi';
import { useSaathi } from '../lib/saathi/voice';
import { onReact } from '../lib/saathi/react';
import type { SaathiLine } from '../lib/saathi/moments';
import styles from './SaathiReactions.module.css';

export default function SaathiReactions() {
  const { play, speaking, caption, stop } = useSaathi();
  const [visible, setVisible] = useState(false);
  const wasSpeaking = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(
    () =>
      onReact((lines: SaathiLine[]) => {
        clearTimeout(hideTimer.current);
        setVisible(true);
        play(lines);
      }),
    [play],
  );

  // Auto-hide a moment after Dheeru finishes speaking.
  useEffect(() => {
    if (speaking) {
      wasSpeaking.current = true;
      return;
    }
    if (wasSpeaking.current && visible) {
      wasSpeaking.current = false;
      hideTimer.current = setTimeout(() => setVisible(false), 2000);
    }
  }, [speaking, visible]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  if (!visible) return null;

  const dismiss = () => {
    stop();
    clearTimeout(hideTimer.current);
    setVisible(false);
  };

  return (
    <button type="button" className={styles.wrap} onClick={dismiss} aria-label="Dismiss">
      <span className={styles.mascot}>
        <Saathi mood={speaking ? 'talking' : 'happy'} size={72} />
      </span>
      {caption && (
        <span className={styles.bubble}>
          <span className={styles.hi}>{caption.hi}</span>
          <span className={styles.en}>{caption.en}</span>
        </span>
      )}
    </button>
  );
}
