import Icon from './Icon';
import Bi from './Bi';
import Sheet from './Sheet';
import { useApp } from '../context/AppContext';
import { profileList } from '../data/content';

export default function ProfileSheet({ onClose }: { onClose: () => void }) {
  const app = useApp();
  return (
    <Sheet onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h2 className="hi" style={{ fontSize: 22, margin: '2px 0' }}>किसकी देखभाल?</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700, margin: 0 }}>Switch family member</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {profileList.map((p) => {
          const on = p.id === app.profile.id;
          return (
            <button
              key={p.id}
              onClick={() => { app.setProfile(p.id); onClose(); }}
              className={on ? 'clay' : 'glass'}
              style={{ border: on ? `2px solid ${p.accent}` : '1px solid rgba(255,255,255,.7)', borderRadius: 20, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left' }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 999, background: p.grad, display: 'grid', placeItems: 'center', color: '#fff' }}>
                <Icon name="user" size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <Bi hi={p.name} en={p.focusEn} hiSize={18} enSize={10.5} />
              </div>
              {on && <Icon name="check" size={20} sw={3} color={p.accentD} />}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
