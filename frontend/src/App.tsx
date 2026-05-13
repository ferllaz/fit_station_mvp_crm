import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Search, Users, UserPlus } from 'lucide-react';

// Импортируем страницы
import Dashboard from './pages/Dashboard';
import CheckCard from './pages/CheckCard';
import MembersList from './pages/MembersList';
import AddMember from './pages/AddMember';

// Компонент для ссылки меню (чтобы подсвечивать активную)
const NavLink = ({ to, children, icon: Icon }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} style={isActive ? ui.navLinkActive : ui.navLink}>
      <Icon size={20} style={{ marginRight: '12px' }} />
      {children}
    </Link>
  );
};

export default function App() {
  return (
    <Router>
      <div style={ui.layout}>
        {/* БОКОВОЕ МЕНЮ (Sidebar) */}
        <aside style={ui.sidebar}>
          <div style={ui.logoArea}>
            <h1 style={ui.logo}>FIT <span style={{ color: '#3b82f6' }}>STATION</span></h1>
            <span style={ui.version}>CRM v1.0 MVP</span>
          </div>
          
          <nav style={ui.nav}>
            <NavLink to="/" icon={LayoutDashboard}>Дашборд</NavLink>
            <NavLink to="/check" icon={Search}>Проверка карты</NavLink>
            <NavLink to="/list" icon={Users}>Клиенты и Мониторинг</NavLink>
            <NavLink to="/add" icon={UserPlus}>Регистрация</NavLink>
          </nav>
        </aside>

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <main style={ui.main}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/check" element={<CheckCard />} />
            <Route path="/list" element={<MembersList />} />
            <Route path="/add" element={<AddMember />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// ==========================================
// СТИЛИ UI (Определяем их ЗДЕСЬ, чтобы не было ошибки)
// Директор оценит такой современный темный дизайн
// ==========================================
const ui: { [key: string]: React.CSSProperties } = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0f172a', // Очень темный синий фон
    color: '#f1f5f9',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#1e293b', // Карточка меню
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #334155',
  },
  logoArea: {
    marginBottom: '40px',
    textAlign: 'center',
  },
  logo: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '1px',
    margin: 0,
  },
  version: {
    fontSize: '11px',
    color: '#64748b',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 15px',
    color: '#94a3b8',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: '0.2s',
    fontWeight: '500',
  },
  navLinkActive: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 15px',
    backgroundColor: '#3b82f6', // Синий акцент
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  main: {
    flex: 1,
    padding: '40px',
    overflowY: 'auto',
  },
};