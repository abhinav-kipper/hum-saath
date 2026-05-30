import { useState } from 'react';
import Icon from './Icon';
import Bi from './Bi';
import Sheet from './Sheet';
import { useApp } from '../context/AppContext';
import { profileList } from '../data/content';
import { isConfigured, getHousehold } from '../lib/supabase';

export default function ProfileSheet({ onClose }: { onClose: () => void }) {
  const app = useApp();
  const existing = getHousehold();
  const [code, setCode] = useState(existing ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!code.trim()) return;
    setSaving(true);
    await app.linkHousehold(code.trim());
    setSaving(false);
    onClose();
  };

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

      {isConfigured() && (
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(90,60,30,.08)' }}>
          <Bi hi="परिवार जोड़ें" en="Connect family · keeps everyone in sync" hiSize={15} enSize={9.5} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="घर का कोड · family code"
              style={{ flex: 1, border: '1px solid rgba(255,255,255,.7)', background: 'var(--surface)', borderRadius: 14, padding: '12px 14px', fontSize: 14, color: 'var(--ink)' }}
            />
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={!code.trim() || saving}
              style={{ background: app.profile.grad, padding: '12px 16px', fontSize: 14, opacity: !code.trim() || saving ? 0.5 : 1 }}
            >
              <Icon name="check" size={16} sw={2.8} color="#fff" /> {existing ? 'बदलें' : 'जोड़ें'}
            </button>
          </div>
          {existing && (
            <p style={{ fontSize: 11, color: 'var(--mint-d)', fontWeight: 700, margin: '8px 0 0' }}>
              जुड़े हुए · synced across the family
            </p>
          )}
        </div>
      )}
    </Sheet>
  );
}
