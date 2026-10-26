/**
 * Normalize the different result shapes emitted by the sync service.
 * The backend has returned errors from more than one nested location over time;
 * keeping this logic in one place prevents the UI from hiding upload failures.
 */
function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function toErrorRecord(value, index = 0) {
  if (typeof value === 'string') {
    return { id: `error-${index}-${value}`, message: value };
  }

  if (!value || typeof value !== 'object') {
    return { id: `error-${index}`, message: String(value || 'Unknown sync error') };
  }

  const message =
    value.message ||
    value.error ||
    value.reason ||
    value.detail ||
    value.statusMessage ||
    'Sync or upload failed.';

  return {
    ...value,
    id: value.id || `error-${index}-${message}`,
    message: String(message),
    statusCode: value.statusCode || value.httpStatus || value.code || 'ERROR',
    retryAttempts: value.retryAttempts || value.retries || 0,
  };
}

function getNestedErrorValues(client) {
  return [
    client?.errors,
    client?.errorDetails,
    client?.ghlErrors,
    client?.ghlResult?.errors,
    client?.ghlResult?.error,
    client?.uploadResult?.errors,
    client?.uploadResult?.error,
    client?.upload?.errors,
    client?.upload?.error,
  ].flatMap(asArray);
}

export function getClientErrors(client) {
  const rawErrors = getNestedErrorValues(client);
  const hasFailedStatus = [
    client?.status,
    client?.phase,
    client?.uploadStatus,
    client?.ghlResult?.status,
    client?.uploadResult?.status,
  ].some((value) => [
    'failed',
    'error',
    'failed_upload',
    'upload_failed',
    'blocked',
    'partial_success',
    'completed_with_errors',
  ].includes(value));
  const explicitFailure =
    client?.success === false ||
    client?.uploadSuccess === false ||
    client?.ghlResult?.success === false ||
    client?.uploadResult?.success === false;

  if (rawErrors.length === 0 && (hasFailedStatus || explicitFailure)) {
    rawErrors.push(
      client?.error ||
        client?.message ||
        client?.ghlResult?.message ||
        client?.uploadResult?.message ||
        'Sync or upload failed.'
    );
  }

  const seen = new Set();
  return rawErrors
    .map(toErrorRecord)
    .filter((error) => {
      const key = `${error.message}|${error.email || ''}|${error.statusCode || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function getClientStatus(client) {
  const errors = getClientErrors(client);
  const partial = [client?.status, client?.phase, client?.uploadStatus]
    .includes('partial_success');
  const blocked = [client?.status, client?.phase, client?.uploadStatus]
    .includes('blocked');
  if (blocked) return 'blocked';
  if (partial) return 'partial_success';
  if (errors.length > 0) return 'failed';
  if (client?.status === 'completed' || client?.phase === 'completed') return 'completed';
  if (client?.status === 'failed' || client?.phase === 'failed') return 'failed';
  return client?.status || client?.phase || 'idle';
}

export function getClientStats(client) {
  const stats = client?.stats || {};
  const progress = client?.progress || {};
  const ghlResult = client?.ghlResult || {};
  const uploadResult = client?.uploadResult || {};

  return {
    mergedContacts:
      stats.mergedContacts ??
      stats.total ??
      progress.totalContacts ??
      client?.totalContacts ??
      0,
    ghlSynced:
      stats.ghlSynced ??
      stats.synced ??
      progress.synced ??
      ghlResult.synced ??
      uploadResult.synced ??
      0,
    ghlErrors:
      stats.ghlErrors ??
      stats.errors ??
      progress.errors ??
      ghlResult.errors?.length ??
      uploadResult.errors?.length ??
      getClientErrors(client).length,
    skipped: stats.skipped ?? progress.skipped ?? 0,
  };
}
