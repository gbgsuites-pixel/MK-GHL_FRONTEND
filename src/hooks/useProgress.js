import { useState, useEffect, useRef } from 'react';
import { createProgressStream } from '../services/api';

/**
 * Hook: manages live sync progress SSE stream.
 * Returns progress data and a function to reset it.
 */
export function useProgress(backendUrl, apiKey, onSyncComplete) {
  const [liveProgress, setLiveProgress] = useState(null);
  const sseProgressRef = useRef(null);

  useEffect(() => {
    if (!apiKey) return;

    const connect = () => {
      if (sseProgressRef.current) sseProgressRef.current.close();

      const { eventSource, close } = createProgressStream(backendUrl, apiKey);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLiveProgress(data);
          if (data.status === 'completed' && onSyncComplete) {
            onSyncComplete();
          }
        } catch (_) {}
      };

      eventSource.onerror = () => {
        close();
        setTimeout(connect, 5000);
      };

      sseProgressRef.current = eventSource;
    };

    connect();
    return () => {
      if (sseProgressRef.current) {
        sseProgressRef.current.close();
        sseProgressRef.current = null;
      }
    };
  }, [apiKey, backendUrl, onSyncComplete]);

  return { liveProgress, setLiveProgress };
}
