import React, { useState } from 'react';
import api from '../api';
import type { Member } from '../types';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function CheckCardPage() {
  const [cardNo, setCardNo] = useState('');
  const [result, setResult] = useState<Member | null>(null);
  const [error, setError] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    try {
      // Используем наш специальный action из Django
      const res = await api.get(`members/check_card/?no=${cardNo}`);
      setResult(res.data);
    } catch (err) {
      setResult(null);
      setError(true);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={styles.title}>Контроль доступа</h1>
      
      <form onSubmit={handleCheck} style={styles.searchBox}>
        <input 
          style={styles.input}
          placeholder="Считайте штрих-код или введите номер..."
          value={cardNo}
          onChange={e => setCardNo(e.target.value)}
          autoFocus
        />
        <button type="submit" style={styles.btn}>Проверить</button>
      </form>

      {error && (
        <div style={styles.errorCard}>
          <ShieldAlert size={48} color="#ef4444" />
          <div style={{ marginLeft: '20px' }}>
            <h2 style={{ margin: 0 }}>КАРТА НЕ НАЙДЕНА</h2>
            <p style={{ opacity: 0.8 }}>Проверьте правильность номера или зарегистрируйте клиента.</p>
          </div>
        </div>
      )}

      {result && (
        <div style={result.days_left > 0 ? styles.successCard : styles.expiredCard}>
          {result.days_left > 0 ? <ShieldCheck size={48} /> : <ShieldAlert size={48} />}
          <div style={{ marginLeft: '20px' }}>
            <h2 style={{ margin: 0 }}>{result.full_name}</h2>
            <p style={{ fontSize: '18px', margin: '5px 0' }}>
              {result.days_left > 0 
                ? `ДОСТУП РАЗРЕШЕН (Осталось ${result.days_left} дн.)` 
                : 'АБОНЕМЕНТ ИСТЕК!'}
            </p>
            <small>Действует до: {result.expiry_date}</small>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  title: { textAlign: 'center' as const, marginBottom: '30px' },
  searchBox: { display: 'flex', gap: '10px', marginBottom: '40px' },
  input: { flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '18px' },
  btn: { padding: '0 30px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  successCard: { display: 'flex', alignItems: 'center', padding: '30px', backgroundColor: '#064e3b', color: '#34d399', borderRadius: '15px', border: '2px solid #34d399' },
  expiredCard: { display: 'flex', alignItems: 'center', padding: '30px', backgroundColor: '#7f1d1d', color: '#fca5a5', borderRadius: '15px', border: '2px solid #ef4444' },
  errorCard: { display: 'flex', alignItems: 'center', padding: '30px', backgroundColor: '#1e293b', color: '#ef4444', borderRadius: '15px', border: '2px solid #444' },
};