import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import MembersListPage from './pages/MembersListPage';
import AddMemberPage from './pages/AddMember';
import CheckCardPage from './pages/CheckCardPage';
import PaymentsPage from './pages/PaymentsPage';
import TrainersPage from './pages/TrainersPage';
import { LayoutDashboard, Users, UserPlus, ShieldCheck, Banknote, Bell, Dumbbell } from 'lucide-react';
import api from './api';

type Notification = {
  id: number;
  full_name: string;
  days_left: number;
  phone_number?: string;
};

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#0f172a', color: '#fff', overflowX: 'hidden', boxSizing: 'border-box' }}>
        <nav style={{ width: '260px', minWidth: '260px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', padding: '25px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '40px', color: '#3b82f6', letterSpacing: '-1px' }}>FIT STATION</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <MenuLink to="/" icon={<LayoutDashboard size={20} />} label="Дашборд" />
            <MenuLink to="/check" icon={<ShieldCheck size={20} />} label="Контроль" />
            <MenuLink to="/list" icon={<Users size={20} />} label="Клиенты" />
            <MenuLink to="/trainers" icon={<Dumbbell size={20} />} label="Тренера" />
            <MenuLink to="/add" icon={<UserPlus size={20} />} label="Регистрация" />
            <MenuLink to="/payments" icon={<Banknote size={20} />} label="Касса / История" />
          </div>

          <NotificationsMenu />
        </nav>

        <main style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', minWidth: 0, boxSizing: 'border-box' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/check" element={<CheckCardPage />} />
            <Route path="/list" element={<MembersListPage />} />
            <Route path="/trainers" element={<TrainersPage />} />
            <Route path="/add" element={<AddMemberPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NotificationsMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = () => {
    api.get('members/notifications/').then(res => setNotifications(res.data));
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const openMember = (id: number) => {
    setShowNotifPopup(false);
    navigate(`/list?member=${id}`);
  };

  return (
    <div style={{ position: 'relative', marginTop: 'auto' }}>
      <button onClick={() => setShowNotifPopup(!showNotifPopup)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
        borderRadius: '12px', backgroundColor: notifications.length > 0 ? '#b4530930' : '#0f172a',
        border: notifications.length > 0 ? '1px solid #f59e0b50' : '1px solid #334155', color: '#fff', cursor: 'pointer'
      }}>
        <div style={{ position: 'relative' }}>
          <Bell size={20} color={notifications.length > 0 ? '#f59e0b' : '#94a3b8'} />
          {notifications.length > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', width: '8px', height: '8px', borderRadius: '50%' }} />}
        </div>
        <span style={{ fontSize: '14px', fontWeight: '600', color: notifications.length > 0 ? '#f59e0b' : '#94a3b8' }}>
          Внимание ({notifications.length})
        </span>
      </button>

      {showNotifPopup && (
        <div style={{
          position: 'absolute', bottom: '60px', left: 0, width: '280px', backgroundColor: '#1e293b',
          border: '1px solid #334155', borderRadius: '16px', padding: '15px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', zIndex: 999, maxHeight: '300px', overflowY: 'auto'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#94a3b8' }}>Истекающие абонементы (&lt; 7 дней):</h4>
          {notifications.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Все стабильно, предупреждений нет</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => openMember(n.id)}
                  style={{ padding: '10px', backgroundColor: '#0f172a', borderRadius: '8px', border: 0, borderLeft: '4px solid #f59e0b', color: '#fff', textAlign: 'left', cursor: 'pointer' }}
                  title="Открыть клиента"
                >
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>{n.full_name}</div>
                  <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '2px' }}>Осталось всего: {n.days_left} дн.</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuLink({ to, icon, label }: any) {
  return (
    <NavLink to={to} style={({ isActive }) => ({
      display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px',
      textDecoration: 'none', color: isActive ? '#fff' : '#94a3b8', backgroundColor: isActive ? '#3b82f6' : 'transparent',
      fontWeight: '600', fontSize: '14px', transition: '0.2s ease'
    })}>
      {icon} {label}
    </NavLink>
  );
}
