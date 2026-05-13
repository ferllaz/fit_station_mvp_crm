import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  { label: '1 месяц (Безлимит)', months: 1, price: 25000 },
  { label: '3 месяца', months: 3, price: 60000 },
  { label: '6 месяцев', months: 6, price: 90000 },
  { label: '1 год', months: 12, price: 180000 },
];

export default function AddMember() {
  const [form, setForm] = useState({ card_number: '', full_name: '', phone_number: '', expiry_date: '', amount_paid: 0 });
  const navigate = useNavigate();

  // Автоматический расчет даты и цены
  const handlePlanSelect = (plan: typeof PLANS[0]) => {
    const d = new Date();
    d.setMonth(d.getMonth() + plan.months);
    setForm({
      ...form,
      amount_paid: plan.price,
      expiry_date: d.toISOString().split('T')[0]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('members/', form);
      alert(`Клиент добавлен. Оплачено: ${form.amount_paid} KZT`);
      navigate('/list');
    } catch { alert('Ошибка регистрации'); }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', color: '#fff' }}>
      <h2>Новый абонемент</h2>
      <form onSubmit={handleSubmit} style={s.form}>
        <input placeholder="Номер карты" required style={s.input} onChange={e => setForm({...form, card_number: e.target.value})} />
        <input placeholder="ФИО клиента" required style={s.input} onChange={e => setForm({...form, full_name: e.target.value})} />
        <input placeholder="Номер телефона (+7...)" style={s.input} onChange={e => setForm({...form, phone_number: e.target.value})} />
        
        <label>Выберите тариф:</label>
        <div style={s.planGrid}>
          {PLANS.map(p => (
            <div key={p.label} onClick={() => handlePlanSelect(p)} 
                 style={form.amount_paid === p.price ? s.planActive : s.plan}>
              {p.label} <br/> <strong>{p.price} ₸</strong>
            </div>
          ))}
        </div>

        <div style={s.summary}>
          <p>Сумма к оплате: <strong>{form.amount_paid} KZT</strong></p>
          <p>Действует до: <strong>{form.expiry_date || 'выберите тариф'}</strong></p>
        </div>

        <button type="submit" style={s.btn}>Оформить продажу</button>
      </form>
    </div>
  );
}

const s = {
  form: { display: 'flex', flexDirection: 'column' as const, gap: '15px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff' },
  planGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  plan: { padding: '10px', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' as const, fontSize: '13px' },
  planActive: { padding: '10px', border: '2px solid #3b82f6', backgroundColor: '#3b82f620', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' as const, fontSize: '13px' },
  summary: { padding: '15px', backgroundColor: '#0f172a', borderRadius: '8px', borderLeft: '4px solid #10b981' },
  btn: { padding: '15px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};