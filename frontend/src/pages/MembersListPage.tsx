import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import type { Member, Trainer } from '../types';
import { Search, Trash2, CalendarPlus, Phone, MessageCircle, Snowflake, Save, Dumbbell, X } from 'lucide-react';

const PURCHASE_PLANS = [
  { label: '1 месяц', months: 1, days: 30, amount: 25000 },
  { label: '3 месяца', months: 3, days: 90, amount: 60000 },
  { label: 'Полгода', months: 6, days: 180, amount: 90000 },
  { label: '1 год', months: 12, days: 365, amount: 180000 },
];

const TRAINING_SERVICES = [
  { label: 'Минигруппа', monthlyPrice: 30000 },
  { label: 'Индивидуально', monthlyPrice: 50000 },
];

const TRAINING_TERMS = [
  { label: '1 месяц', months: 1 },
  { label: '3 месяца', months: 3 },
  { label: '6 месяцев', months: 6 },
  { label: '1 год', months: 12 },
];

export default function MembersListPage() {
  const location = useLocation();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expiryDrafts, setExpiryDrafts] = useState<Record<number, string>>({});
  const [freezeMember, setFreezeMember] = useState<Member | null>(null);
  const [freezeUntil, setFreezeUntil] = useState('');
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [purchaseMember, setPurchaseMember] = useState<Member | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(PURCHASE_PLANS[0]);
  const [selectedTrainingService, setSelectedTrainingService] = useState('');
  const [selectedTrainingMonths, setSelectedTrainingMonths] = useState(1);
  const [selectedTrainerId, setSelectedTrainerId] = useState<number>(0);
  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});

  const fetchMembers = () => {
    api.get('members/').then(res => setMembers(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
    api.get('trainers/').then(res => {
      const activeTrainers = res.data.filter((trainer: Trainer) => trainer.is_active);
      setTrainers(activeTrainers);
    });
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
    setPurchaseMember(member);
    setSelectedPlan(PURCHASE_PLANS[0]);
    setSelectedTrainingService('');
    setSelectedTrainingMonths(1);
    setSelectedTrainerId(0);
  };

  const handleConfirmPurchase = async () => {
    if (!purchaseMember) return;
    if (selectedTrainingService && !selectedTrainerId) return alert('Выберите тренера для дополнительной услуги.');

    const trainingAmount = getTrainingAmount();
    const trainingTerm = TRAINING_TERMS.find(term => term.months === selectedTrainingMonths);
    const planName = selectedTrainingService
      ? `${selectedPlan.label} безлимит + ${selectedTrainingService} (${trainingTerm?.label})`
      : `${selectedPlan.label} безлимит`;

    try {
      const res = await api.post(`members/${purchaseMember.id}/extend/`, {
        days: selectedPlan.days,
        amount: selectedPlan.amount + trainingAmount,
        plan_name: planName,
        trainer: selectedTrainerId || null,
      });
      alert(res.data.message);
      setPurchaseMember(null);
      fetchMembers();
    } catch (err) {
      alert('Ошибка при оформлении покупки');
    }
  };

  const getTrainingAmount = () => {
    const service = TRAINING_SERVICES.find(item => item.label === selectedTrainingService);
    if (!service) return 0;
    return service.monthlyPrice * selectedTrainingMonths;
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

      {purchaseMember && (
        <div style={styles.modalOverlay}>
          <div style={styles.purchaseModal}>
            <div style={styles.purchaseHeader}>
              <div>
                <div style={styles.purchaseKicker}>Продление и доп. услуги</div>
                <h3 style={styles.modalTitle}>Покупка абонемента</h3>
                <p style={styles.modalText}>{purchaseMember.full_name}</p>
              </div>
              <button onClick={() => setPurchaseMember(null)} style={styles.closeBtn} title="Закрыть">
                <X size={18} />
              </button>
            </div>

            <div style={styles.purchaseSection}>
              <div style={styles.sectionLabel}>Абонемент</div>
              <div style={styles.planPicker}>
                {PURCHASE_PLANS.map(plan => (
                  <button
                    key={plan.months}
                    onClick={() => setSelectedPlan(plan)}
                    style={selectedPlan.months === plan.months ? styles.purchasePlanActive : styles.purchasePlan}
                  >
                    <span>
                      {plan.label}
                      <small style={styles.planNote}>Безлимит</small>
                    </span>
                    <strong>{plan.amount.toLocaleString()} ₸</strong>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.purchaseSection}>
              <div style={styles.sectionLabel}>Дополнительные тренировки</div>
              <div style={styles.planPicker}>
                <button
                  onClick={() => {
                    setSelectedTrainingService('');
                    setSelectedTrainerId(0);
                  }}
                  style={!selectedTrainingService ? styles.purchasePlanActive : styles.purchasePlan}
                >
                  <span>
                    Не брать
                    <small style={styles.planNote}>Только абонемент</small>
                  </span>
                  <strong>0 ₸</strong>
                </button>
                {TRAINING_SERVICES.map(service => (
                  <button
                    key={service.label}
                    onClick={() => setSelectedTrainingService(service.label)}
                    style={selectedTrainingService === service.label ? styles.purchasePlanActive : styles.purchasePlan}
                  >
                    <span>
                      {service.label}
                      <small style={styles.planNote}>С тренером</small>
                    </span>
                    <strong>{service.monthlyPrice.toLocaleString()} ₸/мес</strong>
                  </button>
                ))}
              </div>
            </div>

            {selectedTrainingService && (
              <div style={styles.purchaseSection}>
                <div style={styles.sectionLabel}>Срок дополнительных тренировок</div>
                <div style={styles.termPicker}>
                  {TRAINING_TERMS.map(term => (
                    <button
                      key={term.months}
                      onClick={() => setSelectedTrainingMonths(term.months)}
                      style={selectedTrainingMonths === term.months ? styles.termActive : styles.term}
                    >
                      {term.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.purchaseSection}>
              <div style={styles.sectionLabel}>Тренер для доп. услуги</div>
              <div style={styles.trainerPicker}>
                <button
                  onClick={() => {
                    setSelectedTrainerId(0);
                    setSelectedTrainingService('');
                  }}
                  style={selectedTrainerId === 0 ? styles.noTrainerChoiceActive : styles.noTrainerChoice}
                >
                  Без тренера и доп. услуг
                </button>
                {trainers.map(trainer => (
                  <button
                    key={trainer.id}
                    onClick={() => setSelectedTrainerId(trainer.id)}
                    style={selectedTrainerId === trainer.id ? styles.trainerChoiceActive : styles.trainerChoice}
                  >
                    <img
                      src={trainer.photo_url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=240&q=80'}
                      alt={trainer.full_name}
                      style={styles.trainerChoicePhoto}
                    />
                    <span style={styles.trainerChoiceName}>{trainer.full_name}</span>
                    <span style={styles.trainerChoiceMeta}>{trainer.specialty}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.purchaseFooter}>
              <div>
                <div style={styles.sectionLabel}>Итого</div>
                <div style={styles.purchaseTotal}>{(selectedPlan.amount + getTrainingAmount()).toLocaleString()} ₸</div>
                {getTrainingAmount() > 0 && (
                  <div style={{ color: '#cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                    Доп. тренировки: {getTrainingAmount().toLocaleString()} ₸
                  </div>
                )}
              </div>
              <button onClick={handleConfirmPurchase} style={styles.btnConfirm}>
                <Dumbbell size={16} /> Оформить
              </button>
            </div>
          </div>
        </div>
      )}

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
  purchaseModal: { width: 'min(900px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto' as const, backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '20px', padding: '22px', boxShadow: '0 28px 70px rgba(0,0,0,0.55)' },
  purchaseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid #334155' },
  purchaseKicker: { color: '#38bdf8', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.7px', marginBottom: '4px' },
  closeBtn: { width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#cbd5e1', cursor: 'pointer' },
  purchaseSection: { display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '16px', backgroundColor: '#172033', border: '1px solid #263449', borderRadius: '16px', padding: '14px' },
  sectionLabel: { color: '#94a3b8', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.7px' },
  planPicker: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' },
  purchasePlan: { minHeight: '78px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0', padding: '14px', cursor: 'pointer', fontWeight: 700, textAlign: 'left' as const },
  purchasePlanActive: { minHeight: '78px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', backgroundColor: '#064e3b', border: '1px solid #34d399', borderRadius: '12px', color: '#fff', padding: '14px', cursor: 'pointer', fontWeight: 800, boxShadow: '0 14px 26px rgba(16, 185, 129, 0.16)', textAlign: 'left' as const },
  planNote: { display: 'block', marginTop: '3px', color: '#94a3b8', fontSize: '12px', fontWeight: 700 },
  termPicker: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' },
  term: { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0', padding: '12px', cursor: 'pointer', fontWeight: 700 },
  termActive: { backgroundColor: '#3b82f620', border: '1px solid #3b82f6', borderRadius: '12px', color: '#fff', padding: '12px', cursor: 'pointer', fontWeight: 800 },
  trainerPicker: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' },
  noTrainerChoice: { minHeight: '188px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const, backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '12px', padding: '10px', cursor: 'pointer', fontWeight: 800 },
  noTrainerChoiceActive: { minHeight: '188px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const, backgroundColor: '#1e3a8a', border: '1px solid #60a5fa', color: '#fff', borderRadius: '12px', padding: '10px', cursor: 'pointer', fontWeight: 800 },
  trainerChoice: { display: 'flex', flexDirection: 'column' as const, alignItems: 'stretch', gap: '8px', textAlign: 'left' as const, backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '12px', padding: '10px', cursor: 'pointer', minWidth: 0 },
  trainerChoiceActive: { display: 'flex', flexDirection: 'column' as const, alignItems: 'stretch', gap: '8px', textAlign: 'left' as const, backgroundColor: '#3b82f620', border: '1px solid #3b82f6', color: '#fff', borderRadius: '12px', padding: '10px', cursor: 'pointer', minWidth: 0 },
  trainerChoicePhoto: { width: '100%', height: '116px', objectFit: 'cover' as const, borderRadius: '9px', backgroundColor: '#020617' },
  trainerChoiceName: { fontWeight: 800, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  trainerChoiceMeta: { color: '#94a3b8', fontSize: '12px', lineHeight: 1.35, minHeight: '32px' },
  purchaseFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginTop: '6px', padding: '16px', border: '1px solid #10b98150', backgroundColor: '#052e2b', borderRadius: '16px' },
  purchaseTotal: { color: '#10b981', fontSize: '26px', fontWeight: 900, marginTop: '4px' },
  modalTitle: { margin: '0 0 8px', color: '#fff', fontSize: '18px', fontWeight: 800 },
  modalText: { margin: '0 0 14px', color: '#94a3b8', fontSize: '14px' },
  modalDateInput: { width: '100%', boxSizing: 'border-box' as const, backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', borderRadius: '10px', padding: '10px', fontSize: '14px', outline: 'none' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' },
  btnCancel: { background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px' },
  btnConfirm: { background: '#2563eb', border: '1px solid #2563eb', color: '#fff', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', fontWeight: 700 },
};
