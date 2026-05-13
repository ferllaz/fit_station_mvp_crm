import { useEffect, useState } from 'react';
import api from '../api';
import type { Member } from '../types';
import { 
  Users, 
  AlertTriangle, 
  UserX, 
  Banknote, 
  TrendingUp, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('members/')
      .then(res => setMembers(res.data))
      .catch(err => console.error("Ошибка загрузки:", err))
      .finally(() => setLoading(false));
  }, []);

  // --- БИЗНЕС ЛОГИКА ---
  const totalMembers = members.length;
  
  // Правильный расчет выручки (превращаем строку в число)
  const totalRevenue = members.reduce((sum, m) => sum + parseFloat(m.amount_paid as any || 0), 0);
  
  const expiredCount = members.filter(m => m.days_left === 0).length;
  const warningCount = members.filter(m => m.days_left > 0 && m.days_left <= 7).length;

  // Список "Критических" клиентов (истекают скоро) для быстрого реагирования
  const criticalMembers = members
    .filter(m => m.days_left > 0 && m.days_left <= 5)
    .sort((a, b) => a.days_left - b.days_left)
    .slice(0, 5);

  // Финансовая цель (для красоты на защите)
  const revenueGoal = 1000000; 
  const goalPercentage = Math.min((totalRevenue / revenueGoal) * 100, 100);

  if (loading) return <div style={s.loader}>Анализ данных FIT STATION...</div>;

  return (
    <div style={s.container}>
      <header style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Рабочий стол</h1>
          <p style={s.subtitle}>Обзор ключевых показателей клуба на сегодня</p>
        </div>
        <div style={s.dateBox}>
          <Calendar size={18} />
          <span>{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
        </div>
      </header>

      {/* ГРИД С КАРТОЧКАМИ */}
      <div style={s.statsGrid}>
        <StatCard 
          title="Общая выручка" 
          value={`${totalRevenue.toLocaleString()} ₸`} 
          icon={Banknote} 
          color="#10b981" 
          desc="За все время"
        />
        <StatCard 
          title="Активных клиентов" 
          value={totalMembers - expiredCount} 
          icon={Users} 
          color="#3b82f6" 
          desc={`Из ${totalMembers} зарегистрированных`}
        />
        <StatCard 
          title="Требуют внимания" 
          value={warningCount} 
          icon={AlertTriangle} 
          color="#f59e0b" 
          desc="Срок истекает (≤7 дн.)"
        />
        <StatCard 
          title="Доступ заблокирован" 
          value={expiredCount} 
          icon={UserX} 
          color="#ef4444" 
          desc="Просроченные абонементы"
        />
      </div>

      <div style={s.bottomSection}>
        {/* БЛОК ВЫРУЧКИ */}
        <div style={s.revenueCard}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}><TrendingUp size={20} color="#10b981" /> Прогресс по выручке</h3>
          </div>
          <div style={s.goalInfo}>
            <span>Цель на месяц: {revenueGoal.toLocaleString()} ₸</span>
            <span style={{ fontWeight: 'bold' }}>{goalPercentage.toFixed(1)}%</span>
          </div>
          <div style={s.progressBg}>
            <div style={{ ...s.progressFill, width: `${goalPercentage}%` }} />
          </div>
          <p style={s.revenueNote}>Для достижения цели осталось {(revenueGoal - totalRevenue).toLocaleString()} ₸</p>
        </div>

        {/* БЛОК КРИТИЧЕСКИХ КЛИЕНТОВ */}
        <div style={s.criticalCard}>
          <h3 style={s.cardTitle}>Срочное продление</h3>
          <div style={s.criticalList}>
            {criticalMembers.length > 0 ? criticalMembers.map(m => (
              <div key={m.id} style={s.criticalItem} onClick={() => navigate(`/list`)}>
                <div>
                  <div style={s.mName}>{m.full_name}</div>
                  <div style={s.mPhone}>{m.phone_number || 'Нет телефона'}</div>
                </div>
                <div style={s.mDays}>
                  {m.days_left} дн.
                  <ChevronRight size={16} />
                </div>
              </div>
            )) : <p style={{ color: '#64748b' }}>Все клиенты имеют активный доступ.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- ВСПОМОГАТЕЛЬНЫЙ КОМПОНЕНТ КАРТОЧКИ ---
const StatCard = ({ title, value, icon: Icon, color, desc }: any) => (
  <div style={s.statCard}>
    <div style={s.statHeader}>
      <div style={{ ...s.iconCircle, backgroundColor: `${color}15`, color: color }}>
        <Icon size={24} />
      </div>
      <span style={{ color: color, fontSize: '12px', fontWeight: 'bold' }}>Live</span>
    </div>
    <div style={s.statValue}>{value}</div>
    <div style={s.statTitle}>{title}</div>
    <div style={s.statDesc}>{desc}</div>
  </div>
);

// --- СТИЛИ (UI) ---
const s: { [key: string]: React.CSSProperties } = {
  container: { color: '#fff', animation: 'fadeIn 0.5s ease-in' },
  loader: { color: '#94a3b8', padding: '50px', textAlign: 'center', fontSize: '18px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' },
  pageTitle: { fontSize: '32px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { color: '#64748b', margin: '5px 0 0 0' },
  dateBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1e293b', padding: '10px 18px', borderRadius: '12px', color: '#94a3b8', fontSize: '14px', border: '1px solid #334155' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' },
  
  statCard: { backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' },
  statHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
  iconCircle: { width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
  statTitle: { fontSize: '14px', fontWeight: '600', color: '#f1f5f9' },
  statDesc: { fontSize: '12px', color: '#64748b', marginTop: '8px' },

  bottomSection: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' },
  
  revenueCard: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '20px', border: '1px solid #334155' },
  cardTitle: { fontSize: '18px', fontWeight: '700', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' },
  goalInfo: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#94a3b8' },
  progressBg: { width: '100%', height: '12px', backgroundColor: '#0f172a', borderRadius: '10px', overflow: 'hidden', marginBottom: '15px' },
  progressFill: { height: '100%', backgroundColor: '#10b981', borderRadius: '10px', transition: 'width 1s ease-out', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' },
  revenueNote: { fontSize: '13px', color: '#64748b', margin: 0 },

  criticalCard: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '20px', border: '1px solid #334155' },
  criticalList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  criticalItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#0f172a', borderRadius: '12px', cursor: 'pointer', transition: '0.2s', border: '1px solid transparent' },
  mName: { fontSize: '14px', fontWeight: '600', color: '#e2e8f0' },
  mPhone: { fontSize: '12px', color: '#64748b' },
  mDays: { display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b', fontSize: '13px', fontWeight: 'bold' }
};