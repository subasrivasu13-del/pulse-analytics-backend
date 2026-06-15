import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BarChart3, LogOut, ShieldAlert } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <BarChart3 size={24} strokeWidth={2.5} />
        </div>
        <h1>PulseAnalytics</h1>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/" 
          end
          id="nav-dashboard"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/analytics" 
          id="nav-analytics"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={20} />
          <span>Detailed Analytics</span>
        </NavLink>
      </nav>

      {user && (
        <div className="sidebar-profile">
          <div className="profile-info">
            <img 
              src={user.profilePic || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.name} 
              alt={user.name} 
              className="profile-avatar"
            />
            <div className="profile-meta">
              <span className="profile-name" title={user.name}>{user.name}</span>
              <span className="profile-email" title={user.email}>{user.email}</span>
            </div>
          </div>
          {user.provider === 'mock' && (
            <div className="sandbox-badge">
              <ShieldAlert size={12} />
              <span>Sandbox Mode</span>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            id="btn-logout"
            className="btn-logout"
            title="Log Out"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
