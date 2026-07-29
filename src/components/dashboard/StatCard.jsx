import React from 'react';

/**
 * Dashboard stat card: icon, label, value, and optional subtext.
 */
export default function StatCard({ label, value, sub, icon, color }) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '14px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
          {label}
        </div>
        <div style={{ fontSize: '22px', fontWeight: 700, color, lineHeight: 1.1 }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
