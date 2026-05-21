import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, CreditCard, Phone, Receipt, Sparkles, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { Trainer } from '../types';

const PLANS = [
  { label: '1 месяц', months: 1, price: 25000 },
  { label: '3 месяца', months: 3, price: 60000 },
  { label: 'Полгода', months: 6, price: 90000 },
  { label: '1 год', months: 12, price: 180000 },
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

export default function AddMember() {
  const [form, setForm] = useState({
    card_number: '',
    full_name: '',
    phone_number: '',
    expiry_date: '',
    amount_paid: 0,
    plan_name: '',
    trainer: 0,
    months: 0,
    training_service: '',
    training_months: 1,
  });
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('trainers/').then(res => {
      setTrainers(res.data.filter((trainer: Trainer) => trainer.is_active));
    });
  }, []);

  const selectPlan = (plan: typeof PLANS[0]) => {
    const d = new Date();
    d.setMonth(d.getMonth() + plan.months);
    setForm({
      ...form,
      amount_paid: plan.price,
      expiry_date: d.toISOString().split('T')[0],
      plan_name: `${plan.label} безлимит`,
      months: plan.months,
    });
  };

  const getTrainingAmount = () => {
    const service = TRAINING_SERVICES.find(item => item.label === form.training_service);
    if (!service) return 0;
    return service.monthlyPrice * form.training_months;
  };

  const trainingAmount = getTrainingAmount();
  const totalAmount = form.amount_paid + trainingAmount;
  const selectedPlan = PLANS.find(plan => plan.months === form.months);
  const selectedTrainer = trainers.find(trainer => trainer.id === form.trainer);
  const trainingTerm = TRAINING_TERMS.find(term => term.months === form.training_months);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.amount_paid) return alert('Выберите абонемент.');
    if (form.training_service && !form.trainer) return alert('Выберите тренера для дополнительной услуги.');

    const planName = form.training_service
      ? `${form.plan_name} + ${form.training_service} (${trainingTerm?.label})`
      : form.plan_name;

    try {
      await api.post('members/', {
        ...form,
        amount_paid: totalAmount,
        plan_name: planName,
      });
      alert('Продажа успешно оформлена!');
      navigate('/');
    } catch (err) {
      alert('Ошибка при сохранении. Проверьте номер карты.');
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.hero}>
        <div>
          <div style={styles.kicker}>Новая продажа</div>
          <h1 style={styles.title}>Регистрация и оплата</h1>
          <p style={styles.subtitle}>Оформите безлимитный абонемент и при необходимости добавьте тренерский пакет.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={styles.layout}>
        <div style={styles.mainColumn}>
          <section style={styles.panel}>
            <SectionTitle step="01" title="Клиент" />
            <div style={styles.inputGrid}>
              <Field icon={<CreditCard size={18} />} placeholder="Номер карты" required value={form.card_number} onChange={value => setForm({ ...form, card_number: value })} />
              <Field icon={<User size={18} />} placeholder="ФИО клиента" required value={form.full_name} onChange={value => setForm({ ...form, full_name: value })} />
              <Field icon={<Phone size={18} />} placeholder="Телефон (+7...)" value={form.phone_number} onChange={value => setForm({ ...form, phone_number: value })} />
            </div>
          </section>

          <section style={styles.panel}>
            <SectionTitle step="02" title="Абонемент" />
            <div style={styles.planGrid}>
              {PLANS.map(plan => {
                const active = form.months === plan.months;
                return (
                  <button type="button" key={plan.months} onClick={() => selectPlan(plan)} style={active ? styles.planActive : styles.plan}>
                    <span style={styles.planName}>{plan.label}</span>
                    <span style={styles.planMeta}>Безлимит</span>
                    <strong style={styles.planPrice}>{plan.price.toLocaleString()} ₸</strong>
                    {active && <CheckCircle2 size={18} style={styles.checkIcon} />}
                  </button>
                );
              })}
            </div>
          </section>

          <section style={styles.panel}>
            <SectionTitle step="03" title="Дополнительные тренировки" />
            <div style={styles.serviceGrid}>
              <button type="button" onClick={() => setForm({ ...form, training_service: '', trainer: 0 })} style={!form.training_service ? styles.serviceActive : styles.service}>
                <span style={styles.planName}>Не брать</span>
                <span style={styles.planMeta}>Только абонемент</span>
                <strong style={styles.planPrice}>0 ₸</strong>
              </button>
              {TRAINING_SERVICES.map(service => {
                const active = form.training_service === service.label;
                return (
                  <button type="button" key={service.label} onClick={() => setForm({ ...form, training_service: service.label })} style={active ? styles.serviceActive : styles.service}>
                    <span style={styles.planName}>{service.label}</span>
                    <span style={styles.planMeta}>С тренером</span>
                    <strong style={styles.planPrice}>{service.monthlyPrice.toLocaleString()} ₸/мес</strong>
                  </button>
                );
              })}
            </div>

            {form.training_service && (
              <div style={styles.termGrid}>
                {TRAINING_TERMS.map(term => (
                  <button type="button" key={term.months} onClick={() => setForm({ ...form, training_months: term.months })} style={form.training_months === term.months ? styles.termActive : styles.term}>
                    {term.label}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section style={styles.panel}>
            <SectionTitle step="04" title="Тренер" />
            <div style={styles.trainerGrid}>
              <button type="button" onClick={() => setForm({ ...form, trainer: 0, training_service: '' })} style={form.trainer === 0 ? styles.noTrainerActive : styles.noTrainer}>
                Без тренера
              </button>
              {trainers.map(trainer => (
                <button type="button" key={trainer.id} onClick={() => setForm({ ...form, trainer: trainer.id })} style={form.trainer === trainer.id ? styles.trainerActive : styles.trainer}>
                  <img src={trainer.photo_url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=240&q=80'} alt={trainer.full_name} style={styles.trainerPhoto} />
                  <span style={styles.trainerName}>{trainer.full_name}</span>
                  <span style={styles.trainerSpec}>{trainer.specialty || 'Тренер'}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside style={styles.summary}>
          <div style={styles.summaryHeader}>
            <Receipt size={22} />
            <span>Итог продажи</span>
          </div>

          <div style={styles.summaryRows}>
            <SummaryRow label="Абонемент" value={selectedPlan ? `${selectedPlan.label} - ${selectedPlan.price.toLocaleString()} ₸` : 'Не выбран'} />
            <SummaryRow label="Доп. тренировки" value={form.training_service ? `${form.training_service}, ${trainingTerm?.label} - ${trainingAmount.toLocaleString()} ₸` : 'Нет'} />
            <SummaryRow label="Тренер" value={selectedTrainer?.full_name || 'Без тренера'} />
            <SummaryRow label="Доступ до" value={form.expiry_date || '-'} />
          </div>

          <div style={styles.totalBlock}>
            <span>К оплате</span>
            <strong>{totalAmount.toLocaleString()} ₸</strong>
          </div>

          <button type="submit" style={styles.submitBtn}>
            <Sparkles size={18} /> Подтвердить оплату
          </button>
        </aside>
      </form>
    </div>
  );
}

function SectionTitle({ step, title }: { step: string; title: string }) {
  return (
    <div style={styles.sectionTitle}>
      <span style={styles.step}>{step}</span>
      <h2 style={styles.h2}>{title}</h2>
    </div>
  );
}

function Field({ icon, placeholder, value, onChange, required }: { icon: ReactNode; placeholder: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldIcon}>{icon}</span>
      <input required={required} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={styles.input} />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.summaryRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { width: '100%', maxWidth: '1180px', margin: '0 auto', color: '#fff' },
  hero: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' },
  kicker: { color: '#38bdf8', fontSize: '13px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.7px' },
  title: { margin: '6px 0 8px', color: '#fff', fontSize: '34px', fontWeight: 950, letterSpacing: 0 },
  subtitle: { color: '#94a3b8', fontSize: '15px' },
  layout: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '22px', alignItems: 'start' },
  mainColumn: { display: 'flex', flexDirection: 'column', gap: '16px' },
  panel: { backgroundColor: '#172033', border: '1px solid #334155', borderRadius: '16px', padding: '18px', boxShadow: '0 18px 40px rgba(2, 6, 23, 0.18)' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
  step: { width: '32px', height: '32px', borderRadius: '9px', backgroundColor: '#0f172a', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, border: '1px solid #334155' },
  h2: { margin: 0, color: '#f8fafc', fontSize: '18px', fontWeight: 900, letterSpacing: 0 },
  inputGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' },
  field: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '0 12px' },
  fieldIcon: { color: '#60a5fa', display: 'flex' },
  input: { width: '100%', minWidth: 0, padding: '14px 0', backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px' },
  planGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' },
  serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' },
  plan: { position: 'relative', minHeight: '108px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', cursor: 'pointer', textAlign: 'left' },
  planActive: { position: 'relative', minHeight: '108px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px', backgroundColor: '#1d4ed8', color: '#fff', border: '1px solid #60a5fa', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 14px 26px rgba(37, 99, 235, 0.22)' },
  service: { minHeight: '98px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', cursor: 'pointer', textAlign: 'left' },
  serviceActive: { minHeight: '98px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px', backgroundColor: '#064e3b', color: '#fff', border: '1px solid #34d399', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 14px 26px rgba(16, 185, 129, 0.16)' },
  planName: { fontWeight: 900, fontSize: '15px' },
  planMeta: { color: '#cbd5e1', fontSize: '12px', marginTop: '2px' },
  planPrice: { color: '#f8fafc', fontSize: '17px', marginTop: '10px' },
  checkIcon: { position: 'absolute', right: '12px', top: '12px', color: '#bfdbfe' },
  termGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(112px, 1fr))', gap: '8px', marginTop: '12px' },
  term: { padding: '10px', border: '1px solid #334155', borderRadius: '10px', cursor: 'pointer', backgroundColor: '#0f172a', color: '#cbd5e1', fontWeight: 800 },
  termActive: { padding: '10px', border: '1px solid #34d399', borderRadius: '10px', cursor: 'pointer', backgroundColor: '#10b98118', color: '#fff', fontWeight: 900 },
  trainerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' },
  noTrainer: { minHeight: '184px', backgroundColor: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '12px', cursor: 'pointer', fontWeight: 900 },
  noTrainerActive: { minHeight: '184px', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #60a5fa', borderRadius: '12px', cursor: 'pointer', fontWeight: 900 },
  trainer: { display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', padding: '10px', cursor: 'pointer', textAlign: 'left' },
  trainerActive: { display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #60a5fa', borderRadius: '12px', padding: '10px', cursor: 'pointer', textAlign: 'left' },
  trainerPhoto: { width: '100%', height: '110px', objectFit: 'cover', borderRadius: '9px', backgroundColor: '#020617' },
  trainerName: { fontWeight: 900, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  trainerSpec: { color: '#94a3b8', fontSize: '12px', lineHeight: 1.35, minHeight: '32px' },
  summary: { position: 'sticky', top: '24px', backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '18px', padding: '18px', boxShadow: '0 22px 50px rgba(2, 6, 23, 0.25)' },
  summaryHeader: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 900, color: '#f8fafc', marginBottom: '16px' },
  summaryRows: { display: 'flex', flexDirection: 'column', gap: '12px' },
  summaryRow: { display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '12px', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '12px' },
  totalBlock: { marginTop: '18px', padding: '16px', borderRadius: '14px', backgroundColor: '#052e2b', border: '1px solid #10b98150', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a7f3d0', fontWeight: 900 },
  submitBtn: { width: '100%', marginTop: '14px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '15px', cursor: 'pointer' },
};
