/**
 * Application configuration constants.
 * All API endpoints and default values are defined here.
 */

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
export const DEFAULT_API_KEY = import.meta.env.VITE_API_KEY || '';

// ── API Endpoints ──
export const ENDPOINTS = {
  // Data
  clients: '/api/clients',
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
  logsSse: (key) => `/api/logs?apiKey=${encodeURIComponent(key)}`,
  progressSse: (key) => `/api/progress?apiKey=${encodeURIComponent(key)}`,
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
  apiKey: 'mk_api_key',
  backendUrl: 'mk_backend_url',
};
