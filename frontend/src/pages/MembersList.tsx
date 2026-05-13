import { useEffect, useState } from 'react';
import api from '../api';
import type { Member } from '../types';
import { Search, Trash2, CalendarPlus } from 'lucide-react';

export default function MembersListPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');

  const fetchMembers = () => api.get('members/').then(res => setMembers(res.data));

  useEffect(() => { fetchMembers(); }, []);

  // Функция удаления (Бизнес-логика)
  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Удалить клиента ${name}? Данные будут потеряны!`)) {
      await api.delete(`members/${id}/`);
      fetchMembers(); // Обновить список
    }
  };

  // Функция продления на 30 дней (Покажем Директору, как работает CRM)
  const handleExtend = async (member: Member) => {
    const newDate = new Date(member.expiry_date);
    newDate.setDate(newDate.getDate() + 30); // Прибавили 30 дней
    
    // Форматируем обратно в YYYY-MM-DD
    const dateStr = newDate.toISOString().split('T')[0];

    await api.patch(`members/${member.id}/`, { expiry_date: dateStr });
    fetchMembers();
  };

  // Поиск на лету
  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(search.toLowerCase()) || 
    m.card_number.includes(search)
  );

  return (
    <div>
      <h1 style={styles.pageTitle}>Мониторинг клиентов</h1>
      
      {/* ПАНЕЛЬ ПОИСКА */}
      <div style={styles.searchBar}>
        <Search size={20} color="#64748b" style={{ marginRight: '10px' }} />
        <input 
          style={styles.searchInput}
          placeholder="Поиск по ФИО или номеру карты..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ТАБЛИЦА */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Карта</th>
              <th>ФИО</th>
              <th>Действует до</th>
              <th>Осталось</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(m => (
              <tr key={m.id}>
                <td><code>{m.card_number}</code></td>
                <td style={{ fontWeight: '600' }}>{m.full_name}</td>
                <td>{m.expiry_date}</td>
                <td>
                  <span style={m.days_left <= 7 ? styles.badBadg : styles.goodBadg}>
                    {m.days_left} дн.
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '5px' }}>
                  <button title="Продлить +30дн." onClick={() => handleExtend(m)} style={styles.actionBtnExt}><CalendarPlus size={16}/></button>
                  <button title="Удалить" onClick={() => handleDelete(m.id, m.full_name)} style={styles.actionBtnDel}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Стили... (см. структуру CSS из прошлого App.tsx, адаптированную)
const styles = {
  pageTitle: { fontSize: '28px', marginBottom: '20px', fontWeight: '700' },
  searchBar: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #334155' },
  searchInput: { flex: 1, backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '16px', outline: 'none' },
  tableCard: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflowX: 'auto' } as const,
  table: { width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', minWidth: '600px' } as const,
  // ... стили th, td из App.tsx ...
  goodBadg: { color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '14px' },
  badBadg: { color: '#f87171', backgroundColor: 'rgba(248, 113, 113, 0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '14px' },
  actionBtnExt: { backgroundColor: '#10b98120', color: '#10b981', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' },
  actionBtnDel: { backgroundColor: '#ef444420', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' },
};
// Добавь стили th и td в styles