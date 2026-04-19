import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Volunteers from './pages/Volunteers';
import Donations from './pages/Donations';
import Events from './pages/Events';
import Tasks from './pages/Tasks';
import BrowseNGOs from './pages/BrowseNGOs';
import AdminReports from './pages/AdminReports';
import AdminNGODetail from './pages/AdminNGODetail';
import './index.css';

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  return user ? children : <Navigate to="/login" />;
};

// Role-aware navigation bar
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  // Define navigation links per role
  const getLinks = () => {
    const role = user.role;

    if (role === 'Admin') {
      return [
        { to: '/', label: 'Dashboard', icon: '📊' },
        { to: '/events', label: 'Events', icon: '📅' },
        { to: '/volunteers', label: 'Volunteers', icon: '🤝' },
        { to: '/donations', label: 'Donations', icon: '💰' },
        { to: '/tasks', label: 'Task Board', icon: '📋' },
        { to: '/admin/reports', label: 'Reports', icon: '📄' },
      ];
    }

    if (role === 'NGO') {
      if (!user.isApproved) {
        return [{ to: '/', label: 'Dashboard', icon: '⏳' }];
      }
      return [
        { to: '/', label: 'Dashboard', icon: '🏛️' },
        { to: '/events', label: 'My Events', icon: '📅' },
        { to: '/donations', label: 'Donations', icon: '💰' },
        { to: '/tasks', label: 'Task Board', icon: '📋' },
      ];
    }

    if (role === 'Donor') {
      return [
        { to: '/', label: 'Dashboard', icon: '🎁' },
        { to: '/browse-ngos', label: 'Browse NGOs', icon: '🏛️' },
        { to: '/donations', label: 'My Donations', icon: '💰' },
      ];
    }

    if (role === 'Volunteer') {
      return [
        { to: '/', label: 'Dashboard', icon: '🤝' },
        { to: '/events', label: 'Events', icon: '📅' },
        { to: '/tasks', label: 'Task Board', icon: '📋' },
      ];
    }

    return [{ to: '/', label: 'Dashboard', icon: '📊' }];
  };

  const links = getLinks();

  const getRoleBadgeClass = () => {
    const map = { 'Admin': 'role-admin', 'NGO': 'role-ngo', 'Donor': 'role-donor', 'Volunteer': 'role-volunteer' };
    return map[user.role] || '';
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🏛️ NGO System
        <span className={`role-badge ${getRoleBadgeClass()}`}>{user.role}</span>
      </Link>
      <div className="navbar-links">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            <span>{link.icon}</span> {link.label}
          </Link>
        ))}
        <div className="nav-user-info">
          <span className="nav-user-name">{user.name}</span>
        </div>
        <button className="nav-btn-logout" onClick={logout}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
              } />
              <Route path="/volunteers" element={
                <PrivateRoute><Volunteers /></PrivateRoute>
              } />
              <Route path="/donations" element={
                <PrivateRoute><Donations /></PrivateRoute>
              } />
              <Route path="/events" element={
                <PrivateRoute><Events /></PrivateRoute>
              } />
              <Route path="/tasks" element={
                <PrivateRoute><Tasks /></PrivateRoute>
              } />
              <Route path="/browse-ngos" element={
                <PrivateRoute><BrowseNGOs /></PrivateRoute>
              } />
              <Route path="/admin/reports" element={
                <PrivateRoute><AdminReports /></PrivateRoute>
              } />
              <Route path="/admin/ngo/:id" element={
                <PrivateRoute><AdminNGODetail /></PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
