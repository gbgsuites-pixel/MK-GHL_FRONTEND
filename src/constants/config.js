/**
 * Application configuration constants.
 * All API endpoints and default values are defined here.
 */

export function normalizeBackendUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

const configuredBackendUrl = normalizeBackendUrl(import.meta.env.VITE_BACKEND_URL);

// Localhost is useful for `npm run dev`, but it is never a valid default for
// a Vercel/production build. An empty production default forces the deployment
// to provide VITE_BACKEND_URL instead of silently calling the frontend host.
export const BACKEND_URL =
  configuredBackendUrl || (import.meta.env.DEV ? 'http://localhost:3000' : '');
// Never ship a backend credential in Vite's public bundle. The operator enters
// the short-lived/session-scoped dashboard credential at runtime.
export const DEFAULT_API_KEY = '';

// ── API Endpoints ──
export const ENDPOINTS = {
  // Data
  clients: '/api/clients',
  managedClients: '/api/v1/clients',
  managedClientStatus: (id) => `/api/v1/clients/${encodeURIComponent(id)}/status`,
  managedClientValidate: (id) => `/api/v1/clients/${encodeURIComponent(id)}/validate-credentials`,
  managedClientSync: (id) => `/api/v1/clients/${encodeURIComponent(id)}/sync`,
  managedClientDisconnect: (id) => `/api/v1/clients/${encodeURIComponent(id)}`,
  status: '/api/status',
  health: '/health',

  // Sync
  syncAll: '/api/sync/all',
  syncSingle: (num) => `/api/sync/${encodeURIComponent(num)}`,

  // Sessions
  refreshSession: (num) => `/api/sessions/refresh/${encodeURIComponent(num)}`,

  // Export
  exportCsv: (num) => `/api/export/ghl-csv/${encodeURIComponent(num)}`,

  // Schedule
  schedule: '/api/schedule',
  cronEnable: '/api/cron/enable',
  cronDisable: '/api/cron/disable',

  // Logs
  logsRecent: (limit = 500, level = 'all') =>
    `/api/logs/recent?limit=${limit}&level=${level}`,
  streamTicket: '/api/stream-ticket',
  logsSse: (ticket) => `/api/logs?ticket=${encodeURIComponent(ticket)}`,
  progressSse: (ticket) => `/api/progress?ticket=${encodeURIComponent(ticket)}`,
};

// ── Defaults ──
export const DEFAULTS = {
  cron: '30 0 * * *',
  timezone: 'America/Chicago',
  logLimit: 500,
  logMaxEntries: 1000,
  healthPollInterval: 10000,
  logAutoScroll: true,
};

// ── Storage Keys ──
export const STORAGE_KEYS = {
  backendUrl: 'mk_backend_url',
};
