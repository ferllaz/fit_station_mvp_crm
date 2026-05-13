import { useEffect, useState } from 'react';
import api from '../api';
import type { Member } from '../types';
import { Users, AlertTriangle, UserX, Banknote } from 'lucide-react';

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('members/')
      .then(res => setMembers(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Расчеты бизнес-показателей
  const total = members.length;
  const revenue = members.reduce((sum, m) => sum + Number(m.amount_paid || 0), 0);
  const expired = members.filter(m => m.days_left === 0).length;
  const soon = members.filter(m => m.days_left > 0 && m.days_left <= 7).length;

  if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Загрузка аналитики...</div>;

  return (
    <div>
      <h1 style={styles.pageTitle}>Аналитика бизнеса</h1>

      <div style={styles.statsGrid}>
        {/* КАРТОЧКА ВЫРУЧКИ — Твоя главная фича */}
        <StatCard
          title="Общая выручка"
          value={`${revenue.toLocaleString()} ₸`}
          icon={Banknote}
          color="#10b981"
        />

        <StatCard
          title="Всего клиентов"
          value={total}
          icon={Users}
          color="#3b82f6"
        />

        <StatCard
          title="Истекают скоро"
          value={soon}
          icon={AlertTriangle}
          color="#f59e0b"
        />

        <StatCard
          title="Доступ закрыт"
          value={expired}
          icon={UserX}
          color="#ef4444"
        />
      </div>

      <div style={styles.infoBox}>
        <h3>Совет для администратора</h3>
        <p>У вас {soon} клиентов, у которых абонемент закончится в течение недели. Рекомендуем связаться с ними через вкладку "Мониторинг".</p>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div style={styles.card}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={styles.cardTitle}>{title}</div>
        <div style={{ ...styles.cardValue, color: color }}>{value}</div>
      </div>
      <div style={{ backgroundColor: `${color}20`, padding: '12px', borderRadius: '12px' }}>
        <Icon size={24} color={color} />
      </div>
    </div>
  </div>
);

const styles = {
  pageTitle: { fontSize: '28px', marginBottom: '20px', fontWeight: '700', color: '#fff' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #334155',
    transition: '0.2s'
  },
  cardTitle: { fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' },
  cardValue: { fontSize: '32px', fontWeight: '700', color: '#fff' },
  infoBox: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #334155'
  }
};