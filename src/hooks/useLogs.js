import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLogs, createLogStream, createStreamTicket } from '../services/api';
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
 * Manage recent logs plus the ticket-authenticated SSE stream.
 * Long-lived API keys are exchanged through a header-authenticated REST call;
 * only a short-lived stream ticket appears in the EventSource URL.
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
  const generationRef = useRef(0);

  const loadLogs = useCallback(async () => {
    if (!apiKey || !backendUrl) return;
    try {
      const data = await fetchLogs(backendUrl, apiKey, DEFAULTS.logMaxEntries, 'all');
      setLogs(normalizeLogList(data));
      setLogsError('');
      setLastUpdatedAt(new Date().toISOString());
    } catch (error) {
      setLogsError(error.message || 'Unable to load recent logs.');
    }
  }, [backendUrl, apiKey]);

  useEffect(() => {
    setLogs([]);
    setLogsError('');
    setLastUpdatedAt(null);

    if (!apiKey || !backendUrl) {
      setStreamState('idle');
      return undefined;
    }

    let disposed = false;
    const generation = ++generationRef.current;

    const closeCurrent = () => {
      if (sseLogRef.current) {
        sseLogRef.current.close();
        sseLogRef.current = null;
      }
    };

    const connect = async () => {
      if (disposed || generation !== generationRef.current) return;
      setStreamState('connecting');

      try {
        const ticketResponse = await createStreamTicket(backendUrl, apiKey, 'logs');
        if (disposed || generation !== generationRef.current) return;

        const { eventSource, close } = createLogStream(backendUrl, ticketResponse.ticket);
        const handleEntry = (event) => {
          if (disposed || generation !== generationRef.current) return;
          try {
            const entry = normalizeLog(JSON.parse(event.data));
            setLogs((previous) => mergeLogs(previous, [entry]));
            setLogsError('');
            setLastUpdatedAt(entry.timestamp);
          } catch (_) {
            setLogsError('Received an invalid log event from the server.');
          }
        };

        eventSource.onopen = () => {
          if (disposed || generation !== generationRef.current) return;
          setStreamState('connected');
          setLogsError('');
        };
        eventSource.onmessage = handleEntry;
        eventSource.addEventListener('log', handleEntry);
        eventSource.onerror = () => {
          if (disposed || generation !== generationRef.current) return;
          close();
          sseLogRef.current = null;
          setStreamState('reconnecting');
          setLogsError('Live logs disconnected. Retrying in 5 seconds.');
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = window.setTimeout(() => {
            void connect();
          }, 5000);
        };

        sseLogRef.current = eventSource;
      } catch (error) {
        if (disposed || generation !== generationRef.current) return;
        setStreamState('reconnecting');
        setLogsError(error.message || 'Unable to create the live log stream.');
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = window.setTimeout(() => {
          void connect();
        }, 5000);
      }
    };

    void loadLogs();
    void connect();

    return () => {
      disposed = true;
      generationRef.current += 1;
      clearTimeout(reconnectTimerRef.current);
      closeCurrent();
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
