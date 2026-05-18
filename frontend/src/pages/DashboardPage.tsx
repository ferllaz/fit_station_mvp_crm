import { useEffect, useState } from 'react';
import api from '../api';
import type { Member } from '../types';
import { Banknote, Users, Zap, ArrowRight, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('members/').then(res => setMembers(res.data));
    api.get('payments/').then(res => setPayments(res.data.slice(0, 5)));
  }, []);

  const totalRevenue = members.reduce((sum, m) => sum + parseFloat(m.amount_paid as any || 0), 0);
  const activeMembers = members.filter(m => m.days_left > 0).length;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <header style={{ marginBottom: '35px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>Fit Station <span style={{ color: '#3b82f6' }}>Pro</span></h1>
        <p style={{ color: '#64748b', marginTop: '5px' }}>Панель управления клубом в реальном времени</p>
      </header>

      {/* АДАПТИВНАЯ СЕТКА КАРТОЧЕК НА ВЕСЬ ЭКРАН */}
      <div style={s.statsGrid}>
        <div style={{ ...s.mainCard, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
          <Wallet size={32} style={{ marginBottom: '20px' }} />
          <div style={s.cardLabel}>Общая выручка</div>
          <div style={s.cardValue}>{totalRevenue.toLocaleString()} ₸</div>
        </div>

        <div style={{ ...s.mainCard, background: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)' }}>
          <Users size={32} style={{ marginBottom: '20px' }} />
          <div style={s.cardLabel}>Активных атлетов</div>
          <div style={s.cardValue}>{activeMembers} <span style={{fontSize: '16px', fontWeight: '400'}}>чел.</span></div>
        </div>

        <div style={{ ...s.mainCard, background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' }}>
          <Zap size={32} style={{ marginBottom: '20px' }} />
          <div style={s.cardLabel}>Темп роста кассы</div>
          <div style={s.cardValue}>+12.4%</div>
        </div>
      </div>

      {/* НИЖНЯЯ СЕКЦИЯ ТОЖЕ АДАПТИВНАЯ */}
      <div style={s.contentLayout}>
        <div style={s.sectionCard}>
          <div style={s.sectionHeader}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Последние поступления</h3>
            <button onClick={() => navigate('/payments')} style={s.viewAllBtn}>Все операции <ArrowRight size={14}/></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {payments.map((p: any) => (
              <div key={p.id} style={s.transactionItem}>
                <div style={s.transactionIcon}><Banknote size={18} color="#10b981"/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{p.member_name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{p.plan_name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', color: '#10b981' }}>+{p.amount} ₸</div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>{new Date(p.date_paid).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.sectionCard}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '800' }}>Быстрые действия</h3>
          <div style={s.actionsGrid}>
            <button onClick={() => navigate('/check')} style={s.actionBtn}>Проверить карту</button>
            <button onClick={() => navigate('/add')} style={{ ...s.actionBtn, backgroundColor: '#3b82f6', color: '#fff' }}>Регистрация</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '30px', width: '100%' },
  mainCard: { padding: '35px', borderRadius: '24px', flex: 1, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' },
  cardLabel: { fontSize: '13px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '8px', letterSpacing: '0.5px' },
  cardValue: { fontSize: '36px', fontWeight: '900' },
  contentLayout: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px', width: '100%', flex: 1 },
  sectionCard: { backgroundColor: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  viewAllBtn: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: '600' },
  transactionItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '14px', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #233149' },
  transactionIcon: { padding: '10px', backgroundColor: '#10b98110', borderRadius: '12px' },
  actionsGrid: { display: 'flex', flexDirection: 'column' as const, gap: '12px', flex: 1, justifyContent: 'center' },
  actionBtn: { width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#94a3b8', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }
};