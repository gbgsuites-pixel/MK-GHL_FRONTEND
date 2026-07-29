import React from 'react';
import { PROGRESS_COLORS } from '../../constants/statusColors';

/**
 * Reusable progress bar for GHL sync phase.
 */
export default function ProgressBar({ cursor, total, percentage }) {
  if (!total) return null;
  const pct = percentage || 0;
  const color =
    pct >= 100
      ? PROGRESS_COLORS.complete
      : pct > 50
      ? PROGRESS_COLORS.medium
      : PROGRESS_COLORS.low;

  return (
    <div
      style={{
        backgroundColor: '#e2e8f0',
        borderRadius: '8px',
        height: '24px',
        marginBottom: '8px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          backgroundColor: color,
          borderRadius: '8px',
          transition: 'width 0.5s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '60px',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>
          {cursor || 0}/{total || 0} ({pct}%)
        </span>
      </div>
    </div>
  );
}
