import React from 'react';
import StatusBadge from '../shared/StatusBadge';
import { getClientStats, getClientStatus } from '../../utils/syncResult';

/**
 * Individual client row in the clients list.
 * Shows name, number, status, stats, and action buttons.
 */
export default function ClientRow({
  client,
  clientStatus,
  isSyncing,
  activeClientNum,
  onSync,
  onCsv,
  onRefresh,
}) {
  const stats = getClientStats(clientStatus);
  const status = getClientStatus(clientStatus);

  return (
    <div
      style={{
        padding: '14px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#fafbfc',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr auto',
        gap: '12px',
        alignItems: 'center',
      }}
    >
      {/* Client Info */}
      <div>
        <div style={{ fontWeight: 600, fontSize: '14px' }}>
          {client.clientName}
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
          {client.consultantNum}
        </div>
      </div>

      {/* Status */}
      <div>
          <StatusBadge status={status} />
      </div>

      {/* Stats */}
      <div style={{ fontSize: '11px', color: '#64748b' }}>
        {clientStatus ? (
          <div>
            <span>
              {stats.mergedContacts} contacts
            </span>
            <br />
            <span style={{ color: '#16a34a' }}>{stats.ghlSynced} synced</span>
            {stats.ghlErrors > 0 && (
              <span style={{ color: '#dc2626', marginLeft: '6px' }}>
                {stats.ghlErrors} errors
              </span>
            )}
          </div>
        ) : (
          <span>No sync data</span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={() => onSync(client.consultantNum)}
          disabled={isSyncing}
          title="Sync only this client"
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: isSyncing ? '#94a3b8' : '#4f46e5',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          {isSyncing && activeClientNum === client.consultantNum
            ? 'Syncing…'
            : 'Sync only'}
        </button>
        <button
          onClick={() => onCsv(client.consultantNum, client.clientName)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          CSV
        </button>
        <button
          onClick={() => onRefresh(client.consultantNum)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
