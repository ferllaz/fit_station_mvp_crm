import React, { useState } from 'react';
import api from '../api';
import type { Member } from '../types';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function CheckCard() {
  const [cardNo, setCardNo] = useState('');
  const [result, setResult] = useState<Member | null>(null);
  const [error, setError] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    try {
      const res = await api.get(`members/check_card/?no=${cardNo}`);
      setResult(res.data);
    } catch (err) {
      setResult(null);
      setError(true);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Контроль доступа</h1>
      
      <form onSubmit={handleCheck} style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
        <input 
          style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '18px' }}
          placeholder="Считайте карту..."
          value={cardNo}
          onChange={e => setCardNo(e.target.value)}
          autoFocus
        />
        <button type="submit" style={{ padding: '0 30px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
          Проверить
        </button>
      </form>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', padding: '30px', backgroundColor: '#1e293b', color: '#ef4444', borderRadius: '15px', border: '2px solid #ef4444' }}>
          <ShieldAlert size={48} />
          <div style={{ marginLeft: '20px' }}>
            <h2 style={{ margin: 0 }}>КАРТА НЕ НАЙДЕНА</h2>
            <p>Проверьте номер или зарегистрируйте клиента.</p>
          </div>
        </div>
      )}

      {result && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '30px', 
          backgroundColor: result.days_left > 0 ? '#064e3b' : '#7f1d1d', 
          color: result.days_left > 0 ? '#34d399' : '#fca5a5', 
          borderRadius: '15px', 
          border: `2px solid ${result.days_left > 0 ? '#34d399' : '#ef4444'}` 
        }}>
          {result.days_left > 0 ? <ShieldCheck size={48} /> : <ShieldAlert size={48} />}
          <div style={{ marginLeft: '20px' }}>
            <h2 style={{ margin: 0 }}>{result.full_name}</h2>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {result.days_left > 0 ? `ДОСТУП РАЗРЕШЕН (${result.days_left} дн.)` : 'АБОНЕМЕНТ ИСТЕК'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}