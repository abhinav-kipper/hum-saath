import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import {
  getDeferred,
  onInstallChange,
  clearDeferred,
  isStandalone,
  isIos,
} from '../lib/installPrompt';
import styles from './InstallPrompt.module.css';

const DISMISS_KEY = 'saath.installDismissed.v1';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(getDeferred());
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === '1',
  );

  useEffect(() => onInstallChange(() => setDeferred(getDeferred())), []);

  // Already installed, or the user closed the nudge.
  if (dismissed || isStandalone()) return null;

  const ios = isIos();
  // Android needs the captured prompt; iOS Safari gets manual steps.
  if (!ios && !deferred) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    clearDeferred();
    setDeferred(null);
    setDismissed(true);
  };

  return (
    <div className={styles.banner}>
      <button
        type="button"
        className={styles.close}
        onClick={dismiss}
        aria-label="Dismiss"
      >
        <X size={16} aria-hidden />
      </button>
      <span className={styles.icon} aria-hidden>
        {ios ? <Share size={22} /> : <Download size={22} />}
      </span>
      <div className={styles.text}>
        <span className={styles.title}>Add Saath to your home screen</span>
        <span className="hindi">होम स्क्रीन पर जोड़ें</span>
        {ios && (
          <span className={styles.steps}>
            Tap <Share size={13} aria-hidden /> Share, then “Add to Home Screen”.
          </span>
        )}
      </div>
      {!ios && (
        <button type="button" className={styles.cta} onClick={install}>
          Add
        </button>
      )}
    </div>
  );
}
