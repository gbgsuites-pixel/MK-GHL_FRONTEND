import React from 'react';
import { cardStyle, emptyStateStyle } from '../../styles/theme';
import ClientRow from './ClientRow';
import ErrorPanel from './ErrorPanel';

/**
 * Clients tab: full client list with actions and error panel.
 */
export default function ClientsTab({
  clients,
  syncStatus,
  isSyncing,
  totalErrors,
  onSyncAll,
  onSyncSingle,
  onCsv,
  onRefresh,
  getClientErrors,
}) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
          All Clients ({clients.length})
        </h3>
        <button
          onClick={onSyncAll}
          disabled={isSyncing || clients.length === 0}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: isSyncing ? '#94a3b8' : '#16a34a',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            opacity: isSyncing || clients.length === 0 ? 0.5 : 1,
          }}
        >
          {isSyncing ? 'Running...' : 'Sync All'}
        </button>
      </div>

      {clients.length === 0 && (
        <p style={emptyStateStyle}>
          Click "Connect" to load clients.
        </p>
      )}

      <div style={{ display: 'grid', gap: '10px' }}>
        {clients.map((client) => {
          const clientStatus = syncStatus?.clients?.find(
            (c) => c.name === client.clientName
          );
          return (
            <ClientRow
              key={client.consultantNum}
              client={client}
              clientStatus={clientStatus}
              isSyncing={isSyncing}
              onSync={onSyncSingle}
              onCsv={onCsv}
              onRefresh={onRefresh}
            />
          );
        })}
      </div>

      {/* Error Summary Panel */}
      {syncStatus?.clients && (
        <ErrorPanel
          clients={syncStatus.clients}
          getClientErrors={getClientErrors}
          totalErrors={totalErrors}
        />
      )}
    </div>
  );
}
