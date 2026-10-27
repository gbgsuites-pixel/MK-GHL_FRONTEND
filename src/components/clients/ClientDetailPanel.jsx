import React from 'react';
import { cardStyle, btnSecondary } from '../../styles/theme';
import StatusBadge from '../shared/StatusBadge';

export default function ClientDetailPanel({ client, onClose, onValidate, onStatusChange, onRemove, actionBusy }) {
  if (!client) return null;
  const status = client.status || 'active';
  const isPaused = status === 'paused';
  const isManaged = Boolean(client.id);
  const syncStats = client.lastSyncStats || {};
  const protectedFieldAlerts = Array.isArray(syncStats.protectedFieldAlerts)
    ? syncStats.protectedFieldAlerts
    : [];
  const protectedFieldWarnings = Array.isArray(syncStats.protectedFieldWarnings)
    ? syncStats.protectedFieldWarnings
    : [];

  return (
    <section style={{ ...cardStyle, marginTop: '12px', backgroundColor: '#f8fafc' }} aria-labelledby="client-detail-heading">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Client detail</div>
          <h4 id="client-detail-heading" style={{ margin: '4px 0 2px', fontSize: '16px', color: '#1e293b' }}>{client.clientName}</h4>
          <div style={{ color: '#64748b', fontSize: '11px' }}>{client.consultantNum}</div>
        </div>
        <button type="button" onClick={onClose} style={btnSecondary}>Close</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '14px' }}>
        <Detail label="Lifecycle"><StatusBadge status={status} /></Detail>
        <Detail label="GHL location">{client.locationId || client.ghlLocationId || '—'}</Detail>
        <Detail label="GHL custom fields">{client.customFieldCount ?? '—'}</Detail>
        <Detail label="Validation">{client.validationStatus || 'Not checked'}</Detail>
        <Detail label="Last validation">{formatDate(client.lastValidationAt)}</Detail>
        <Detail label="Last sync">{formatDate(client.lastSyncAt)}</Detail>
        <Detail label="Last sync status">{client.lastSyncStatus || '—'}</Detail>
        <Detail label="Contacts last sync">{syncStats.contacts ?? '—'}</Detail>
        <Detail label="Contacts synced">{syncStats.synced ?? '—'}</Detail>
        <Detail label="Protected fields">{protectedFieldAlerts.length > 0 ? 'Blocked' : protectedFieldWarnings.length > 0 ? 'Unverified' : 'No recorded alerts'}</Detail>
      </div>

      {client.validationErrorCode && (
        <div style={{ marginTop: '12px', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#fff7ed', color: '#9a3412', fontSize: '11px' }}>
          Validation issue: {client.validationErrorCode}
        </div>
      )}

      {protectedFieldAlerts.length > 0 && (
        <div style={{ marginTop: '12px', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '11px' }}>
          Protected-field safety block: {protectedFieldAlerts.join(' ')}
        </div>
      )}

      {protectedFieldWarnings.length > 0 && (
        <div style={{ marginTop: '12px', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#fffbeb', color: '#92400e', fontSize: '11px' }}>
          Protected-field verification warning: {protectedFieldWarnings.join(' ')}
        </div>
      )}

      {isManaged && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
          {(status === 'pending_validation' || status === 'invalid' || status === 'active') && (
            <button type="button" onClick={() => onValidate?.(client)} disabled={actionBusy} style={btnSecondary}>
              {actionBusy ? 'Checking…' : client.validationStatus === 'valid' ? 'Revalidate GHL fields' : 'Validate credentials'}
            </button>
          )}
          {(status === 'active' || status === 'paused') && (
            <button type="button" onClick={() => onStatusChange?.(client, isPaused ? 'active' : 'paused')} disabled={actionBusy} style={btnSecondary}>
              {isPaused ? 'Resume client' : 'Pause client'}
            </button>
          )}
          {status !== 'disconnected' && (
            <button type="button" onClick={() => onStatusChange?.(client, 'disconnected')} disabled={actionBusy} style={{ ...btnSecondary, color: '#991b1b', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
              Disable sync
            </button>
          )}
          <button type="button" onClick={() => onRemove?.(client)} disabled={actionBusy} style={{ ...btnSecondary, color: '#ffffff', borderColor: '#7f1d1d', backgroundColor: '#7f1d1d' }}>
            Remove completely
          </button>
        </div>
      )}
    </section>
  );
}

function Detail({ label, children }) {
  return (
    <div>
      <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '3px' }}>{label}</div>
      <div style={{ color: '#334155', fontSize: '12px', fontWeight: 500 }}>{children}</div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '—';
  try { return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }); } catch (_) { return value; }
}
