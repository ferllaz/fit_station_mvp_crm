import { useEffect, useState } from 'react';
import api from '../api';
import type { Member } from '../types';
import { Search, Trash2, CalendarPlus, Phone, MessageCircle } from 'lucide-react';

export default function MembersListPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMembers = () => {
    api.get('members/').then(res => setMembers(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить клиента ${name}?`)) {
      await api.delete(`members/${id}/`);
      fetchMembers();
    }
  };

  const handleExtend = async (member: Member) => {
    if (window.confirm(`Продлить абонемент для ${member.full_name} на 30 дней за 25 000 ₸?`)) {
      try {
        const res = await api.post(`members/${member.id}/extend/`, {
          days: 30, amount: 25000, plan_name: "Продление абонемента (1 мес.)"
        });
        alert(res.data.message);
        fetchMembers();
      } catch (err) {
        alert("Ошибка при продлении абонемента");
      }
    }
  };

  const filtered = members.filter(m => 
    m.full_name.toLowerCase().includes(search.toLowerCase()) || 
    m.card_number.includes(search) ||
    (m.phone_number && m.phone_number.includes(search))
  );

  if (loading) return <div style={{ color: '#94a3b8', padding: '20px' }}>Загрузка списка клиентов...</div>;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>Мониторинг атлетов</h1>
        <p style={{ color: '#64748b', marginTop: '5px' }}>Управление базой клиентов и продление доступов</p>
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

      {/* ТАБЛИЦА С МАКСИМАЛЬНОЙ ШИРИНОЙ НА ВЕСЬ ЭКРАН */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Карта</th>
              <th style={styles.th}>Клиент</th>
              <th style={styles.th}>Связь</th>
              <th style={styles.th}>Всего внесено</th>
              <th style={styles.th}>Действует до</th>
              <th style={styles.th}>Статус</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} style={styles.row}>
                <td style={styles.td}><span style={styles.cardBadge}>{m.card_number}</span></td>
                <td style={{ ...styles.td, fontWeight: '700', color: '#fff' }}>{m.full_name}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <a href={`tel:${m.phone_number}`} style={styles.iconLinkPhone} title="Позвонить"><Phone size={13}/></a>
                    <a href={`https://wa.me/${m.phone_number?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={styles.iconLinkWA} title="WhatsApp"><MessageCircle size={13}/></a>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{m.phone_number || '—'}</span>
                  </div>
                </td>
                <td style={{ ...styles.td, color: '#10b981', fontWeight: 'bold' }}>{Number(m.amount_paid).toLocaleString()} ₸</td>
                <td style={styles.td}>{m.expiry_date}</td>
                <td style={styles.td}>
                  <span style={m.days_left <= 5 ? styles.badgeRed : styles.badgeGreen}>
                    {m.days_left === 0 ? 'Истек' : `${m.days_left} дн.`}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={() => handleExtend(m)} style={styles.btnExtend}>
                      <CalendarPlus size={16}/> <span>Продлить</span>
                    </button>
                    <button onClick={() => handleDelete(m.id, m.full_name)} style={styles.btnDelete}>
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  searchWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '14px 18px', borderRadius: '14px', marginBottom: '25px', border: '1px solid #334155', gap: '12px', width: '100%' },
  searchInput: { flex: 1, backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '16px', outline: 'none' },
  tableContainer: { backgroundColor: '#1e293b', borderRadius: '24px', overflowX: 'auto' as const, border: '1px solid #334155', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.3)', width: '100%' },
  table: { width: '100%', minWidth: '900px', borderCollapse: 'collapse' as const, tableLayout: 'auto' as const },
  headerRow: { backgroundColor: '#0f172a' },
  th: { padding: '16px 18px', textAlign: 'left' as const, color: '#64748b', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '1px', fontWeight: '700' },
  td: { padding: '14px 18px', borderBottom: '1px solid #334155', color: '#e2e8f0', fontSize: '14px' },
  row: { borderBottom: '1px solid #334155' },
  cardBadge: { fontFamily: 'monospace', backgroundColor: '#0f172a', padding: '4px 8px', borderRadius: '6px', color: '#3b82f6', border: '1px solid #334155' },
  iconLinkPhone: { color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', backgroundColor: '#3b82f610', borderRadius: '6px', textDecoration: 'none' },
  iconLinkWA: { color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', backgroundColor: '#10b98110', borderRadius: '6px', textDecoration: 'none' },
  badgeGreen: { backgroundColor: '#065f46', color: '#34d399', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' },
  badgeRed: { backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' },
  btnExtend: { background: '#3b82f615', border: '1px solid #3b82f630', color: '#3b82f6', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '13px' },
  btnDelete: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' },
};