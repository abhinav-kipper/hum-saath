import { useEffect, useState } from 'react';
import { Pill, Clock, Check, Send, Plus, Trash2 } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import {
  getMedLogs,
  markMedTaken,
  unmarkMedTaken,
  listMedicines,
  addMedicine,
  updateMedicine,
  removeMedicine,
} from '../lib/store';
import { shareOnWhatsApp } from '../lib/share';
import { composeMedsUpdate } from '../lib/dailyUpdate';
import type { Medicine, MedicineInput } from '../data/medicines';
import type { MedLog, Profile } from '../types';
import styles from './Medicines.module.css';

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function EditMedRow({
  med,
  onSave,
  onRemove,
}: {
  med: Medicine;
  onSave: (id: string, patch: Partial<MedicineInput>) => void;
  onRemove: (id: string) => void;
}) {
  const [m, setM] = useState(med);
  const set = (field: keyof MedicineInput, v: string) =>
    setM((prev) => ({ ...prev, [field]: v }));
  const blur = (field: keyof MedicineInput) =>
    onSave(med.id, { [field]: m[field] } as Partial<MedicineInput>);

  return (
    <div className={styles.editCard}>
      <input
        className={styles.editName}
        value={m.name}
        placeholder="Name (English)"
        onChange={(e) => set('name', e.target.value)}
        onBlur={() => blur('name')}
      />
      <input
        className={styles.editField}
        value={m.hindiName}
        placeholder="नाम (Hindi)"
        onChange={(e) => set('hindiName', e.target.value)}
        onBlur={() => blur('hindiName')}
      />
      <input
        className={styles.editField}
        value={m.time}
        placeholder="Time — e.g. 7:00 AM"
        onChange={(e) => set('time', e.target.value)}
        onBlur={() => blur('time')}
      />
      <input
        className={styles.editField}
        value={m.note}
        placeholder="Note (English) — e.g. empty stomach"
        onChange={(e) => set('note', e.target.value)}
        onBlur={() => blur('note')}
      />
      <input
        className={styles.editField}
        value={m.noteHindi}
        placeholder="नोट (Hindi)"
        onChange={(e) => set('noteHindi', e.target.value)}
        onBlur={() => blur('noteHindi')}
      />
      <button type="button" className={styles.removeBtn} onClick={() => onRemove(med.id)}>
        <Trash2 size={16} aria-hidden /> Remove
      </button>
    </div>
  );
}

export default function Medicines() {
  const { profile, info } = useProfile();
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [taken, setTaken] = useState<Record<string, MedLog>>({});
  const [editing, setEditing] = useState(false);

  const loadMeds = (p: Profile) => listMedicines(p).then(setMeds);
  const loadTaken = async (p: Profile) => {
    const logs = await getMedLogs(p);
    const map: Record<string, MedLog> = {};
    logs.forEach((l) => {
      map[l.medId] = l;
    });
    setTaken(map);
  };

  useEffect(() => {
    if (!profile) return;
    loadMeds(profile);
    loadTaken(profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  if (!profile || !info) return null;

  const toggle = async (medId: string) => {
    if (taken[medId]) await unmarkMedTaken(profile, medId);
    else await markMedTaken(profile, medId);
    await loadTaken(profile);
  };

  const addNew = async () => {
    await addMedicine(profile, {
      name: 'New medicine',
      hindiName: '',
      time: '',
      note: '',
      noteHindi: '',
    });
    await loadMeds(profile);
  };

  const saveField = (id: string, patch: Partial<MedicineInput>) => {
    updateMedicine(profile, id, patch);
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const removeMed = async (id: string) => {
    await removeMedicine(profile, id);
    await loadMeds(profile);
  };

  const buildSummary = (): string => {
    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
    const medStatus = meds.map((m) => ({ name: m.name, takenAt: taken[m.id]?.takenAt }));
    return composeMedsUpdate(info.name, dateStr, medStatus);
  };

  const anyTaken = meds.some((m) => taken[m.id]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>
            Medicines <span className={styles.titleHindi}>दवाइयाँ</span>
          </h1>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>
        <p className={styles.sub}>
          {editing
            ? 'Add, edit or remove medicines.'
            : 'Tap when taken — then share to the family group.'}
        </p>
      </header>

      {editing ? (
        <>
          <div className={styles.list}>
            {meds.map((m) => (
              <EditMedRow key={m.id} med={m} onSave={saveField} onRemove={removeMed} />
            ))}
          </div>
          <button type="button" className={styles.addBtn} onClick={addNew}>
            <Plus size={20} aria-hidden /> Add medicine
          </button>
        </>
      ) : meds.length === 0 ? (
        <div className={styles.empty}>
          <Pill size={38} aria-hidden />
          <p className={styles.emptyTitle}>No medicines yet</p>
          <p className={styles.emptySub}>Add {info.name}’s medicines to track them.</p>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => setEditing(true)}
          >
            <Plus size={20} aria-hidden /> Add medicine
          </button>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {meds.map((m) => {
              const done = Boolean(taken[m.id]);
              return (
                <div
                  key={m.id}
                  className={`${styles.card} ${done ? styles.cardDone : ''}`}
                >
                  <div className={styles.info}>
                    <div className={styles.nameRow}>
                      <span className={styles.name}>{m.name}</span>
                      {m.hindiName && <span className={styles.nameHindi}>{m.hindiName}</span>}
                    </div>
                    {(m.time || m.note) && (
                      <div className={styles.metaRow}>
                        {m.time && (
                          <>
                            <Clock size={15} aria-hidden />
                            <span>{m.time}</span>
                          </>
                        )}
                        {m.time && m.note && <span className={styles.dot}>·</span>}
                        {m.note && <span>{m.note}</span>}
                      </div>
                    )}
                    {m.noteHindi && <div className={styles.noteHindi}>{m.noteHindi}</div>}
                    {done && (
                      <div className={styles.takenAt}>
                        Taken at {fmtTime(taken[m.id].takenAt)} · ली गई
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`${styles.takeBtn} ${done ? styles.takeBtnDone : ''}`}
                    onClick={() => toggle(m.id)}
                    aria-pressed={done}
                  >
                    {done ? (
                      <>
                        <Check size={22} strokeWidth={3} />
                        <span>Taken</span>
                      </>
                    ) : (
                      <span>Took it · ली</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className={styles.shareBtn}
            onClick={() => shareOnWhatsApp(buildSummary())}
            disabled={!anyTaken}
          >
            <Send size={20} aria-hidden />
            Share update on WhatsApp
          </button>
          <p className={styles.shareNote}>
            Opens WhatsApp with the message ready — just pick the group.
            <span className="hindi"> ग्रुप चुनकर भेजें।</span>
          </p>
        </>
      )}
    </div>
  );
}
