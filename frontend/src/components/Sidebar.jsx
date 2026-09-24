import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Target,
  Clock,
  BarChart3,
  Users,
  UserCheck,
  FolderOpen
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/skills', label: 'Skills & Hobbies', icon: Sparkles },
    { to: '/goals', label: 'Goals & Milestones', icon: Target },
    { to: '/practice', label: 'Practice Tracking', icon: Clock },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/community', label: 'Community Feed', icon: Users },
    { to: '/profile', label: 'My Profile', icon: UserCheck },
  ];

  return (
    <aside style={{
      width: isOpen ? '240px' : '0px',
      backgroundColor: '#ffffff',
      borderRight: isOpen ? '1px solid var(--border)' : 'none',
      transition: 'width 0.25s ease',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 30
    }}>
      <div style={{ padding: '1.25rem 0.75rem', width: '240px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', padding: '0 0.75rem 0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Menu
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'var(--transition)'
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
