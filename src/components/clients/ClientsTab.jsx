import React, { useMemo, useState } from 'react';
import { cardStyle, emptyStateStyle } from '../../styles/theme';
import ClientRow from './ClientRow';
import ClientDetailPanel from './ClientDetailPanel';
import ErrorPanel from './ErrorPanel';
import AddClientPanel from './AddClientPanel';

/**
 * Clients tab: full client list with actions and error panel.
 */
export default function ClientsTab({
  clients,
  syncStatus,
  isSyncing,
  activeClientNum,
  syncError,
  totalErrors,
  onSyncAll,
  onSyncSingle,
  onCsv,
  exportingClientNum,
  onRefresh,
  onStatusChange,
  onValidate,
  onCreate,
  onRemove,
  clientActionId,
  getClientErrors,
}) {
  const [selectedClientId, setSelectedClientId] = useState(null);
  const selectedClient = useMemo(
    () => clients.find((client) => String(client.id || client.consultantNum) === String(selectedClientId)) || null,
    [clients, selectedClientId]
  );

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <AddClientPanel onCreate={onCreate} busy={clientActionId === 'create'} />
      </div>
      {syncError && (
        <div
          role="alert"
          style={{
            marginBottom: '12px',
            padding: '10px 12px',
            borderRadius: '8px',
            color: '#991b1b',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            fontSize: '12px',
          }}
        >
          <strong>Sync action failed:</strong> {syncError}
        </div>
      )}
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

      <ClientDetailPanel
        client={selectedClient}
        onClose={() => setSelectedClientId(null)}
        onValidate={onValidate}
        onStatusChange={onStatusChange}
        onRemove={onRemove}
        actionBusy={selectedClient ? clientActionId === selectedClient.id : false}
      />

      {clients.length === 0 && (
        <p style={emptyStateStyle}>
          Click "Connect" to load clients.
        </p>
      )}

      <div style={{ display: 'grid', gap: '10px' }}>
        {clients.map((client) => {
          const clientStatus = syncStatus?.clients?.find(
            (c) =>
              c.name === client.clientName ||
              c.clientName === client.clientName ||
              c.consultantNum === client.consultantNum
          );
          return (
            <ClientRow
              key={client.consultantNum}
              client={client}
              clientStatus={clientStatus}
              isSyncing={isSyncing}
              activeClientNum={activeClientNum}
              exportingClientNum={exportingClientNum}
              onSync={onSyncSingle}
              onCsv={onCsv}
              onRefresh={onRefresh}
              onStatusChange={onStatusChange}
              onValidate={onValidate}
              onRemove={onRemove}
              clientActionId={clientActionId}
              onDetails={(client) => setSelectedClientId(client.id || client.consultantNum)}
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
