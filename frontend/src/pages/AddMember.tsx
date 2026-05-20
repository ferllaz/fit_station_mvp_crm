import { useState } from 'react';
import type { FormEvent } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  { label: '1 месяц', months: 1, price: 25000 },
  { label: '3 месяца', months: 3, price: 60000 },
  { label: '6 месяцев', months: 6, price: 90000 },
  { label: '1 год', months: 12, price: 180000 },
];

export default function AddMember() {
  const [form, setForm] = useState({
    card_number: '',
    full_name: '',
    phone_number: '',
    expiry_date: '',
    amount_paid: 0
  });
  const navigate = useNavigate();

  // Функция расчета: при выборе тарифа считаем дату и ставим цену
  const selectPlan = (plan: typeof PLANS[0]) => {
    const d = new Date();
    d.setMonth(d.getMonth() + plan.months);
    setForm({
      ...form,
      amount_paid: plan.price,
      expiry_date: d.toISOString().split('T')[0]
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.amount_paid) return alert("Выберите тарифный план!");
    
    try {
      await api.post('members/', form);
      alert('Продажа успешно оформлена!');
      navigate('/'); // После регистрации идем на дашборд смотреть выручку
    } catch (err) {
      alert('Ошибка при сохранении. Проверьте номер карты.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ marginBottom: '30px' }}>Регистрация и Оплата</h1>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <input 
            placeholder="Номер карты (сканируйте)" 
            required 
            style={styles.input} 
            onChange={e => setForm({...form, card_number: e.target.value})} 
          />
          <input 
            placeholder="ФИО клиента" 
            required 
            style={styles.input} 
            onChange={e => setForm({...form, full_name: e.target.value})} 
          />
          <input 
            placeholder="Телефон (+7...)" 
            style={styles.input} 
            onChange={e => setForm({...form, phone_number: e.target.value})} 
          />
        </div>

        <label style={{ color: '#94a3b8' }}>Выберите абонемент:</label>
        <div style={styles.planGrid}>
          {PLANS.map(p => (
            <div 
              key={p.label} 
              onClick={() => selectPlan(p)} 
              style={form.amount_paid === p.price ? styles.planActive : styles.plan}
            >
              <div style={{fontWeight: 'bold'}}>{p.label}</div>
              <div style={{color: form.amount_paid === p.price ? '#fff' : '#10b981'}}>{p.price.toLocaleString()} ₸</div>
            </div>
          ))}
        </div>

        {form.amount_paid > 0 && (
          <div style={styles.summary}>
            <div>Итого к оплате: <strong style={{fontSize: '20px'}}>{form.amount_paid.toLocaleString()} ₸</strong></div>
            <div style={{fontSize: '13px', color: '#94a3b8'}}>Доступ до: {form.expiry_date}</div>
          </div>
        )}

        <button type="submit" style={styles.submitBtn}>Подтвердить оплату</button>
      </form>
    </div>
  );
}

const styles = {
  form: { display: 'flex', flexDirection: 'column' as const, gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  input: { padding: '14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '16px' },
  planGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  plan: { padding: '15px', border: '1px solid #334155', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const, transition: '0.2s' },
  planActive: { padding: '15px', border: '1px solid #3b82f6', backgroundColor: '#3b82f6', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' },
  summary: { padding: '20px', backgroundColor: '#0f172a', borderRadius: '12px', borderLeft: '4px solid #10b981' },
  submitBtn: { padding: '16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }
};