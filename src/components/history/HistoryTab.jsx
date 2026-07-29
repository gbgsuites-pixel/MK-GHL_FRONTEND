import React, { useState } from 'react';
import { cardStyle, emptyStateStyle } from '../../styles/theme';

/**
 * History tab: in-memory timeline of completed syncs.
 * Each entry is expandable to show per-client results.
 */
export default function HistoryTab({ historySyncs }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const formatDateTime = (ts) => {
    try {
      return new Date(ts).toLocaleString('en-US', { hour12: true });
    } catch {
      return ts || '—';
    }
  };

  if (historySyncs.length === 0) {
    return (
      <div style={cardStyle}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
          Sync History
        </h3>
        <p style={{ ...emptyStateStyle, padding: '48px 0' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
          No completed syncs in this session.
          <br />
          <span style={{ fontSize: '12px' }}>
            Run a sync to see results here.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
        Sync History ({historySyncs.length})
      </h3>

      {historySyncs.map((entry) => {
        const isExpanded = expanded[entry.id];
        const successCount = entry.results.filter(
          (c) => c.status === 'completed'
        ).length;
        const failCount = entry.results.filter(
          (c) => c.status === 'failed'
        ).length;

        return (
          <div
            key={entry.id}
            style={{
              marginBottom: '10px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#fafbfc',
            }}
          >
            {/* Header row */}
            <div
              onClick={() => toggle(entry.id)}
              style={{
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>
                    {formatDateTime(entry.startTime)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {entry.totalClients} clients &middot; {entry.durationMin} min
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 600 }}>
                  {successCount} OK
                </span>
                {failCount > 0 && (
                  <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>
                    {failCount} fail
                  </span>
                )}
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {isExpanded ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div style={{ padding: '0 14px 12px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr auto',
                    gap: '8px',
                    fontSize: '11px',
                    padding: '6px 0',
                    borderBottom: '1px solid #e2e8f0',
                    fontWeight: 600,
                    color: '#64748b',
                  }}
                >
                  <span>Client</span>
                  <span>Status</span>
                  <span style={{ textAlign: 'right' }}>Duration</span>
                </div>
                {entry.results.map((client, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr auto',
                      gap: '8px',
                      fontSize: '12px',
                      padding: '6px 0',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{client.name}</span>
                    <span
                      style={{
                        color:
                          client.status === 'completed'
                            ? '#16a34a'
                            : client.status === 'failed'
                            ? '#dc2626'
                            : '#64748b',
                        fontWeight: 500,
                      }}
                    >
                      {client.status || 'unknown'}
                    </span>
                    <span style={{ color: '#94a3b8', textAlign: 'right' }}>
                      {client.durationMin !== undefined
                        ? `${client.durationMin} min`
                        : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
