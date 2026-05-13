import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function AddMemberPage() {
  const [form, setForm] = useState({ card_number: '', full_name: '', expiry_date: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('members/', form);
      alert('Клиент успешно зарегистрирован!');
      navigate('/list'); // Перекидываем в список после успеха
    } catch (err) {
      alert('Ошибка! Возможно, такой номер карты уже занят.');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h1>Регистрация клиента</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={fStyles.group}>
          <label style={fStyles.label}>Номер карты</label>
          <input required style={fStyles.input} value={form.card_number} onChange={e => setForm({...form, card_number: e.target.value})} placeholder="Напр: 100200" />
        </div>
        <div style={fStyles.group}>
          <label style={fStyles.label}>ФИО полностью</label>
          <input required style={fStyles.input} value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Иванов Иван Иванович" />
        </div>
        <div style={fStyles.group}>
          <label style={fStyles.label}>Дата окончания абонемента</label>
          <input required type="date" style={fStyles.input} value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} />
        </div>
        <button type="submit" style={fStyles.btn}>Создать профиль</button>
      </form>
    </div>
  );
}

const fStyles = {
  group: { display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  label: { color: '#94a3b8', fontSize: '14px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff' },
  btn: { padding: '15px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
};