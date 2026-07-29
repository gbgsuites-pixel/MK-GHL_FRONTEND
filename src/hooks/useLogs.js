import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLogs, createLogStream } from '../services/api';
import { DEFAULTS } from '../constants/config';

/**
 * Hook: manages server log streaming and filtering.
 * Returns logs, filters, search, and utility functions.
 */
export function useLogs(backendUrl, apiKey) {
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(DEFAULTS.logAutoScroll);
  const sseLogRef = useRef(null);

  // ── Load recent logs ──
  const loadLogs = useCallback(async () => {
    try {
      const data = await fetchLogs(backendUrl, apiKey, DEFAULTS.logMaxEntries, logFilter);
      setLogs(data.logs || []);
    } catch (_) {}
  }, [backendUrl, apiKey, logFilter]);

  // ── SSE log stream ──
  useEffect(() => {
    if (!apiKey) return;

    const connect = () => {
      if (sseLogRef.current) sseLogRef.current.close();

      const { eventSource, close } = createLogStream(backendUrl, apiKey);

      eventSource.onmessage = (event) => {
        try {
          const entry = JSON.parse(event.data);
          setLogs((prev) => {
            const next = [...prev, entry];
            if (next.length > DEFAULTS.logMaxEntries) next.shift();
            return next;
          });
        } catch (_) {}
      };

      eventSource.onerror = () => {
        close();
        setTimeout(connect, 5000);
      };

      sseLogRef.current = eventSource;
    };

    connect();
    return () => {
      if (sseLogRef.current) {
        sseLogRef.current.close();
        sseLogRef.current = null;
      }
    };
  }, [apiKey, backendUrl]);

  // ── Filtered logs ──
  const filteredLogs = logs
    .filter((l) => logFilter === 'all' || l.level === logFilter)
    .filter(
      (l) =>
        !logSearch ||
        l.message?.toLowerCase().includes(logSearch.toLowerCase())
    );

  return {
    logs,
    setLogs,
    logFilter, setLogFilter,
    logSearch, setLogSearch,
    autoScroll, setAutoScroll,
    filteredLogs,
    loadLogs,
    sseLogRef,
  };
}
