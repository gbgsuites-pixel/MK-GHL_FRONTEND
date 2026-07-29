import React from 'react';
import { headerStyle } from '../../styles/theme';

/**
 * Application header with memory widget, uptime, sync indicator, and schedule info.
 */
export default function Header({
  memoryInfo,
  serverUptime,
  isSyncing,
  schedule,
  scheduleForm,
}) {
  const formatUptime = (seconds) => {
    if (!seconds) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const cronToHuman = (cron) => {
    if (cron === '30 0 * * *') return '12:30 AM';
    const parts = cron.split(' ');
    if (parts.length >= 2) {
      const min = parseInt(parts[0]);
      const hr = parseInt(parts[1]);
      const ampm = hr >= 12 ? 'PM' : 'AM';
      const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
      return `${hr12}:${min.toString().padStart(2, '0')} ${ampm}`;
    }
    return cron;
  };

  return (
    <header style={headerStyle}>
      <div>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
          Mary Kay GHL Sync
        </h1>
        <p style={{ margin: '2px 0 0', fontSize: '12px', opacity: 0.7 }}>
          Dashboard &amp; Control Panel
        </p>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {/* Memory Widget */}
        {memoryInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', opacity: 0.7 }}>Memory:</span>
            <span
              style={{ fontSize: '12px', fontWeight: 600, color: memoryInfo.color }}
            >
              {memoryInfo.value}MB
            </span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: memoryInfo.color,
              }}
            />
          </div>
        )}
        {/* Uptime */}
        {serverUptime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', opacity: 0.7 }}>Uptime:</span>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>
              {formatUptime(serverUptime)}
            </span>
          </div>
        )}
        {/* Sync Status Indicator */}
        {isSyncing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <span style={{ fontSize: '13px', opacity: 0.9, fontWeight: 500 }}>
              Sync Running
            </span>
          </div>
        )}
        {/* Schedule indicator */}
        <span style={{ fontSize: '12px', opacity: 0.6 }}>
          {schedule?.enabled
            ? `Auto: ${cronToHuman(scheduleForm?.cron || '')} ${(scheduleForm?.timezone || '').split('/')[1].replace('_', ' ')}`
            : 'Auto-sync OFF'}
        </span>
      </div>
    </header>
  );
}
