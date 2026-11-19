import React from 'react';
import StatusBadge from '../shared/StatusBadge';
import { getClientStats, getClientStatus } from '../../utils/syncResult';
import { lastSyncProblem } from '../../utils/clientHealth';

/**
 * Individual client row in the clients list.
 * Managed clients expose lifecycle actions; legacy JSON clients retain the
 * existing sync/CSV/session controls until migrated to Supabase.
 */
export default function ClientRow({
  client,
  clientStatus,
  isSyncing,
  activeClientNum,
  exportingClientNum,
  onSync,
  onCsv,
  onRefresh,
  onStatusChange,
  onValidate,
  onRemove,
  clientActionId,
  onDetails,
  onUpdateLogin,
}) {
  const stats = getClientStats(clientStatus);
  // The live status only lists clients the current run has finished, and it
  // is empty after a server restart. Fall back to the result saved in the
  // database so a client that synced before does not show "No sync data".
  const saved = client.lastSyncStats || null;
  const hasSaved = Boolean(saved && client.lastSyncAt);
  const problem = isManaged ? lastSyncProblem(client) : null;
  const loginFailed = problem?.kind === 'login' && !problem.resolved;
  const status = client.status || getClientStatus(clientStatus);
  const isManaged = Boolean(client.id);
  const isBusy = clientActionId === client.id;
  const isActive = status === 'active';
  const isPaused = status === 'paused';

  const handleDisconnect = () => {
    if (!window.confirm(`Disable ${client.clientName}? Future scheduled and manual syncs will stop, but the client record will remain available.`)) {
      return;
    }
    onStatusChange?.(client, 'disconnected');
  };

  const handleRemove = () => {
    onRemove?.(client);
  };

  return (
    <div
      style={{
        padding: '14px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        backgroundColor: status === 'paused' ? '#fffbeb' : '#fafbfc',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr auto',
        gap: '12px',
        alignItems: 'center',
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: '14px' }}>{client.clientName}</div>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
          {client.consultantNum}
          {loginFailed ? (
            <span style={{ marginLeft: '8px', color: '#dc2626', fontWeight: 600 }}>login failed</span>
          ) : client.validationStatus && client.validationStatus !== 'unknown' && (
            <span style={{ marginLeft: '8px', color: client.validationStatus === 'valid' ? '#16a34a' : '#b45309' }}>
              {client.validationStatus === 'valid' ? 'validated' : client.validationStatus}
            </span>
          )}
        </div>
      </div>

      <div><StatusBadge status={status} /></div>

      <div style={{ fontSize: '11px', color: '#64748b' }}>
        {problem && !clientStatus ? (
          <div title={problem.detail}>
            <span style={{ color: problem.resolved ? '#16a34a' : problem.kind === 'site' ? '#b45309' : '#dc2626', fontWeight: 600 }}>
              {problem.label}
            </span>
            <br />
            <span>Last sync {formatSyncDate(client.lastSyncAt)}</span>
          </div>
        ) : clientStatus ? (
          <div>
            <span>{stats.mergedContacts} contacts</span><br />
            <span style={{ color: '#16a34a' }}>{stats.ghlSynced} synced</span>
            {stats.ghlErrors > 0 && (
              <span style={{ color: '#dc2626', marginLeft: '6px' }}>{stats.ghlErrors} errors</span>
            )}
          </div>
        ) : hasSaved ? (
          <div title={`Last sync ${formatSyncDate(client.lastSyncAt)} (${client.lastSyncStatus || 'unknown'})`}>
            <span>{saved.contacts ?? saved.synced ?? 0} contacts</span><br />
            <span style={{ color: '#16a34a' }}>{saved.synced ?? 0} synced</span>
            {Number(saved.errors) > 0 && (
              <span style={{ color: '#dc2626', marginLeft: '6px' }}>{saved.errors} errors</span>
            )}
            <br />
            <span>Last sync {formatSyncDate(client.lastSyncAt)}</span>
          </div>
        ) : (
          <span>{isSyncing && isActive ? 'Waiting for first sync' : 'No sync yet'}</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button onClick={() => onDetails?.(client)} style={buttonStyle('#e0e7ff', false, '#3730a3')} title="View client detail">
          Details
        </button>
        {isManaged && onUpdateLogin && (
          <button
            onClick={() => onUpdateLogin(client)}
            disabled={isBusy}
            title="Update this client's Mary Kay password or GHL token"
            style={loginFailed ? buttonStyle('#dc2626', isBusy) : buttonStyle('#f1f5f9', isBusy, '#475569')}
          >
            Update login
          </button>
        )}
        <button
          onClick={() => onSync(client.consultantNum)}
          disabled={isSyncing || (isManaged && !isActive)}
          title={isActive ? 'Sync only this client' : 'Activate this client before syncing'}
          style={buttonStyle('#4f46e5', isSyncing || (isManaged && !isActive))}
        >
          {isSyncing && activeClientNum === client.consultantNum ? 'Syncing…' : 'Sync only'}
        </button>
        <button
          onClick={() => onCsv(client.consultantNum, client.clientName)}
          disabled={Boolean(exportingClientNum) || (isManaged && !isActive)}
          title="Download this client's GHL-ready CSV without uploading to GoHighLevel"
          style={buttonStyle('#f1f5f9', Boolean(exportingClientNum) || (isManaged && !isActive), '#475569')}
        >
          {exportingClientNum === client.consultantNum ? 'Preparing…' : 'CSV (no upload)'}
        </button>
        <button
          onClick={() => onRefresh(client.consultantNum)}
          disabled={isBusy}
          style={buttonStyle('#f1f5f9', isBusy, '#475569')}
        >
          Refresh
        </button>
        {isManaged && (
          <>
            {(status === 'pending_validation' || status === 'invalid' || client.validationStatus === 'unknown') && (
              <button
                onClick={() => onValidate?.(client)}
                disabled={isBusy || isSyncing}
                title={isSyncing ? 'A sync is running. Validation is available when it finishes.' : undefined}
                style={buttonStyle('#e0e7ff', isBusy || isSyncing, '#3730a3')}
              >
                {isBusy ? 'Checking…' : isSyncing ? 'Validate after sync' : client.validationStatus === 'unknown' ? 'Validate fields' : 'Validate'}
              </button>
            )}
            {(isActive || isPaused) && (
              <button
                onClick={() => onStatusChange?.(client, isPaused ? 'active' : 'paused')}
                disabled={isBusy}
                style={buttonStyle('#fef3c7', isBusy, '#92400e')}
              >
                {isBusy ? 'Saving…' : isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            {status !== 'disconnected' && (
              <button onClick={handleDisconnect} disabled={isBusy} style={buttonStyle('#fee2e2', isBusy, '#991b1b')}>
                Disable sync
              </button>
            )}
            <button onClick={handleRemove} disabled={isBusy} style={buttonStyle('#7f1d1d', isBusy, '#ffffff')}>
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function buttonStyle(backgroundColor, disabled, color = 'white') {
  return {
    padding: '6px 10px',
    borderRadius: '6px',
    backgroundColor,
    color,
    border: backgroundColor === '#f1f5f9' ? '1px solid #e2e8f0' : 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '11px',
    fontWeight: 600,
    opacity: disabled ? 0.55 : 1,
  };
}

function formatSyncDate(value) {
  try {
    return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch (_) {
    return String(value);
  }
}
