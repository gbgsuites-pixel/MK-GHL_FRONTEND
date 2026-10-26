import React from 'react';
import { STATUS_COLORS, PHASE_LABELS } from '../../constants/statusColors';

/**
 * Reusable status badge with animated dot for active states.
 */
export default function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.idle;
  const isActive = status === 'in_progress' || status === 'running';
  const label = PHASE_LABELS[status] || {
    paused: 'Paused',
    invalid: 'Invalid credentials',
    disconnected: 'Disconnected',
    removal_pending: 'Removal pending',
    pending_validation: 'Pending validation',
  }[status] || status;

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
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: colors.dot,
          animation: isActive ? 'pulse 1.5s infinite' : 'none',
        }}
      />
      {label}
    </span>
  );
}
