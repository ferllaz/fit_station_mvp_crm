import { useEffect, useState } from 'react';
import api from '../api';
import { User, Clock, ArrowUpRight } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('payments/')
      .then(res => setPayments(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding: '20px', color: '#fff'}}>Загрузка кассы...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '30px', fontSize: '28px', fontWeight: '800' }}>Финансовая история</h1>
      
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>Дата и время</th>
              <th style={styles.th}>Клиент</th>
              <th style={styles.th}>Тренер</th>
              <th style={styles.th}>Тип операции</th>
              <th style={styles.th}>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p: any) => (
              <tr key={p.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.flexCenter}><Clock size={14} style={{marginRight: '8px', color: '#64748b'}} />
                  {new Date(p.date_paid).toLocaleString('ru-RU')}</div>
                </td>
                <td style={styles.td}>
                  <div style={styles.flexCenter}><User size={14} style={{marginRight: '8px', color: '#3b82f6'}} />
                  {p.member_name}</div>
                </td>
                <td style={styles.td}>
                  {p.trainer_display_name ? (
                    <div style={styles.trainerCell}>
                      <img
                        src={p.trainer_display_photo || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=120&q=80'}
                        alt={p.trainer_display_name}
                        style={styles.trainerPhoto}
                      />
                      <span>{p.trainer_display_name}</span>
                    </div>
                  ) : (
                    <span style={{ color: '#64748b' }}>-</span>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={styles.badge}>{p.plan_name}</span>
                </td>
                <td style={{ ...styles.td, color: '#10b981', fontWeight: 'bold' }}>
                  <div style={styles.flexCenter}><ArrowUpRight size={16} /> {Number(p.amount).toLocaleString()} ₸</div>
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
  card: { backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  thRow: { backgroundColor: '#0f172a' },
  th: { padding: '16px', textAlign: 'left' as const, color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '1px' },
  td: { padding: '16px', borderBottom: '1px solid #334155', color: '#e2e8f0', fontSize: '14px' },
  tr: { transition: '0.2s' },
  flexCenter: { display: 'flex', alignItems: 'center' },
  trainerCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  trainerPhoto: { width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover' as const, backgroundColor: '#0f172a' },
  badge: { backgroundColor: '#3b82f620', color: '#3b82f6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }
};
