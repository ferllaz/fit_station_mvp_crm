import { useEffect, useState } from 'react';
import { Check, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import api from '../api';
import type { Trainer } from '../types';

const emptyForm = {
  full_name: '',
  specialty: '',
  photo_url: '',
  notes: '',
  is_active: true,
};

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTrainers = () => {
    api.get('trainers/').then(res => setTrainers(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTrainers();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submitTrainer = async () => {
    if (!form.full_name.trim()) return alert('Укажите имя тренера.');

    if (editingId) {
      await api.patch(`trainers/${editingId}/`, form);
    } else {
      await api.post('trainers/', form);
    }

    resetForm();
    loadTrainers();
  };

  const editTrainer = (trainer: Trainer) => {
    setEditingId(trainer.id);
    setForm({
      full_name: trainer.full_name,
      specialty: trainer.specialty || '',
      photo_url: trainer.photo_url || '',
      notes: trainer.notes || '',
      is_active: trainer.is_active,
    });
  };

  const toggleActive = async (trainer: Trainer) => {
    await api.patch(`trainers/${trainer.id}/`, { is_active: !trainer.is_active });
    loadTrainers();
  };

  const deleteTrainer = async (trainer: Trainer) => {
    if (!window.confirm(`Удалить тренера ${trainer.full_name}? История оплат сохранится.`)) return;
    await api.delete(`trainers/${trainer.id}/`);
    loadTrainers();
  };

  if (loading) return <div style={{ color: '#94a3b8', padding: '20px' }}>Загрузка тренеров...</div>;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Тренера</h1>
          <p style={styles.subtitle}>Добавление, фото, активность и заметки для продаж абонементов</p>
        </div>
      </header>

      <section style={styles.formPanel}>
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>{editingId ? 'Редактирование тренера' : 'Новый тренер'}</h2>
          {editingId && <button onClick={resetForm} style={styles.cancelBtn}><X size={16} /> Отмена</button>}
        </div>

        <div style={styles.formGrid}>
          <input
            value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
            placeholder="ФИО тренера"
            style={styles.input}
          />
          <input
            value={form.specialty}
            onChange={e => setForm({ ...form, specialty: e.target.value })}
            placeholder="Специализация"
            style={styles.input}
          />
          <input
            value={form.photo_url}
            onChange={e => setForm({ ...form, photo_url: e.target.value })}
            placeholder="Ссылка на фото"
            style={styles.input}
          />
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })}
            />
            Активен для продаж
          </label>
        </div>

        <textarea
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          placeholder="Заметки: сильные стороны, расписание, кому лучше назначать"
          style={styles.textarea}
        />

        <button onClick={submitTrainer} style={styles.saveBtn}>
          {editingId ? <Save size={18} /> : <Plus size={18} />}
          {editingId ? 'Сохранить тренера' : 'Добавить тренера'}
        </button>
      </section>

      <section style={styles.grid}>
        {trainers.map(trainer => (
          <article key={trainer.id} style={{ ...styles.card, opacity: trainer.is_active ? 1 : 0.58 }}>
            <img
              src={trainer.photo_url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=480&q=80'}
              alt={trainer.full_name}
              style={styles.photo}
            />
            <div style={styles.cardBody}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.name}>{trainer.full_name}</h3>
                  <p style={styles.specialty}>{trainer.specialty || 'Без специализации'}</p>
                </div>
                <span style={trainer.is_active ? styles.activeBadge : styles.inactiveBadge}>
                  {trainer.is_active ? 'Активен' : 'Скрыт'}
                </span>
              </div>
              <p style={styles.notes}>{trainer.notes || 'Заметок пока нет.'}</p>
              <div style={styles.meta}>Клиентов в оплатах: {trainer.clients_count || 0}</div>
              <div style={styles.actions}>
                <button onClick={() => toggleActive(trainer)} style={styles.iconBtn} title={trainer.is_active ? 'Скрыть из продаж' : 'Вернуть в продажи'}>
                  <Check size={16} />
                </button>
                <button onClick={() => editTrainer(trainer)} style={styles.iconBtn} title="Редактировать">
                  <Pencil size={16} />
                </button>
                <button onClick={() => deleteTrainer(trainer)} style={styles.deleteBtn} title="Удалить">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '32px', fontWeight: 900, margin: 0 },
  subtitle: { color: '#64748b', margin: '6px 0 0' },
  formPanel: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' },
  formHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  formTitle: { margin: 0, fontSize: '18px', fontWeight: 800 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', outline: 'none' },
  textarea: { minHeight: '82px', resize: 'vertical', padding: '12px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', outline: 'none', fontFamily: 'inherit' },
  toggleLabel: { display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '12px' },
  saveBtn: { alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 16px', fontWeight: 800, cursor: 'pointer' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: '9px', padding: '8px 10px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' },
  card: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '18px', overflow: 'hidden' },
  photo: { width: '100%', height: '210px', objectFit: 'cover', display: 'block', backgroundColor: '#0f172a' },
  cardBody: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' },
  name: { margin: 0, fontSize: '18px', fontWeight: 850 },
  specialty: { margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' },
  activeBadge: { backgroundColor: '#065f46', color: '#34d399', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap' },
  inactiveBadge: { backgroundColor: '#334155', color: '#cbd5e1', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap' },
  notes: { margin: 0, color: '#cbd5e1', fontSize: '13px', lineHeight: 1.45, minHeight: '38px' },
  meta: { color: '#64748b', fontSize: '12px' },
  actions: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  iconBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', backgroundColor: '#0f172a', color: '#93c5fd', border: '1px solid #334155', borderRadius: '9px', cursor: 'pointer' },
  deleteBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', backgroundColor: '#7f1d1d20', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: '9px', cursor: 'pointer' },
};
