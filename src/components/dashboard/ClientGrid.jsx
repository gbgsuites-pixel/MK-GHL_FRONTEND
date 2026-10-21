import React from 'react';
import { cardStyle } from '../../styles/theme';
import { CLIENT_BORDER_COLORS } from '../../constants/statusColors';
import StatusBadge from '../shared/StatusBadge';
import { getClientStats, getClientStatus } from '../../utils/syncResult';

/**
 * Client overview grid on the dashboard.
 * Shows all clients in a responsive grid with status and quick sync button.
 */
export default function ClientGrid({
  clients,
  syncStatus,
  isSyncing,
  activeClientNum,
  onSyncSingle,
}) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#475569' }}>
          Client Overview
        </h3>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
          Last sync status for each client
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '8px',
        }}
      >
        {clients.map((client) => {
          const clientStatus = syncStatus?.clients?.find(
            (c) => c.name === client.clientName || c.clientName === client.clientName || c.consultantNum === client.consultantNum
          );
          const status = getClientStatus(clientStatus);
          const stats = getClientStats(clientStatus);
          const borderColor =
            CLIENT_BORDER_COLORS[status] ||
            CLIENT_BORDER_COLORS.idle;

          return (
            <div
              key={client.consultantNum}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                borderLeft: `4px solid ${borderColor}`,
                backgroundColor: '#fafbfc',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>
                {client.clientName}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                {client.consultantNum}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <StatusBadge status={status} />
                <button
                  onClick={() => onSyncSingle(client.consultantNum)}
                  disabled={isSyncing}
                  title="Sync only this client"
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: isSyncing ? '#e2e8f0' : '#4f46e5',
                    color: isSyncing ? '#94a3b8' : 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 600,
                  }}
                >
                  {isSyncing && activeClientNum === client.consultantNum
                    ? 'Syncing…'
                    : 'Sync only'}
                </button>
              </div>
              {clientStatus?.stats && (
                <div style={{ marginTop: '6px', fontSize: '10px', color: '#64748b' }}>
                  <span>
                    {stats.mergedContacts}{' '}
                    contacts
                  </span>
                  {stats.ghlSynced !== undefined && (
                    <span> &middot; {stats.ghlSynced} synced</span>
                  )}
                  {stats.ghlErrors > 0 && (
                    <span style={{ color: '#dc2626' }}> &middot; {stats.ghlErrors} errors</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
