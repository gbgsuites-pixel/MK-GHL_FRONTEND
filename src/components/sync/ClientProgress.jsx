import React from 'react';
import ProgressBar from '../shared/ProgressBar';
import { PHASE_LABELS, PHASE_ICONS } from '../../constants/statusColors';
import { errorBoxStyle } from '../../styles/theme';
import { getClientErrors, getClientStats, getClientStatus } from '../../utils/syncResult';

/**
 * Per-client progress card shown during live sync.
 * Shows phase, progress bar, stats, and error details.
 */
export default function ClientProgress({ client }) {
  const errors = getClientErrors(client);
  const stats = getClientStats(client);
  const status = getClientStatus(client);
  const phaseColor =
    status === 'ghl_sync'
      ? '#dbeafe'
      : status === 'completed'
      ? '#dcfce7'
      : status === 'partial_success'
      ? '#fef3c7'
      : status === 'blocked'
      ? '#fee2e2'
      : status === 'failed'
      ? '#fee2e2'
      : '#f1f5f9';

  const phaseTextColor =
    status === 'ghl_sync'
      ? '#2563eb'
      : status === 'completed'
      ? '#16a34a'
      : status === 'partial_success'
      ? '#b45309'
      : status === 'blocked'
      ? '#b91c1c'
      : status === 'failed'
      ? '#dc2626'
      : '#64748b';

  const leftBorderColor =
    status === 'completed'
      ? '#16a34a'
      : status === 'partial_success'
      ? '#d97706'
      : status === 'blocked'
      ? '#dc2626'
      : status === 'failed'
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
            {PHASE_ICONS[status] || PHASE_ICONS[client.phase] || '•'}
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
          {PHASE_LABELS[status] || PHASE_LABELS[client.phase] || status}
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
        {client.progress?.synced === undefined && stats.ghlSynced > 0 && (
          <Stat label="Synced" value={stats.ghlSynced} color="#16a34a" />
        )}
        {client.progress?.skipped !== undefined && (
          <Stat label="Skipped" value={client.progress.skipped} color="#d97706" />
        )}
        {stats.ghlErrors > 0 && (
          <Stat label="Errors" value={stats.ghlErrors} color="#dc2626" />
        )}
      </div>

      {/* Error detail */}
      {errors.length > 0 && (
        <div style={errorBoxStyle}>
          {errors.map((error) => error.message).join(' ')}
        </div>
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
