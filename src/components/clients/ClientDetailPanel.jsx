import React, { useEffect, useState } from 'react';
import { cardStyle, btnSecondary } from '../../styles/theme';
import StatusBadge from '../shared/StatusBadge';

const EMPTY_CREDENTIALS = { password: '', ghlApiToken: '' };

export default function ClientDetailPanel({ client, onClose, onValidate, onStatusChange, onRemove, onUpdateCredentials, actionBusy }) {
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState(EMPTY_CREDENTIALS);
  const [credentialError, setCredentialError] = useState('');

  // Never keep typed secrets around when switching to another client.
  useEffect(() => {
    setShowCredentials(false);
    setCredentials(EMPTY_CREDENTIALS);
    setCredentialError('');
  }, [client?.id]);

  if (!client) return null;

  const submitCredentials = async (event) => {
    event.preventDefault();
    const payload = {};
    if (credentials.password) payload.password = credentials.password;
    if (credentials.ghlApiToken.trim()) payload.ghlApiToken = credentials.ghlApiToken.trim();
    if (Object.keys(payload).length === 0) {
      setCredentialError('Enter a new Mary Kay password, a new GHL token, or both.');
      return;
    }
    setCredentialError('');
    try {
      await onUpdateCredentials?.(client, payload);
      setCredentials(EMPTY_CREDENTIALS);
      setShowCredentials(false);
    } catch (error) {
      setCredentialError(error.message || 'Could not update credentials.');
    }
  };
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
          {onUpdateCredentials && (
            <button type="button" onClick={() => setShowCredentials((open) => !open)} disabled={actionBusy} style={btnSecondary} aria-expanded={showCredentials}>
              Update credentials
            </button>
          )}
          <button type="button" onClick={() => onRemove?.(client)} disabled={actionBusy} style={{ ...btnSecondary, color: '#ffffff', borderColor: '#7f1d1d', backgroundColor: '#7f1d1d' }}>
            Remove completely
          </button>
        </div>
      )}

      {isManaged && showCredentials && (
        <form onSubmit={submitCredentials} style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Update credentials</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
            Leave a field blank to keep its current value. Values are encrypted and never shown again. The client is re-validated after saving.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            <label style={{ fontSize: '11px', color: '#475569' }}>
              New Mary Kay password
              <input
                type="password"
                autoComplete="new-password"
                value={credentials.password}
                onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                style={credentialInputStyle}
              />
            </label>
            <label style={{ fontSize: '11px', color: '#475569' }}>
              New GHL private integration token
              <input
                type="password"
                autoComplete="new-password"
                value={credentials.ghlApiToken}
                onChange={(event) => setCredentials((prev) => ({ ...prev, ghlApiToken: event.target.value }))}
                style={credentialInputStyle}
              />
            </label>
          </div>
          {credentialError && (
            <div role="alert" style={{ marginTop: '8px', color: '#991b1b', fontSize: '11px' }}>{credentialError}</div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button type="submit" disabled={actionBusy} style={{ ...btnSecondary, backgroundColor: '#4f46e5', borderColor: '#4f46e5', color: '#ffffff' }}>
              {actionBusy ? 'Saving…' : 'Save and validate'}
            </button>
            <button type="button" onClick={() => { setShowCredentials(false); setCredentials(EMPTY_CREDENTIALS); setCredentialError(''); }} disabled={actionBusy} style={btnSecondary}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

const credentialInputStyle = {
  display: 'block',
  width: '100%',
  marginTop: '4px',
  padding: '7px 9px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '12px',
  boxSizing: 'border-box',
};

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
