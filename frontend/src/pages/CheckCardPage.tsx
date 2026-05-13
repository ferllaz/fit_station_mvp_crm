import { useState, useEffect, useRef, type FormEvent } from 'react';
import api from '../api';
import type { Member } from '../types';
import { ShieldCheck, ShieldAlert, CreditCard, User, Calendar, Phone } from 'lucide-react';

export default function CheckCardPage() {
  const [cardNo, setCardNo] = useState('');
  const [result, setResult] = useState<Member | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCheck = async (e: FormEvent) => {
    e.preventDefault();
    if (!cardNo) return;

    try {
      const res = await api.get(`members/check_card/?no=${cardNo}`);
      setResult(res.data);
      setStatus(res.data.days_left > 0 ? 'success' : 'error');
    } catch (err) {
      setResult(null);
      setStatus('error');
    }
    setCardNo(''); // Очищаем для следующего сканирования
  };

  // Фокус на поле ввода всегда, чтобы можно было просто сканировать карту
  useEffect(() => { inputRef.current?.focus(); }, [status]);

  return (
    <div style={{ ...s.container, backgroundColor: status === 'success' ? '#064e3b' : status === 'error' ? '#7f1d1d' : '#0f172a' }}>
      <div style={s.card}>
        <h1 style={s.title}>Система контроля доступа</h1>
        
        <form onSubmit={handleCheck} style={s.form}>
          <div style={s.inputWrapper}>
            <CreditCard style={s.inputIcon} size={24} />
            <input 
              ref={inputRef}
              style={s.input}
              placeholder="Считайте карту клиента..."
              value={cardNo}
              onChange={e => setCardNo(e.target.value)}
              autoFocus
            />
          </div>
        </form>

        {status === 'idle' && (
          <div style={s.idleState}>
            <div style={s.pulseIcon}><ShieldCheck size={80} opacity={0.2} /></div>
            <p>Ожидание сканирования...</p>
          </div>
        )}

        {result && status !== 'idle' && (
          <div style={s.resultBox}>
            <div style={s.avatar}>{result.full_name[0]}</div>
            <h2 style={s.name}>{result.full_name}</h2>
            
            <div style={s.infoGrid}>
              <div style={s.infoItem}><User size={16}/> {result.card_number}</div>
              <div style={s.infoItem}><Phone size={16}/> {result.phone_number || 'Нет номера'}</div>
              <div style={s.infoItem}><Calendar size={16}/> До: {result.expiry_date}</div>
            </div>

            <div style={{...s.statusBanner, backgroundColor: result.days_left > 0 ? '#10b981' : '#ef4444'}}>
              {result.days_left > 0 ? <ShieldCheck size={32}/> : <ShieldAlert size={32}/>}
              <div>
                <div style={s.statusText}>{result.days_left > 0 ? 'ПРОХОД РАЗРЕШЕН' : 'ДОСТУП ЗАБЛОКИРОВАН'}</div>
                <div style={s.daysText}>{result.days_left} дн. осталось</div>
              </div>
            </div>
          </div>
        )}

        {!result && status === 'error' && (
          <div style={s.resultBox}>
            <ShieldAlert size={80} color="#ef4444" />
            <h2 style={{color: '#ef4444'}}>КАРТА НЕ НАЙДЕНА</h2>
            <p>Данная карта не зарегистрирована в системе</p>
          </div>
        )}
      </div>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  container: { height: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.5s', borderRadius: '24px' },
  card: { backgroundColor: '#1e293b', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '600px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },
  title: { fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', color: '#94a3b8', marginBottom: '30px' },
  form: { marginBottom: '40px' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '15px', color: '#3b82f6' },
  input: { width: '100%', padding: '20px 20px 20px 50px', borderRadius: '15px', border: '2px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '18px', outline: 'none' },
  idleState: { padding: '40px', color: '#475569' },
  pulseIcon: { marginBottom: '20px', animation: 'pulse 2s infinite' },
  resultBox: { animation: 'slideUp 0.4s ease-out' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#3b82f6', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' },
  name: { fontSize: '28px', margin: '0 0 20px 0' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '30px', fontSize: '13px', color: '#94a3b8' },
  infoItem: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },
  statusBanner: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '20px', borderRadius: '15px', color: '#fff' },
  statusText: { fontSize: '20px', fontWeight: '900' },
  daysText: { fontSize: '14px', opacity: 0.8 }
};