/**
 * Centralized API client for all backend communication.
 * Handles REST calls and SSE stream setup.
 */

import { ENDPOINTS } from '../constants/config';

// ── REST API ──

/**
 * Make an authenticated API call to the backend.
 * @param {string} baseUrl - Backend URL
 * @param {string} apiKey - API key
 * @param {string} path - API endpoint path
 * @param {object} options - Fetch options (method, body, headers)
 * @returns {Promise<object>} Parsed JSON response
 * @throws {Error} On 401 or non-OK responses
 */
export async function apiCall(baseUrl, apiKey, path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'x-api-key': apiKey,
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => ({}))
    : await res.text().catch(() => '');

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Invalid API key. Please check your credentials.');
    }

    const message =
      (typeof data === 'object' && (data.error || data.message || data.detail)) ||
      (typeof data === 'string' && data) ||
      res.statusText ||
      `Request failed with HTTP ${res.status}.`;
    const error = new Error(message);
    error.status = res.status;
    error.payload = data;
    throw error;
  }

  if (typeof data === 'string' && data.length > 0) {
    try {
      return JSON.parse(data);
    } catch (_) {
      return { message: data };
    }
  }
  return data;
}

// ── Data Fetching ──

export const fetchClients = (baseUrl, apiKey) =>
  apiCall(baseUrl, apiKey, ENDPOINTS.clients);

export const fetchStatus = (baseUrl, apiKey) =>
  apiCall(baseUrl, apiKey, ENDPOINTS.status);

export const fetchSchedule = (baseUrl, apiKey) =>
  apiCall(baseUrl, apiKey, ENDPOINTS.schedule);

export const fetchLogs = (baseUrl, apiKey, limit = 500, level = 'all') =>
  apiCall(baseUrl, apiKey, ENDPOINTS.logsRecent(limit, level));

export const fetchHealth = (baseUrl) =>
  fetch(`${baseUrl}/health`).then((r) => r.json());

// ── Actions ──

export const triggerSyncAll = (baseUrl, apiKey) =>
  apiCall(baseUrl, apiKey, ENDPOINTS.syncAll, { method: 'POST' });

export const triggerSyncSingle = (baseUrl, apiKey, consultantNum) =>
  apiCall(baseUrl, apiKey, ENDPOINTS.syncSingle(consultantNum), { method: 'POST' });

export const refreshSession = (baseUrl, apiKey, consultantNum) =>
  apiCall(baseUrl, apiKey, ENDPOINTS.refreshSession(consultantNum), { method: 'POST' });

export const updateSchedule = (baseUrl, apiKey, scheduleForm) =>
  apiCall(baseUrl, apiKey, ENDPOINTS.schedule, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleForm),
  });

export const toggleCron = (baseUrl, apiKey, enable) =>
  apiCall(baseUrl, apiKey, enable ? ENDPOINTS.cronEnable : ENDPOINTS.cronDisable, {
    method: 'POST',
  });

// ── File Export ──

export async function downloadCsv(baseUrl, apiKey, consultantNum, clientName) {
  const url = `${baseUrl}${ENDPOINTS.exportCsv(consultantNum)}?apiKey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${clientName || consultantNum}_ghl_contacts.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Download one client's raw Mary Kay records without starting a sync or
 * calling the GoHighLevel upload service.
 */
export async function downloadMaryKayCsv(baseUrl, apiKey, consultantNum, clientName) {
  const url = `${baseUrl}${ENDPOINTS.exportMaryKayCsv(consultantNum)}`;
  const res = await fetch(url, {
    headers: { 'x-api-key': apiKey },
  });

  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json().catch(() => ({}))
      : await res.text().catch(() => '');
    const message =
      (typeof data === 'object' && (data.error || data.message)) ||
      (typeof data === 'string' && data) ||
      res.statusText ||
      `Mary Kay CSV export failed with HTTP ${res.status}.`;
    throw new Error(message);
  }

  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition') || '';
  const filenameMatch = disposition.match(/filename\*?=(?:UTF-8''|")?([^;\"]+)/i);
  const filename = filenameMatch?.[1]
    ? decodeURIComponent(filenameMatch[1].trim())
    : `${clientName || consultantNum}-mary-kay-records-${new Date().toISOString().slice(0, 10)}.csv`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Download every Mary Kay record collected by the backend without starting
 * or using a GoHighLevel upload. The server should stream a CSV response from
 * ENDPOINTS.exportMaryKayCsvAll.
 */
export async function downloadAllMaryKayCsv(baseUrl, apiKey) {
  const url = `${baseUrl}${ENDPOINTS.exportMaryKayCsvAll}`;
  const res = await fetch(url, {
    headers: { 'x-api-key': apiKey },
  });

  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json().catch(() => ({}))
      : await res.text().catch(() => '');
    const message =
      (typeof data === 'object' && (data.error || data.message)) ||
      (typeof data === 'string' && data) ||
      res.statusText ||
      `Mary Kay CSV export failed with HTTP ${res.status}.`;
    throw new Error(message);
  }

  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition') || '';
  const filenameMatch = disposition.match(/filename\*?=(?:UTF-8''|\")?([^;\"]+)/i);
  const filename = filenameMatch?.[1]
    ? decodeURIComponent(filenameMatch[1].trim())
    : `mary-kay-records-${new Date().toISOString().slice(0, 10)}.csv`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ── SSE Streams ──

/**
 * Create an SSE connection for live logs.
 * @returns {{ eventSource: EventSource, close: () => void }}
 */
export function createLogStream(baseUrl, apiKey) {
  const url = `${baseUrl}${ENDPOINTS.logsSse(apiKey)}`;
  const evtSource = new EventSource(url);
  return {
    eventSource: evtSource,
    close: () => evtSource.close(),
  };
}

/**
 * Create an SSE connection for live progress.
 * @returns {{ eventSource: EventSource, close: () => void }}
 */
export function createProgressStream(baseUrl, apiKey) {
  const url = `${baseUrl}${ENDPOINTS.progressSse(apiKey)}`;
  const evtSource = new EventSource(url);
  return {
    eventSource: evtSource,
    close: () => evtSource.close(),
  };
}
