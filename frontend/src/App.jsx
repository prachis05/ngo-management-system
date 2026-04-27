import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useContext, useState, useEffect, useRef } from 'react';
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
import AdminVerifications from './pages/AdminVerifications';
import AdminVolunteerList from './pages/AdminVolunteerList';
import AdminVolunteerDetail from './pages/AdminVolunteerDetail';
import NGOVolunteerList from './pages/NGOVolunteerList';
import NGOVolunteerDetail from './pages/NGOVolunteerDetail';
import VolunteerProfile from './pages/VolunteerProfile';
import DonationDetail from './pages/DonationDetail';
import AdminNGODetail from './pages/AdminNGODetail';
import CreateCause from './pages/CreateCause';
import NGOCauses from './pages/NGOCauses';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

// Role-aware navigation bar
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null); // 'dashboard' or 'profile'
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeDropdown = () => setOpenDropdown(null);

  // Role-based links for Dashboard
  const getDashboardLinks = () => {
    const role = user.role;
    if (role === 'Admin') {
      return [
        { to: '/', label: 'Overview' },
        { to: '/events', label: 'Events' },
        { to: '/volunteers', label: 'Volunteers' },
        { to: '/admin/reports', label: 'Reports' },
      ];
    }
    if (role === 'NGO') {
      if (user.verificationStatus === 'Pending' || !user.isApproved) {
        return [{ to: '/', label: 'Overview' }];
      }
      return [
        { to: '/', label: 'Overview' },
        { to: '/events', label: 'My Events' },
        { to: '/ngo/volunteers', label: 'My Volunteers' },
        { to: '/tasks', label: 'Task Board' },
        { to: '/ngo/causes/create', label: 'Create Cause' },
      ];
    }
    if (role === 'Donor') {
      return [{ to: '/', label: 'Overview' }];
    }
    if (role === 'Volunteer') {
      if (user.verificationStatus === 'Pending') {
        return [{ to: '/', label: 'Overview' }];
      }
      return [
        { to: '/', label: 'Overview' },
        { to: '/events', label: 'Events' },
        { to: '/tasks', label: 'Task Board' },
      ];
    }
    return [{ to: '/', label: 'Overview' }];
  };

  // Profile Links
  const getProfileLinks = () => {
    const role = user.role;
    const links = [];
    if (role === 'Admin') {
      links.push({ to: '/admin/verifications', label: 'Verifications' });
    }
    if (role === 'Volunteer' && user.verificationStatus !== 'Pending') {
      links.push({ to: '/volunteer/profile', label: 'My Profile' });
    }
    return links;
  };

  const dashboardLinks = getDashboardLinks();
  const profileLinks = getProfileLinks();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeDropdown}>
        NGO Management Portal
      </Link>

      <div className="navbar-links" ref={dropdownRef}>
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={closeDropdown}>Home</Link>
        {/* Only Donor should see these */}
        {user.role === 'Donor' && (
          <>
            <Link
              to="/browse-ngos"
              className={`nav-link ${location.pathname === '/browse-ngos' ? 'active' : ''}`}
              onClick={closeDropdown}
            >
              NGOs / Causes
            </Link>

            <Link
              to="/donations"
              className={`nav-link ${location.pathname === '/donations' ? 'active' : ''}`}
              onClick={closeDropdown}
            >
              Donations
            </Link>
          </>
        )}

        {/* Dashboard Dropdown */}
        <div className="dropdown-container">
          <button
            className={`dropdown-button ${openDropdown === 'dashboard' ? 'active' : ''}`}
            onClick={() => toggleDropdown('dashboard')}
          >
            Dashboard ▾
          </button>
          {openDropdown === 'dashboard' && (
            <div className="dropdown-menu">
              {dashboardLinks.map(link => (
                <Link key={link.to} to={link.to} className="dropdown-item" onClick={closeDropdown}>
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="dropdown-container">
          <button
            className={`dropdown-button ${openDropdown === 'profile' ? 'active' : ''}`}
            onClick={() => toggleDropdown('profile')}
          >
            Profile ▾
          </button>
          {openDropdown === 'profile' && (
            <div className="dropdown-menu">
              <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.2rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Signed in as</div>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', textTransform: 'uppercase', color: 'var(--primary)' }}>{user.role}</div>
              </div>
              {profileLinks.map(link => (
                <Link key={link.to} to={link.to} className="dropdown-item" onClick={closeDropdown}>
                  {link.label}
                </Link>
              ))}
              <button className="nav-btn-logout" onClick={() => { closeDropdown(); logout(); }}>
                Logout
              </button>
            </div>
          )}
        </div>
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
                <PrivateRoute><AdminVolunteerList /></PrivateRoute>
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

              {/* identity verifications */}
              <Route path="/admin/verifications" element={
                <PrivateRoute><AdminVerifications /></PrivateRoute>
              } />

              {/* drill-downs */}
              <Route path="/admin/volunteer/:id" element={
                <PrivateRoute><AdminVolunteerDetail /></PrivateRoute>
              } />
              <Route path="/ngo/volunteers" element={
                <PrivateRoute><NGOVolunteerList /></PrivateRoute>
              } />
              <Route path="/ngo/volunteer/:id" element={
                <PrivateRoute><NGOVolunteerDetail /></PrivateRoute>
              } />
              <Route path="/volunteer/profile" element={
                <PrivateRoute><VolunteerProfile /></PrivateRoute>
              } />
              <Route path="/donations/:id" element={
                <PrivateRoute><DonationDetail /></PrivateRoute>
              } />
              <Route path="/admin/ngo/:id" element={
                <PrivateRoute><AdminNGODetail /></PrivateRoute>
              } />
              <Route path="/ngo/causes/create" element={
                <PrivateRoute><CreateCause /></PrivateRoute>
              } />
              <Route path="/ngo/:id" element={
                <PrivateRoute><NGOCauses /></PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
