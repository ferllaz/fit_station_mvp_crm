import { useEffect, useState } from 'react';
import api from '../api';
import type { Member } from '../types';
import { Banknote, Users, Zap, Clock, ArrowRight, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('members/').then(res => setMembers(res.data));
    api.get('payments/').then(res => setPayments(res.data.slice(0, 5))); // Берем последние 5
  }, []);

  const totalRevenue = members.reduce((sum, m) => sum + parseFloat(m.amount_paid as any || 0), 0);
  const activeMembers = members.filter(m => m.days_left > 0).length;

  return (
    <div style={{ color: '#fff' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>Fit Station <span style={{ color: '#3b82f6' }}>Pro</span></h1>
        <p style={{ color: '#64748b' }}>Панель управления клубом</p>
      </header>

      {/* ГЛАВНЫЕ КАРТОЧКИ */}
      <div style={s.statsGrid}>
        <div style={{ ...s.mainCard, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
          <Wallet size={32} style={{ marginBottom: '20px' }} />
          <div style={s.cardLabel}>Общая выручка</div>
          <div style={s.cardValue}>{totalRevenue.toLocaleString()} ₸</div>
        </div>

        <div style={{ ...s.mainCard, background: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)' }}>
          <Users size={32} style={{ marginBottom: '20px' }} />
          <div style={s.cardLabel}>Активных атлетов</div>
          <div style={s.cardValue}>{activeMembers} <span style={{fontSize: '14px', fontWeight: 'normal'}}>чел.</span></div>
        </div>

        <div style={{ ...s.mainCard, background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' }}>
          <Zap size={32} style={{ marginBottom: '20px' }} />
          <div style={s.cardLabel}>Конверсия</div>
          <div style={s.cardValue}>94%</div>
        </div>
      </div>

      <div style={s.contentLayout}>
        {/* ПОСЛЕДНИЕ ТРАНЗАКЦИИ */}
        <div style={s.sectionCard}>
          <div style={s.sectionHeader}>
            <h3 style={{ margin: 0 }}>Последние платежи</h3>
            <button onClick={() => navigate('/payments')} style={s.viewAllBtn}>Все операции <ArrowRight size={14}/></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {payments.map((p: any) => (
              <div key={p.id} style={s.transactionItem}>
                <div style={s.transactionIcon}><Banknote size={18} color="#10b981"/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.member_name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{p.plan_name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#10b981' }}>+{p.amount} ₸</div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>{new Date(p.date_paid).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* БЫСТРЫЕ ДЕЙСТВИЯ */}
        <div style={s.sectionCard}>
          <h3 style={{ marginBottom: '20px' }}>Быстрый доступ</h3>
          <div style={s.actionsGrid}>
            <ActionButton onClick={() => navigate('/check')} label="Проверка карты" icon={<Clock/>} color="#3b82f6" />
            <ActionButton onClick={() => navigate('/add')} label="Новый клиент" icon={<Users/>} color="#10b981" />
          </div>
        </div>
      </div>
    </div>
  );
}

const ActionButton = ({ label, icon, color, onClick }: any) => (
  <button onClick={onClick} style={{ ...s.actionBtn, border: `1px solid ${color}40` }}>
    <div style={{ color }}>{icon}</div>
    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{label}</span>
  </button>
);

const s: { [key: string]: React.CSSProperties } = {
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px', marginBottom: '40px' },
  mainCard: { padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.3)' },
  cardLabel: { fontSize: '13px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '5px', letterSpacing: '1px' },
  cardValue: { fontSize: '32px', fontWeight: '900' },
  contentLayout: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' },
  sectionCard: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '24px', border: '1px solid #334155' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  viewAllBtn: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' },
  transactionItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', backgroundColor: '#0f172a', borderRadius: '15px' },
  transactionIcon: { padding: '10px', backgroundColor: '#10b98115', borderRadius: '10px' },
  actionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  actionBtn: { backgroundColor: '#0f172a', padding: '20px', borderRadius: '15px', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: '0.2s' }
};