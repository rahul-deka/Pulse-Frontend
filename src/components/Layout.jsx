import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdDashboard, MdUpload, MdVideoLibrary, MdPeople, MdSettings, MdLogout, MdNotifications, MdPerson } from 'react-icons/md';
import { useState, useRef, useEffect } from 'react';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
    { path: '/upload', icon: MdUpload, label: 'Upload Video' },
    { path: '/videos', icon: MdVideoLibrary, label: 'Video Library' },
    ...(user?.role === 'admin' ? [{ path: '/users', icon: MdPeople, label: 'Users' }] : []),
    { path: '/settings', icon: MdSettings, label: 'Settings' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">Pulse Stream</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <MdLogout className="nav-icon" />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <h1 className="page-title">
            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h1>
          <div className="header-actions">
            <button className="icon-btn">
              <MdNotifications />
            </button>
            <div className="user-menu-container" ref={userMenuRef}>
              <button 
                className="icon-btn user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <MdPerson />
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-avatar">
                      <MdPerson />
                    </div>
                    <div className="user-details">
                      <p className="user-name">{user?.name || 'User'}</p>
                      <p className="user-email">{user?.email}</p>
                      <span className="user-role-badge">{user?.role || 'user'}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-logout-btn">
                    <MdLogout />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;