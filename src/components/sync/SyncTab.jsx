import React from 'react';
import { cardStyle } from '../../styles/theme';
import { STATUS_COLORS } from '../../constants/statusColors';
import ClientProgress from './ClientProgress';

/**
 * Live Sync tab: real-time progress visualization.
 */
export default function SyncTab({
  liveProgress,
  isSyncing,
  clients,
  onSyncAll,
}) {
  const formatDateTime = (ts) => {
    try {
      return new Date(ts).toLocaleString('en-US', { hour12: true });
    } catch {
      return ts;
    }
  };

  const statusBadge = (status) => {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.idle;
    const isActive = status === 'in_progress' || status === 'running';
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 600,
          backgroundColor: colors.bg,
          color: colors.text,
          textTransform: 'capitalize',
        }}
      >
        {isActive && (
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: colors.dot,
              animation: 'pulse 1.5s infinite',
            }}
          />
        )}
        {!isActive && (
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: colors.dot,
            }}
          />
        )}
        {status}
      </span>
    );
  };

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
        <h3
          style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}
        >
          Live Sync Progress
        </h3>
        {liveProgress?.startTime && (
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Started: {formatDateTime(liveProgress.startTime)}
          </span>
        )}
      </div>

      {!liveProgress || !liveProgress.clients || liveProgress.clients.length === 0 ? (
        <div
          style={{
            color: '#94a3b8',
            fontSize: '14px',
            textAlign: 'center',
            padding: '48px 0',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔄</div>
          No sync in progress.
          <br />
          <button
            onClick={onSyncAll}
            disabled={isSyncing || clients.length === 0}
            style={{
              marginTop: '16px',
              padding: '10px 24px',
              borderRadius: '8px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              opacity: isSyncing || clients.length === 0 ? 0.5 : 1,
            }}
          >
            Trigger Full Sync
          </button>
        </div>
      ) : (
        <div>
          {/* Overall header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor:
                liveProgress.status === 'completed'
                  ? '#f0fdf4'
                  : liveProgress.status === 'failed'
                  ? '#fef2f2'
                  : liveProgress.status === 'completed_with_errors'
                  ? '#fffbeb'
                  : '#eff6ff',
              border: `1px solid ${
                liveProgress.status === 'completed'
                  ? '#bbf7d0'
                  : liveProgress.status === 'failed'
                  ? '#fecaca'
                  : liveProgress.status === 'completed_with_errors'
                  ? '#fde68a'
                  : '#bfdbfe'
              }`,
              marginBottom: '16px',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              {liveProgress.status === 'completed'
                ? 'All Clients Completed'
                : liveProgress.status === 'completed_with_errors'
                ? 'Sync Completed with Errors'
                : liveProgress.status === 'failed'
                ? 'Sync Failed'
                : 'Sync In Progress'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {statusBadge(
                liveProgress.status === 'completed'
                  ? 'completed'
                  : liveProgress.status === 'failed'
                  ? 'failed'
                  : liveProgress.status === 'completed_with_errors'
                  ? 'completed_with_errors'
                  : 'running'
              )}
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {
                  liveProgress.clients.filter((c) => c.phase === 'completed')
                    .length
                }
                /{liveProgress.clients.length} clients done
              </span>
            </div>
          </div>

          {/* Per-client progress */}
          {liveProgress.clients.map((client, i) => (
            <ClientProgress key={i} client={client} />
          ))}

          {/* Completion summary */}
          {liveProgress.endTime && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor:
                  liveProgress.status === 'completed' ? '#f0fdf4' : '#fffbeb',
                border:
                  liveProgress.status === 'completed'
                    ? '1px solid #bbf7d0'
                    : '1px solid #fde68a',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '13px',
                    color: liveProgress.status === 'completed' ? '#16a34a' : '#b45309',
                    fontWeight: 600,
                  }}
                >
                  {liveProgress.status === 'completed'
                    ? 'Sync completed in '
                    : 'Sync finished with issues in '}
                  {liveProgress.summary?.durationMin || 0} minutes
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {
                  liveProgress.clients.filter((c) => c.phase === 'completed')
                    .length
                }{' '}
                succeeded &middot;{' '}
                {liveProgress.clients.filter((c) =>
                  ['failed', 'blocked', 'partial_success'].includes(c.phase)
                ).length}{' '}
                failed/partial
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
