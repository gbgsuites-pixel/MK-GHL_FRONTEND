import React from 'react';
import ProgressBar from '../shared/ProgressBar';
import { PHASE_LABELS, PHASE_ICONS } from '../../constants/statusColors';
import { errorBoxStyle } from '../../styles/theme';

/**
 * Per-client progress card shown during live sync.
 * Shows phase, progress bar, stats, and error details.
 */
export default function ClientProgress({ client }) {
  const phaseColor =
    client.phase === 'ghl_sync'
      ? '#dbeafe'
      : client.phase === 'completed'
      ? '#dcfce7'
      : client.phase === 'failed'
      ? '#fee2e2'
      : '#f1f5f9';

  const phaseTextColor =
    client.phase === 'ghl_sync'
      ? '#2563eb'
      : client.phase === 'completed'
      ? '#16a34a'
      : client.phase === 'failed'
      ? '#dc2626'
      : '#64748b';

  const leftBorderColor =
    client.phase === 'completed'
      ? '#16a34a'
      : client.phase === 'failed'
      ? '#dc2626'
      : '#2563eb';

  return (
    <div
      style={{
        marginBottom: '12px',
        padding: '14px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#fafbfc',
        borderLeft: `4px solid ${leftBorderColor}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>
            {PHASE_ICONS[client.phase] || '•'}
          </span>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>{client.name}</span>
        </div>
        <span
          style={{
            fontSize: '11px',
            color: phaseTextColor,
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: phaseColor,
          }}
        >
          {PHASE_LABELS[client.phase] || client.phase}
        </span>
      </div>

      {/* Progress bar */}
      {client.phase === 'ghl_sync' && (
        <ProgressBar
          cursor={client.progress?.cursor}
          total={client.progress?.total}
          percentage={client.progress?.percentage}
        />
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {client.progress?.consultants !== undefined && (
          <Stat label="Consultants" value={client.progress.consultants} />
        )}
        {client.progress?.customers !== undefined && (
          <Stat label="Customers" value={client.progress.customers} />
        )}
        {client.progress?.totalContacts !== undefined && (
          <Stat label="Total" value={client.progress.totalContacts} />
        )}
        {client.progress?.synced !== undefined && (
          <Stat label="Synced" value={client.progress.synced} color="#16a34a" />
        )}
        {client.progress?.skipped !== undefined && (
          <Stat label="Skipped" value={client.progress.skipped} color="#d97706" />
        )}
        {client.progress?.errors > 0 && (
          <Stat label="Errors" value={client.progress.errors} color="#dc2626" />
        )}
      </div>

      {/* Error detail */}
      {client.phase === 'failed' && client.error && (
        <div style={errorBoxStyle}>{client.error}</div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ fontSize: '11px' }}>
      <span style={{ color: '#94a3b8' }}>{label}:</span>{' '}
      <span style={{ fontWeight: 600, color: color || 'inherit' }}>{value}</span>
    </div>
  );
}
