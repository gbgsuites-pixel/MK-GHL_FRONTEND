import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLogs, createLogStream } from '../services/api';
import { DEFAULTS } from '../constants/config';

function normalizeLog(entry, index = 0) {
  if (typeof entry === 'string') {
    return {
      id: `log-${index}-${entry}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      message: entry,
    };
  }

  const message =
    entry?.message || entry?.msg || entry?.text || entry?.error || 'Log entry received.';
  const timestamp = entry?.timestamp || entry?.time || entry?.ts || new Date().toISOString();
  const level = String(entry?.level || entry?.severity || 'info').toLowerCase();

  return {
    ...entry,
    id: entry?.id || `${timestamp}-${level}-${message}`,
    timestamp,
    level,
    message: String(message),
  };
}

function normalizeLogList(payload) {
  const entries = Array.isArray(payload)
    ? payload
    : payload?.logs || payload?.entries || payload?.data || [];
  return entries.map(normalizeLog);
}

function mergeLogs(previous, incoming) {
  const next = [...previous];
  const existing = new Set(next.map((entry) => entry.id));
  incoming.forEach((entry) => {
    if (!existing.has(entry.id)) {
      next.push(entry);
      existing.add(entry.id);
    }
  });
  return next.slice(-DEFAULTS.logMaxEntries);
}

/**
 * Hook: manages server log streaming and filtering.
 * Returns logs, filters, and stream health so the UI can distinguish an empty
 * log buffer from a disconnected or failed logging endpoint.
 */
export function useLogs(backendUrl, apiKey) {
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(DEFAULTS.logAutoScroll);
  const [streamState, setStreamState] = useState('idle');
  const [logsError, setLogsError] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const sseLogRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const loadLogs = useCallback(async () => {
    if (!apiKey) return;
    try {
      // Fetch the full buffer once; filtering remains client-side so changing
      // INFO/WARN/ERROR does not permanently discard the other levels.
      const data = await fetchLogs(backendUrl, apiKey, DEFAULTS.logMaxEntries, 'all');
      setLogs(normalizeLogList(data));
      setLogsError('');
      setLastUpdatedAt(new Date().toISOString());
    } catch (error) {
      setLogsError(error.message || 'Unable to load recent logs.');
    }
  }, [backendUrl, apiKey]);

  useEffect(() => {
    if (!apiKey) {
      setStreamState('idle');
      return undefined;
    }

    loadLogs();
    setStreamState('connecting');

    const connect = () => {
      if (sseLogRef.current) sseLogRef.current.close();
      setStreamState('connecting');

      const { eventSource, close } = createLogStream(backendUrl, apiKey);
      const handleEntry = (event) => {
        try {
          const entry = normalizeLog(JSON.parse(event.data));
          setLogs((previous) => mergeLogs(previous, [entry]));
          setLogsError('');
          setLastUpdatedAt(entry.timestamp);
        } catch (error) {
          setLogsError('Received an invalid log event from the server.');
        }
      };

      eventSource.onopen = () => {
        setStreamState('connected');
        setLogsError('');
      };
      eventSource.onmessage = handleEntry;
      eventSource.addEventListener('log', handleEntry);
      eventSource.onerror = () => {
        close();
        setStreamState('reconnecting');
        setLogsError('Live logs disconnected. Retrying in 5 seconds.');
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(connect, 5000);
      };

      sseLogRef.current = eventSource;
    };

    connect();
    return () => {
      clearTimeout(reconnectTimerRef.current);
      if (sseLogRef.current) {
        sseLogRef.current.close();
        sseLogRef.current = null;
      }
    };
  }, [apiKey, backendUrl, loadLogs]);

  const filteredLogs = logs
    .filter((entry) => logFilter === 'all' || entry.level === logFilter)
    .filter(
      (entry) =>
        !logSearch ||
        entry.message.toLowerCase().includes(logSearch.toLowerCase())
    );

  return {
    logs,
    setLogs,
    logFilter,
    setLogFilter,
    logSearch,
    setLogSearch,
    autoScroll,
    setAutoScroll,
    filteredLogs,
    loadLogs,
    sseLogRef,
    streamState,
    logsError,
    lastUpdatedAt,
  };
}
