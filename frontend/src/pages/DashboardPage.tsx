import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Banknote, CalendarRange, Receipt, Users, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { Member } from '../types';

type Payment = {
  id: number;
  member: number;
  member_name: string;
  amount: number | string;
  plan_name: string;
  date_paid: string;
  trainer_display_name?: string;
};

type PeriodMode = 'month' | 'range';

const formatMoney = (value: number) => `${value.toLocaleString('ru-RU')} ₸`;

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthBounds = (monthValue: string) => {
  const [year, month] = monthValue.split('-').map(Number);
  return {
    start: new Date(year, month - 1, 1, 0, 0, 0, 0),
    end: new Date(year, month, 0, 23, 59, 59, 999),
  };
};

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [dateFrom, setDateFrom] = useState(`${getCurrentMonth()}-01`);
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const navigate = useNavigate();

  useEffect(() => {
    api.get('members/').then(res => setMembers(res.data));
    api.get('payments/').then(res => setPayments(res.data));
  }, []);

  const activeMembers = members.filter(m => m.days_left > 0).length;
  const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const periodBounds = useMemo(() => {
    if (periodMode === 'month') return getMonthBounds(selectedMonth);

    return {
      start: dateFrom ? new Date(`${dateFrom}T00:00:00`) : null,
      end: dateTo ? new Date(`${dateTo}T23:59:59.999`) : null,
    };
  }, [dateFrom, dateTo, periodMode, selectedMonth]);

  const periodPayments = useMemo(() => {
    return payments.filter(payment => {
      const paidAt = new Date(payment.date_paid);
      if (periodBounds.start && paidAt < periodBounds.start) return false;
      if (periodBounds.end && paidAt > periodBounds.end) return false;
      return true;
    });
  }, [payments, periodBounds]);

  const periodRevenue = periodPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const recentPayments = payments.slice(0, 5);

  const payingClients = useMemo(() => {
    const byClient = new Map<number, {
      id: number;
      name: string;
      total: number;
      paymentsCount: number;
      lastPaid: string;
      plans: Set<string>;
    }>();

    periodPayments.forEach(payment => {
      const current = byClient.get(payment.member) || {
        id: payment.member,
        name: payment.member_name,
        total: 0,
        paymentsCount: 0,
        lastPaid: payment.date_paid,
        plans: new Set<string>(),
      };

      current.total += Number(payment.amount || 0);
      current.paymentsCount += 1;
      current.plans.add(payment.plan_name);
      if (new Date(payment.date_paid) > new Date(current.lastPaid)) {
        current.lastPaid = payment.date_paid;
      }
      byClient.set(payment.member, current);
    });

    return Array.from(byClient.values()).sort((a, b) => b.total - a.total);
  }, [periodPayments]);

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Fit Station <span style={{ color: '#38bdf8' }}>Pro</span></h1>
          <p style={s.subtitle}>Панель управления клубом, кассой и оплатами клиентов</p>
        </div>
      </header>

      <div style={s.statsGrid}>
        <div style={{ ...s.mainCard, background: 'linear-gradient(135deg, #2563eb 0%, #0f766e 100%)' }}>
          <Wallet size={30} style={{ marginBottom: '18px' }} />
          <div style={s.cardLabel}>Общая выручка</div>
          <div style={s.cardValue}>{formatMoney(totalRevenue)}</div>
        </div>

        <div style={{ ...s.mainCard, background: 'linear-gradient(135deg, #059669 0%, #365314 100%)' }}>
          <Users size={30} style={{ marginBottom: '18px' }} />
          <div style={s.cardLabel}>Активных клиентов</div>
          <div style={s.cardValue}>{activeMembers} <span style={s.cardUnit}>чел.</span></div>
        </div>

        <div style={{ ...s.mainCard, background: 'linear-gradient(135deg, #d97706 0%, #7c2d12 100%)' }}>
          <Receipt size={30} style={{ marginBottom: '18px' }} />
          <div style={s.cardLabel}>Выручка за период</div>
          <div style={s.cardValue}>{formatMoney(periodRevenue)}</div>
        </div>
      </div>

      <section style={s.periodPanel}>
        <div style={s.periodTop}>
          <div>
            <h2 style={s.sectionTitle}>Доход за период</h2>
            <p style={s.sectionText}>Выберите месяц или произвольные даты, чтобы увидеть сумму и клиентов с оплатами.</p>
          </div>
          <div style={s.modeSwitch}>
            <button onClick={() => setPeriodMode('month')} style={periodMode === 'month' ? s.modeActive : s.modeBtn}>Месяц</button>
            <button onClick={() => setPeriodMode('range')} style={periodMode === 'range' ? s.modeActive : s.modeBtn}>Период</button>
          </div>
        </div>

        <div style={s.filtersRow}>
          {periodMode === 'month' ? (
            <label style={s.filterField}>
              <span>Месяц</span>
              <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={s.input} />
            </label>
          ) : (
            <>
              <label style={s.filterField}>
                <span>С</span>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={s.input} />
              </label>
              <label style={s.filterField}>
                <span>По</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={s.input} />
              </label>
            </>
          )}

          <div style={s.periodTotal}>
            <CalendarRange size={18} />
            <div>
              <span style={s.periodTotalLabel}>Оплат</span>
              <strong>{periodPayments.length}</strong>
            </div>
            <div>
              <span style={s.periodTotalLabel}>Клиентов</span>
              <strong>{payingClients.length}</strong>
            </div>
            <div>
              <span style={s.periodTotalLabel}>Сумма</span>
              <strong>{formatMoney(periodRevenue)}</strong>
            </div>
          </div>
        </div>
      </section>

      <div style={s.contentLayout}>
        <section style={s.sectionCard}>
          <div style={s.sectionHeader}>
            <h3 style={s.h3}>Клиенты с оплатами за период</h3>
          </div>

          {payingClients.length === 0 ? (
            <div style={s.emptyState}>За выбранный период оплат не найдено.</div>
          ) : (
            <div style={s.clientList}>
              {payingClients.map(client => (
                <div key={client.id} style={s.clientRow}>
                  <div style={s.clientAvatar}>{client.name.slice(0, 1)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.clientName}>{client.name}</div>
                    <div style={s.clientMeta}>
                      {client.paymentsCount} оплат(ы) · {Array.from(client.plans).slice(0, 2).join(', ')}
                    </div>
                  </div>
                  <div style={s.clientMoney}>
                    <strong>{formatMoney(client.total)}</strong>
                    <span>{new Date(client.lastPaid).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={s.sectionCard}>
          <div style={s.sectionHeader}>
            <h3 style={s.h3}>Последние поступления</h3>
            <button onClick={() => navigate('/payments')} style={s.viewAllBtn}>Все операции <ArrowRight size={14}/></button>
          </div>
          <div style={s.transactionList}>
            {recentPayments.map(payment => (
              <div key={payment.id} style={s.transactionItem}>
                <div style={s.transactionIcon}><Banknote size={18} color="#10b981"/></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.clientName}>{payment.member_name}</div>
                  <div style={s.clientMeta}>{payment.plan_name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={s.moneyText}>+{formatMoney(Number(payment.amount || 0))}</div>
                  <div style={s.dateText}>{new Date(payment.date_paid).toLocaleDateString('ru-RU')}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: { width: '100%', display: 'flex', flexDirection: 'column', flex: 1 },
  header: { marginBottom: '28px' },
  title: { fontSize: '36px', fontWeight: 950, margin: 0, color: '#fff', letterSpacing: 0 },
  subtitle: { color: '#64748b', marginTop: '6px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '18px', width: '100%' },
  mainCard: { padding: '28px', borderRadius: '18px', boxShadow: '0 18px 40px rgba(2,6,23,0.22)', border: '1px solid rgba(255,255,255,0.1)' },
  cardLabel: { fontSize: '12px', textTransform: 'uppercase', opacity: 0.82, marginBottom: '8px', letterSpacing: 0, fontWeight: 800 },
  cardValue: { fontSize: '34px', fontWeight: 950, color: '#fff' },
  cardUnit: { fontSize: '16px', fontWeight: 500 },
  periodPanel: { backgroundColor: '#172033', border: '1px solid #334155', borderRadius: '18px', padding: '20px', marginBottom: '18px' },
  periodTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' },
  sectionTitle: { margin: 0, color: '#fff', fontSize: '20px', fontWeight: 900, letterSpacing: 0 },
  sectionText: { color: '#94a3b8', marginTop: '5px', fontSize: '14px' },
  modeSwitch: { display: 'flex', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '4px', gap: '4px' },
  modeBtn: { background: 'transparent', border: 'none', color: '#94a3b8', padding: '9px 12px', borderRadius: '9px', cursor: 'pointer', fontWeight: 800 },
  modeActive: { backgroundColor: '#2563eb', border: 'none', color: '#fff', padding: '9px 12px', borderRadius: '9px', cursor: 'pointer', fontWeight: 900 },
  filtersRow: { display: 'flex', alignItems: 'stretch', gap: '12px', flexWrap: 'wrap' },
  filterField: { display: 'flex', flexDirection: 'column', gap: '6px', color: '#94a3b8', fontSize: '12px', fontWeight: 800, minWidth: '190px' },
  input: { backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '10px', padding: '11px 12px', outline: 'none', fontSize: '14px' },
  periodTotal: { flex: 1, minWidth: '300px', display: 'grid', gridTemplateColumns: 'auto repeat(3, minmax(80px, 1fr))', alignItems: 'center', gap: '14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '10px 14px', color: '#e2e8f0' },
  periodTotalLabel: { display: 'block', color: '#64748b', fontSize: '11px', marginBottom: '2px' },
  contentLayout: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(360px, 0.8fr)', gap: '18px', width: '100%', flex: 1 },
  sectionCard: { backgroundColor: '#172033', padding: '20px', borderRadius: '18px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', minWidth: 0 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  h3: { margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' },
  viewAllBtn: { background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: 800 },
  emptyState: { padding: '26px', borderRadius: '14px', backgroundColor: '#0f172a', border: '1px dashed #334155', color: '#64748b', textAlign: 'center' },
  clientList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  clientRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#0f172a', borderRadius: '14px', border: '1px solid #263449' },
  clientAvatar: { width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#1d4ed8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 },
  clientName: { fontWeight: 850, fontSize: '14px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  clientMeta: { color: '#64748b', fontSize: '12px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  clientMoney: { textAlign: 'right', color: '#10b981', display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 },
  transactionList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  transactionItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#0f172a', borderRadius: '14px', border: '1px solid #263449' },
  transactionIcon: { padding: '10px', backgroundColor: '#10b98110', borderRadius: '12px', display: 'flex' },
  moneyText: { fontWeight: 900, color: '#10b981', fontSize: '14px' },
  dateText: { fontSize: '11px', color: '#64748b', marginTop: '2px' },
};
