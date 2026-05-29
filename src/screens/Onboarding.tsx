import Jugnu from '../components/Jugnu';
import Icon from '../components/Icon';
import { useTypewriter } from '../lib/voice';
import { useApp } from '../context/AppContext';

export default function Onboarding() {
  const { enter } = useApp();
  const [hi] = useTypewriter('नमस्ते! मैं जुगनू — आपका साथी। हर दिन, थोड़ा-थोड़ा, साथ-साथ।', true, 34);

  return (
    <div
      className="screen-body"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 28px',
        textAlign: 'center',
        background: 'radial-gradient(80% 50% at 50% 30%, #fff0cf, transparent 65%)',
      }}
    >
      <div style={{ marginBottom: 6 }}>
        <Jugnu size={190} mood="happy" />
      </div>
      <h1 className="hi" style={{ fontSize: 40, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-.01em' }}>साथ</h1>
      <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-3)', letterSpacing: '.22em', margin: '4px 0 0' }}>S A A T H</p>
      <p
        className="hi"
        style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-2)', margin: '20px 0 0', minHeight: 80, lineHeight: 1.45, maxWidth: 300 }}
      >
        {hi}
        <span className="cursor" />
      </p>
      <button className="btn btn-primary" style={{ marginTop: 26, width: '100%', maxWidth: 300 }} onClick={() => enter(true)}>
        <Icon name="mic" size={20} color="#fff" /> जुगनू को सुनें · चलिए
      </button>
      <button className="btn" style={{ marginTop: 12, color: 'var(--ink-3)', fontSize: 14, padding: '8px 16px' }} onClick={() => enter(false)}>
        बिना आवाज़ · Continue muted
      </button>
    </div>
  );
}
