import { useEffect, useState } from 'react';
import api from '../api';
import type { Member } from '../types';
import { Search, Trash2, CalendarPlus, Phone, MessageCircle } from 'lucide-react';

export default function MembersListPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');

  const fetchMembers = () => api.get('members/').then(res => setMembers(res.data));
  useEffect(() => { fetchMembers(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Удалить клиента ${name}?`)) {
      await api.delete(`members/${id}/`);
      fetchMembers();
    }
  };

  const handleExtend = async (member: Member) => {
    const d = new Date(member.expiry_date);
    d.setDate(d.getDate() + 30);
    const dateStr = d.toISOString().split('T')[0];
    // При продлении добавляем стандартную цену за месяц (25к) к общей сумме
    const newAmount = Number(member.amount_paid) + 25000;

    await api.patch(`members/${member.id}/`, { 
      expiry_date: dateStr,
      amount_paid: newAmount 
    });
    fetchMembers();
    alert(`Абонемент ${member.full_name} продлен на 30 дней`);
  };

  const filtered = members.filter(m => 
    m.full_name.toLowerCase().includes(search.toLowerCase()) || m.card_number.includes(search)
  );

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px', fontWeight: '800' }}>Мониторинг и связь</h1>
      
      <div style={styles.searchWrapper}>
        <Search size={20} color="#64748b" />
        <input 
          style={styles.searchInput}
          placeholder="Поиск по имени, карте или телефону..."
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
              <th style={styles.th}>Телефон</th>
              <th style={styles.th}>Оплачено</th>
              <th style={styles.th}>Срок</th>
              <th style={styles.th}>Статус</th>
              <th style={styles.th}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} style={styles.row}>
                <td style={styles.td}><code>{m.card_number}</code></td>
                <td style={{ ...styles.td, fontWeight: '600' }}>{m.full_name}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <a href={`tel:${m.phone_number}`} style={styles.iconLink}><Phone size={16}/></a>
                    <a href={`https://wa.me/${m.phone_number?.replace(/\D/g,'')}`} target="_blank" style={{...styles.iconLink, color: '#10b981'}}><MessageCircle size={16}/></a>
                    <span style={{ fontSize: '14px' }}>{m.phone_number || '—'}</span>
                  </div>
                </td>
                <td style={styles.td}>{Number(m.amount_paid).toLocaleString()} ₸</td>
                <td style={styles.td}>{m.expiry_date}</td>
                <td style={styles.td}>
                  <span style={m.days_left <= 5 ? styles.badgeRed : styles.badgeGreen}>
                    {m.days_left} дн.
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleExtend(m)} style={styles.btnExtend} title="Продлить +30дн"><CalendarPlus size={18}/></button>
                    <button onClick={() => handleDelete(m.id, m.full_name)} style={styles.btnDelete} title="Удалить"><Trash2 size={18}/></button>
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
  searchWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '12px 16px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #334155', gap: '12px' },
  searchInput: { flex: 1, backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '16px', outline: 'none' },
  tableContainer: { backgroundColor: '#1e293b', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  headerRow: { backgroundColor: '#0f172a' },
  th: { padding: '16px', textAlign: 'left' as const, color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase' as const, letterSpacing: '1px' },
  td: { padding: '16px', borderBottom: '1px solid #334155', color: '#e2e8f0', fontSize: '15px' },
  row: { transition: '0.2s' },
  iconLink: { color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: '#0f172a', borderRadius: '8px' },
  badgeGreen: { backgroundColor: '#065f46', color: '#34d399', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' },
  badgeRed: { backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' },
  btnExtend: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '5px' },
  btnDelete: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' },
};