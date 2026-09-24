import React from 'react';

const StatCard = ({ title, value, unit = '', subtitle, icon: Icon, color = 'var(--primary)' }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>{title}</span>
        {Icon && (
          <div style={{
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-main)',
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          {value} <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>{unit}</span>
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
