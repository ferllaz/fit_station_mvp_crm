import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import MembersListPage from './pages/MembersListPage';
import AddMemberPage from './pages/AddMember';
import CheckCardPage from './pages/CheckCard';
import PaymentsPage from './pages/PaymentsPage'; // Импорт новой страницы
import { LayoutDashboard, Users, UserPlus, ShieldCheck, Banknote } from 'lucide-react';

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff' }}>
        {/* SIDEBAR */}
        <nav style={{ width: '260px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', padding: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', color: '#3b82f6' }}>FIT STATION</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <MenuLink to="/" icon={<LayoutDashboard size={20}/>} label="Дашборд" />
            <MenuLink to="/check" icon={<ShieldCheck size={20}/>} label="Контроль" />
            <MenuLink to="/list" icon={<Users size={20}/>} label="Клиенты" />
            <MenuLink to="/add" icon={<UserPlus size={20}/>} label="Регистрация" />
            <MenuLink to="/payments" icon={<Banknote size={20}/>} label="Касса / История" />
          </div>
        </nav>

        {/* CONTENT */}
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/check" element={<CheckCardPage />} />
            <Route path="/list" element={<MembersListPage />} />
            <Route path="/add" element={<AddMemberPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function MenuLink({ to, icon, label }: any) {
  return (
    <NavLink to={to} style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '10px',
      textDecoration: 'none',
      color: isActive ? '#fff' : '#94a3b8',
      backgroundColor: isActive ? '#3b82f6' : 'transparent',
      transition: '0.3s'
    })}>
      {icon} {label}
    </NavLink>
  );
}