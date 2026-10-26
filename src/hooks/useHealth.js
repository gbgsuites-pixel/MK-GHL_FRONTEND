import { useState, useEffect } from 'react';
import { fetchHealth } from '../services/api';
import { DEFAULTS } from '../constants/config';

/**
 * Hook: monitors server uptime via /health endpoint.
 */
export function useHealth(backendUrl, apiKey) {
  const [serverUptime, setServerUptime] = useState(null);

  useEffect(() => {
    setServerUptime(null);
    if (!apiKey || !backendUrl) return undefined;

    const poll = async () => {
      try {
        const data = await fetchHealth(backendUrl);
        setServerUptime(data.uptime);
      } catch (_) {}
    };

    poll();
    const interval = setInterval(poll, DEFAULTS.healthPollInterval);
    return () => clearInterval(interval);
  }, [backendUrl, apiKey]);

  return serverUptime;
}
