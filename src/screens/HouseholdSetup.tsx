import { useState } from 'react';
import { Cloud } from 'lucide-react';
import { setHousehold } from '../lib/store';
import styles from './HouseholdSetup.module.css';

export default function HouseholdSetup() {
  const [code, setCode] = useState('');
  const valid = code.trim().length >= 4;

  const submit = () => {
    if (!valid) return;
    setHousehold(code);
    // Reload so the Supabase client picks up the household header.
    window.location.reload();
  };

  return (
    <div className={styles.wrap}>
      <span className={styles.logo} aria-hidden>
        <Cloud size={26} strokeWidth={2.5} />
      </span>
      <h1 className={styles.title}>Family setup</h1>
      <p className={styles.sub}>
        Enter your family’s shared code to sync with everyone.
        <br />
        <span className="hindi">परिवार का साझा कोड डालें।</span>
      </p>

      <input
        className={styles.input}
        type="text"
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        placeholder="family code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />

      <button type="button" className={styles.btn} onClick={submit} disabled={!valid}>
        Continue · आगे बढ़ें
      </button>

      <p className={styles.note}>
        Use the same code on every family device. Keep it private, it’s like a
        password.
      </p>
    </div>
  );
}
