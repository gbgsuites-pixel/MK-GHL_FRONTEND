/**
 * Color mappings for sync statuses, log levels, phases, and memory thresholds.
 */

// ── Status badge colors ──
export const STATUS_COLORS = {
  completed:   { bg: '#dcfce7', text: '#16a34a', dot: '#16a34a' },
  partial_success: { bg: '#fef3c7', text: '#b45309', dot: '#d97706' },
  completed_with_errors: { bg: '#fef3c7', text: '#b45309', dot: '#d97706' },
  blocked:    { bg: '#fee2e2', text: '#b91c1c', dot: '#dc2626' },
  paused:     { bg: '#fef3c7', text: '#92400e', dot: '#d97706' },
  pending_validation: { bg: '#e0e7ff', text: '#3730a3', dot: '#4f46e5' },
  invalid:    { bg: '#fee2e2', text: '#991b1b', dot: '#dc2626' },
  disconnected: { bg: '#f1f5f9', text: '#475569', dot: '#64748b' },
  removal_pending: { bg: '#ffedd5', text: '#9a3412', dot: '#ea580c' },
  failed:      { bg: '#fee2e2', text: '#dc2626', dot: '#dc2626' },
  no_contacts: { bg: '#fef3c7', text: '#d97706', dot: '#d97706' },
  in_progress: { bg: '#dbeafe', text: '#2563eb', dot: '#2563eb' },
  idle:        { bg: '#f3f4f6', text: '#6b7280', dot: '#6b7280' },
  running:     { bg: '#dbeafe', text: '#2563eb', dot: '#2563eb' },
};

// ── Log level colors ──
export const LEVEL_COLORS = {
  error: '#ef4444',
  warn:  '#f59e0b',
  debug: '#9ca3af',
  info:  '#6b7280',
};

// ── Phase labels and icons ──
export const PHASE_LABELS = {
  idle:         'Idle',
  fetching_data:'Fetching Mary Kay Data...',
  data_fetched: 'Data Ready',
  ghl_sync:     'Syncing to GoHighLevel...',
  completed:    'Completed',
  partial_success: 'Partial success',
  completed_with_errors: 'Completed with errors',
  blocked:      'Blocked before upload',
  failed:       'Failed',
};

export const PHASE_ICONS = {
  idle:         '⏸',
  fetching_data:'🔍',
  data_fetched: '✅',
  ghl_sync:     '📤',
  completed:    '✅',
  partial_success: '⚠️',
  blocked:      '⛔',
  failed:       '❌',
};

// ── Client overview border colors ──
export const CLIENT_BORDER_COLORS = {
  completed:    '#16a34a',
  failed:       '#dc2626',
  in_progress:  '#2563eb',
  idle:         '#94a3b8',
};

// ── Progress bar colors by percentage ──
export const PROGRESS_COLORS = {
  low:     '#818cf8',
  medium:  '#4f46e5',
  complete:'#16a34a',
};

// ── Memory thresholds ──
export const MEMORY_THRESHOLDS = {
  warning:  1000,
  critical: 1400,
};
