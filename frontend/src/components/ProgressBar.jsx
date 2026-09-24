import React from 'react';

const ProgressBar = ({ percent = 0, color = 'var(--primary)', height = 8, showLabel = false }) => {
  const clamped = Math.min(Math.max(percent, 0), 100);

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.35rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Progress</span>
          <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{clamped}%</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height: `${height}px`,
        backgroundColor: 'var(--border)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${clamped}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.5s ease-out'
        }} />
      </div>
    </div>
  );
};

export default ProgressBar;
