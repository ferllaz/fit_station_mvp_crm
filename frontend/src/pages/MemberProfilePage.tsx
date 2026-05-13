import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import type { Member } from '../types';
import { ArrowLeft, CreditCard, Calendar, Phone } from 'lucide-react';

export default function MemberProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    api.get(`members/${id}/`).then(res => setMember(res.data));
  }, [id]);

  if (!member) return <div style={{color: '#fff'}}>Загрузка профиля...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <button onClick={() => navigate(-1)} style={s.backBtn}><ArrowLeft size={18}/> Назад</button>
      
      <div style={s.profileCard}>
        <div style={s.header}>
          <div style={s.avatar}>{member.full_name[0]}</div>
          <div>
            <h1 style={{margin: 0}}>{member.full_name}</h1>
            <span style={member.days_left > 0 ? s.badgeActive : s.badgeExpired}>
              {member.days_left > 0 ? 'Активен' : 'Срок истек'}
            </span>
          </div>
        </div>

        <div style={s.infoGrid}>
          <InfoItem icon={CreditCard} label="Номер карты" value={member.card_number} />
          <InfoItem icon={Phone} label="Телефон" value={member.phone_number || 'Не указан'} />
          <InfoItem icon={Calendar} label="Действует до" value={member.expiry_date} />
          <InfoItem icon={Calendar} label="Осталось дней" value={`${member.days_left} дн.`} />
        </div>

        <div style={s.financeSection}>
          <p>Всего принес выручки: <strong style={{color: '#10b981'}}>{Number(member.amount_paid).toLocaleString()} ₸</strong></p>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon: Icon, label, value }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#0f172a', borderRadius: '10px' }}>
    <Icon color="#3b82f6" />
    <div>
      <div style={{ fontSize: '12px', color: '#64748b' }}>{label}</div>
      <div style={{ fontWeight: '600' }}>{value}</div>
    </div>
  </div>
);

const s = {
  profileCard: { backgroundColor: '#1e293b', padding: '30px', borderRadius: '20px', border: '1px solid #334155' },
  header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #334155', paddingBottom: '20px' },
  avatar: { width: '60px', height: '60px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  financeSection: { marginTop: '20px', padding: '15px', backgroundColor: '#3b82f610', borderRadius: '10px', textAlign: 'center' as const },
  backBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' },
  badgeActive: { backgroundColor: '#065f46', color: '#34d399', padding: '4px 10px', borderRadius: '5px', fontSize: '12px' },
  badgeExpired: { backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '4px 10px', borderRadius: '5px', fontSize: '12px' },
};