import React, { useEffect, useRef } from 'react';
import { cardStyle, inputStyle } from '../../styles/theme';
import { LEVEL_COLORS } from '../../constants/statusColors';

/**
 * Logs tab: enhanced log viewer with search, level filter, auto-scroll.
 */
export default function LogsTab({
  filteredLogs,
  logSearch,
  setLogSearch,
  logFilter,
  setLogFilter,
  autoScroll,
  setAutoScroll,
  onLoadMore,
}) {
  const logContainerRef = useRef(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString('en-US', { hour12: false });
    } catch {
      return '';
    }
  };

  return (
    <div style={cardStyle}>
      <h3
        style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}
      >
        Server Logs
      </h3>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <input
          type="text"
          placeholder="Search logs..."
          value={logSearch}
          onChange={(e) => setLogSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: '250px' }}
        />
        {/* Level filter */}
        {['all', 'info', 'warn', 'error', 'debug'].map((level) => (
          <button
            key={level}
            onClick={() => setLogFilter(level)}
            style={{
              padding: '5px 10px',
              borderRadius: '4px',
              backgroundColor: logFilter === level ? '#4f46e5' : '#f1f5f9',
              color: logFilter === level ? 'white' : '#475569',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: logFilter === level ? 600 : 400,
              textTransform: 'capitalize',
            }}
          >
            {level}
          </button>
        ))}
        {/* Auto-scroll toggle */}
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            backgroundColor: autoScroll ? '#dcfce7' : '#f1f5f9',
            color: autoScroll ? '#16a34a' : '#475569',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          {autoScroll ? '✓ Auto-scroll' : '✗ Auto-scroll'}
        </button>
        {/* Refresh */}
        <button
          onClick={onLoadMore}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          Refresh
        </button>
      </div>

      {/* Log list */}
      <div
        ref={logContainerRef}
        style={{
          height: '500px',
          overflow: 'auto',
          backgroundColor: '#1e293b',
          borderRadius: '8px',
          padding: '12px',
          fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
          fontSize: '12px',
        }}
      >
        {filteredLogs.length === 0 ? (
          <div
            style={{
              color: '#64748b',
              textAlign: 'center',
              padding: '32px 0',
            }}
          >
            {filteredLogs.length === 0 && logSearch
              ? 'No logs match your search.'
              : 'No logs yet. Start a sync to see server logs.'}
          </div>
        ) : (
          filteredLogs.map((log, i) => (
            <div
              key={i}
              style={{
                padding: '2px 0',
                display: 'flex',
                gap: '8px',
                lineHeight: 1.4,
              }}
            >
              <span style={{ color: '#64748b', minWidth: '75px' }}>
                {formatTime(log.timestamp)}
              </span>
              <span
                style={{
                  color: LEVEL_COLORS[log.level] || '#6b7280',
                  minWidth: '50px',
                  fontWeight: log.level === 'error' ? 600 : 400,
                  textTransform: 'uppercase',
                  fontSize: '10px',
                }}
              >
                {log.level}
              </span>
              <span style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '8px', fontSize: '11px', color: '#94a3b8' }}>
        Showing {filteredLogs.length} of {filteredLogs.length} log entries
      </div>
    </div>
  );
}
