/**
 * Describe why a managed client's last saved sync did not run, using the
 * result the backend stores in Supabase (lastSyncStatus / lastSyncStats).
 * Returns null when the last sync completed or nothing is known.
 */
const LOGIN_CODES = ['MK_LOGIN_REJECTED', 'MK_LOGIN_FAILED'];

export function lastSyncProblem(client) {
  if (!client) return null;
  const status = client.lastSyncStatus;
  if (status !== 'blocked' && status !== 'failed') return null;

  const stats = client.lastSyncStats || {};
  const code = stats.errorCode || '';
  const message = stats.message || '';

  // A successful validation after the failed sync means the problem has been
  // fixed (for example a new password was saved); the next sync will run.
  const fixedSinceSync =
    client.validationStatus === 'valid' &&
    client.lastValidationAt &&
    client.lastSyncAt &&
    new Date(client.lastValidationAt) > new Date(client.lastSyncAt);

  let kind = 'other';
  if (LOGIN_CODES.includes(code) || /login failed|still on login page|check credentials/i.test(message)) {
    kind = 'login';
  } else if (code === 'MK_SITE_UNAVAILABLE') {
    kind = 'site';
  }

  if (fixedSinceSync) {
    return {
      kind,
      resolved: true,
      label: 'Fixed, syncs next run',
      detail: 'Validation passed after the last failed sync. The next sync will include this client.',
    };
  }

  if (kind === 'login') {
    return {
      kind,
      resolved: false,
      label: 'Mary Kay login failed',
      detail: 'Mary Kay rejected the saved password. Update the Mary Kay password to resume syncing.',
    };
  }
  if (kind === 'site') {
    return {
      kind,
      resolved: false,
      label: 'Mary Kay unavailable',
      detail: 'Mary Kay InTouch was down or in maintenance during the last sync. No action is needed; the next sync retries.',
    };
  }
  return {
    kind,
    resolved: false,
    label: 'Last sync failed',
    detail: message || code || 'The last sync did not complete.',
  };
}
