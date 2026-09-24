import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, LogOut, User as UserIcon, Bell, Menu } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated && (
          <button 
            id="btn-sidebar-toggle"
            onClick={onToggleSidebar}
            style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
            aria-label="Toggle Navigation"
          >
            <Menu size={22} />
          </button>
        )}
        <Link to={isAuthenticated ? "/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Award size={20} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Skill<span style={{ color: 'var(--primary)' }}>Pulse</span>
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated ? (
          <>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-main)', textDecoration: 'none' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                overflow: 'hidden'
              }}>
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }} className="nav-username">
                {user?.full_name || user?.username}
              </span>
            </Link>

            <button
              id="btn-logout"
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Logout"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary btn-sm" id="nav-btn-login">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm" id="nav-btn-register">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
