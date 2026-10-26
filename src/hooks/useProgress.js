import { useState, useEffect, useRef } from 'react';
import { createProgressStream, createStreamTicket } from '../services/api';

/**
 * Manage live sync progress through a short-lived ticket-authenticated stream.
 */
export function useProgress(backendUrl, apiKey, onSyncComplete) {
  const [liveProgress, setLiveProgress] = useState(null);
  const sseProgressRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const generationRef = useRef(0);

  useEffect(() => {
    setLiveProgress(null);
    clearTimeout(reconnectTimerRef.current);

    if (!apiKey || !backendUrl) return undefined;

    let disposed = false;
    const generation = ++generationRef.current;

    const closeCurrent = () => {
      if (sseProgressRef.current) {
        sseProgressRef.current.close();
        sseProgressRef.current = null;
      }
    };

    const connect = async () => {
      if (disposed || generation !== generationRef.current) return;

      try {
        const ticketResponse = await createStreamTicket(backendUrl, apiKey, 'progress');
        if (disposed || generation !== generationRef.current) return;

        const { eventSource, close } = createProgressStream(
          backendUrl,
          ticketResponse.ticket
        );

        eventSource.onmessage = (event) => {
          if (disposed || generation !== generationRef.current) return;
          try {
            const data = JSON.parse(event.data);
            setLiveProgress(data);
            if (['completed', 'failed'].includes(data.status) && onSyncComplete) {
              onSyncComplete();
            }
          } catch (_) {
            // Ignore malformed progress events; the next valid event will recover.
          }
        };

        eventSource.onerror = () => {
          if (disposed || generation !== generationRef.current) return;
          close();
          sseProgressRef.current = null;
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = window.setTimeout(() => {
            void connect();
          }, 5000);
        };

        sseProgressRef.current = eventSource;
      } catch (_) {
        if (disposed || generation !== generationRef.current) return;
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = window.setTimeout(() => {
          void connect();
        }, 5000);
      }
    };

    void connect();

    return () => {
      disposed = true;
      generationRef.current += 1;
      clearTimeout(reconnectTimerRef.current);
      closeCurrent();
    };
  }, [apiKey, backendUrl, onSyncComplete]);

  return { liveProgress, setLiveProgress };
}
