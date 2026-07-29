import React from 'react';
import { cardStyle, btnSuccess } from '../../styles/theme';

/**
 * Quick actions card: Sync All, View Logs, View Clients, Sync History.
 */
export default function QuickActions({ isSyncing, clientCount, onTabChange }) {
  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>
        Quick Actions
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button
          onClick={onTabChange}
          style={{
            ...btnSuccess,
            backgroundColor: isSyncing ? '#94a3b8' : '#16a34a',
            opacity: isSyncing || clientCount === 0 ? 0.5 : 1,
            cursor: isSyncing || clientCount === 0 ? 'not-allowed' : 'pointer',
            padding: '14px',
            fontSize: '13px',
          }}
          disabled={isSyncing || clientCount === 0}
        >
          {isSyncing ? 'Sync Running...' : '🔄 Sync All Clients'}
        </button>
        <button
          onClick={() => onTabChange('logs')}
          style={{
            padding: '14px',
            borderRadius: '8px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          📝 View Logs
        </button>
        <button
          onClick={() => onTabChange('clients')}
          style={{
            padding: '14px',
            borderRadius: '8px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          👥 View Clients
        </button>
        <button
          onClick={() => onTabChange('history')}
          style={{
            padding: '14px',
            borderRadius: '8px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          📋 Sync History
        </button>
      </div>
    </div>
  );
}
