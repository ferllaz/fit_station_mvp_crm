import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import type { Member } from '../types';
import { Search, Trash2, CalendarPlus, Phone, MessageCircle, Snowflake, Save } from 'lucide-react';

export default function MembersListPage() {
  const location = useLocation();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expiryDrafts, setExpiryDrafts] = useState<Record<number, string>>({});
  const [freezeMember, setFreezeMember] = useState<Member | null>(null);
  const [freezeUntil, setFreezeUntil] = useState('');
  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});

  const fetchMembers = () => {
    api.get('members/').then(res => setMembers(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    const memberId = Number(new URLSearchParams(location.search).get('member'));
    if (!memberId || loading) return;
    rowRefs.current[memberId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [location.search, loading, members]);

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить клиента ${name}?`)) {
      await api.delete(`members/${id}/`);
      fetchMembers();
    }
  };

  const handleExtend = async (member: Member) => {
    if (member.is_frozen) return alert('Нельзя продлить замороженного клиента. Сначала разморозьте.');

    if (window.confirm(`Продлить абонемент для ${member.full_name} на 30 дней за 25 000 ₸?`)) {
      try {
        const res = await api.post(`members/${member.id}/extend/`, {
          days: 30,
          amount: 25000,
          plan_name: 'Продление абонемента (1 мес.)'
        });
        alert(res.data.message);
        fetchMembers();
      } catch (err) {
        alert('Ошибка при продлении абонемента');
      }
    }
  };

  const handleSaveExpiryDate = async (member: Member) => {
    const expiryDate = expiryDrafts[member.id] ?? member.expiry_date;
    if (!expiryDate) return alert('Укажите дату окончания абонемента.');

    try {
      await api.patch(`members/${member.id}/`, { expiry_date: expiryDate });
      setExpiryDrafts(prev => {
        const next = { ...prev };
        delete next[member.id];
        return next;
      });
      fetchMembers();
    } catch (err) {
      alert('Ошибка при изменении даты окончания.');
    }
  };

  const handleToggleFreeze = async (member: Member) => {
    if (member.is_frozen) {
      if (window.confirm(`Разморозить клиента ${member.full_name} досрочно?`)) {
        const res = await api.post(`members/${member.id}/unfreeze/`);
        alert(res.data.message);
        fetchMembers();
      }
      return;
    }

    if (member.days_left <= 0) return alert('Нельзя заморозить клиента с истекшим абонементом.');
    setFreezeMember(member);
    setFreezeUntil('');
  };

  const handleConfirmFreeze = async () => {
    if (!freezeMember || !freezeUntil) return alert('Выберите дату заморозки.');

    try {
      const res = await api.post(`members/${freezeMember.id}/freeze/`, { freeze_until: freezeUntil });
      alert(res.data.message);
      setFreezeMember(null);
      setFreezeUntil('');
      fetchMembers();
    } catch (err) {
      alert('Неверная дата или ошибка сервера.');
    }
  };

  const filtered = members.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.card_number.includes(search) ||
    (m.phone_number && m.phone_number.includes(search))
  );

  const getBadgeStyle = (color: string) => {
    switch (color) {
      case 'red': return { backgroundColor: '#7f1d1d', color: '#fca5a5' };
      case 'yellow': return { backgroundColor: '#78350f', color: '#fcd34d' };
      case 'blue': return { backgroundColor: '#1e3a8a', color: '#93c5fd' };
      default: return { backgroundColor: '#065f46', color: '#34d399' };
    }
  };

  if (loading) return <div style={{ color: '#94a3b8', padding: '20px' }}>Загрузка списка клиентов...</div>;

  const highlightedMemberId = Number(new URLSearchParams(location.search).get('member'));

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>Мониторинг атлетов</h1>
        <p style={{ color: '#64748b', marginTop: '5px' }}>Управление базой клиентов, заморозка и мониторинг состояний доступов</p>
      </header>

      <div style={styles.searchWrapper}>
        <Search size={20} color="#64748b" />
        <input
          style={styles.searchInput}
          placeholder="Поиск по имени, номеру карты или телефону..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Карта</th>
              <th style={styles.th}>Клиент</th>
              <th style={styles.th}>Связь</th>
              <th style={styles.th}>Всего внесено</th>
              <th style={styles.th}>Действует до</th>
              <th style={styles.th}>Тип статуса</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr
                key={m.id}
                ref={el => { rowRefs.current[m.id] = el; }}
                style={{
                  ...styles.row,
                  backgroundColor: highlightedMemberId === m.id ? '#78350f55' : 'transparent',
                  outline: highlightedMemberId === m.id ? '2px solid #f59e0b' : 'none'
                }}
              >
                <td style={styles.td}><span style={styles.cardBadge}>{m.card_number}</span></td>
                <td style={{ ...styles.td, fontWeight: '700', color: '#fff' }}>{m.full_name}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <a href={`tel:${m.phone_number}`} style={styles.iconLinkPhone} title="Позвонить"><Phone size={13} /></a>
                    <a href={`https://wa.me/${m.phone_number?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={styles.iconLinkWA} title="WhatsApp"><MessageCircle size={13} /></a>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{m.phone_number || '-'}</span>
                  </div>
                </td>
                <td style={{ ...styles.td, color: '#10b981', fontWeight: 'bold' }}>{Number(m.amount_paid).toLocaleString()} ₸</td>
                <td style={styles.td}>
                  {m.is_frozen ? (
                    `Заморожен до ${m.freeze_until}`
                  ) : (
                    <div style={styles.expiryEditor}>
                      <input
                        type="date"
                        value={expiryDrafts[m.id] ?? m.expiry_date}
                        onChange={e => setExpiryDrafts(prev => ({ ...prev, [m.id]: e.target.value }))}
                        style={styles.dateInput}
                      />
                      <button
                        onClick={() => handleSaveExpiryDate(m)}
                        disabled={(expiryDrafts[m.id] ?? m.expiry_date) === m.expiry_date}
                        style={{
                          ...styles.btnSaveDate,
                          opacity: (expiryDrafts[m.id] ?? m.expiry_date) === m.expiry_date ? 0.45 : 1,
                          cursor: (expiryDrafts[m.id] ?? m.expiry_date) === m.expiry_date ? 'default' : 'pointer'
                        }}
                        title="Сохранить дату"
                      >
                        <Save size={14} />
                      </button>
                    </div>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.baseBadge, ...getBadgeStyle(m.status_color as string) }}>
                    {m.is_frozen ? 'Заморожен' : m.days_left === 0 ? 'Красный (Истек)' : m.days_left <= 7 ? `Желтый (${m.days_left} дн.)` : `Обычный (${m.days_left} дн.)`}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleToggleFreeze(m)}
                      style={{
                        ...styles.btnFreeze,
                        backgroundColor: m.is_frozen ? '#2563eb' : 'transparent',
                        color: m.is_frozen ? '#fff' : '#60a5fa'
                      }}
                      title={m.is_frozen ? 'Разморозить' : 'Заморозить абонемент'}
                    >
                      <Snowflake size={16} />
                    </button>

                    <button onClick={() => handleExtend(m)} style={styles.btnExtend} disabled={m.is_frozen}>
                      <CalendarPlus size={16} /> <span>Продлить</span>
                    </button>

                    <button onClick={() => handleDelete(m.id, m.full_name)} style={styles.btnDelete}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {freezeMember && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Заморозить абонемент</h3>
            <p style={styles.modalText}>{freezeMember.full_name}</p>
            <input
              type="date"
              value={freezeUntil}
              onChange={e => setFreezeUntil(e.target.value)}
              style={styles.modalDateInput}
              autoFocus
            />
            <div style={styles.modalActions}>
              <button onClick={() => setFreezeMember(null)} style={styles.btnCancel}>Отмена</button>
              <button onClick={handleConfirmFreeze} style={styles.btnConfirm}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  searchWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '14px 18px', borderRadius: '14px', marginBottom: '25px', border: '1px solid #334155', gap: '12px', width: '100%', boxSizing: 'border-box' as const },
  searchInput: { flex: 1, backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '16px', outline: 'none', minWidth: 0 },
  tableContainer: { backgroundColor: '#1e293b', borderRadius: '24px', overflowX: 'auto' as const, border: '1px solid #334155', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.3)', width: '100%', boxSizing: 'border-box' as const },
  table: { width: '100%', minWidth: '900px', borderCollapse: 'collapse' as const },
  headerRow: { backgroundColor: '#0f172a' },
  th: { padding: '16px 18px', textAlign: 'left' as const, color: '#64748b', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '1px', fontWeight: '700' },
  td: { padding: '14px 18px', borderBottom: '1px solid #334155', color: '#e2e8f0', fontSize: '14px' },
  row: { borderBottom: '1px solid #334155', scrollMarginTop: '32px' },
  cardBadge: { fontFamily: 'monospace', backgroundColor: '#0f172a', padding: '4px 8px', borderRadius: '6px', color: '#3b82f6', border: '1px solid #334155' },
  iconLinkPhone: { color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', backgroundColor: '#3b82f610', borderRadius: '6px', textDecoration: 'none' },
  iconLinkWA: { color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', backgroundColor: '#10b98110', borderRadius: '6px', textDecoration: 'none' },
  expiryEditor: { display: 'flex', alignItems: 'center', gap: '8px' },
  dateInput: { backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', borderRadius: '8px', padding: '6px 8px', fontSize: '13px', outline: 'none' },
  btnSaveDate: { background: '#10b98118', border: '1px solid #10b98140', color: '#10b981', padding: '7px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  baseBadge: { padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', display: 'inline-block' },
  btnExtend: { background: '#3b82f615', border: '1px solid #3b82f630', color: '#3b82f6', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '13px' },
  btnFreeze: { background: 'none', border: '1px solid #60a5fa40', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: '0.2s' },
  btnDelete: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' },
  modalOverlay: { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { width: '320px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.45)' },
  modalTitle: { margin: '0 0 8px', color: '#fff', fontSize: '18px', fontWeight: 800 },
  modalText: { margin: '0 0 14px', color: '#94a3b8', fontSize: '14px' },
  modalDateInput: { width: '100%', boxSizing: 'border-box' as const, backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', borderRadius: '10px', padding: '10px', fontSize: '14px', outline: 'none' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' },
  btnCancel: { background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px' },
  btnConfirm: { background: '#2563eb', border: '1px solid #2563eb', color: '#fff', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', fontWeight: 700 },
};
