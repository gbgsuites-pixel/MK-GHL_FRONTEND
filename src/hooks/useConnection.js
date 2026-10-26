import { useState, useEffect, useCallback } from 'react';
import {
  BACKEND_URL,
  DEFAULT_API_KEY,
  STORAGE_KEYS,
  normalizeBackendUrl,
} from '../constants/config';
import { fetchClients } from '../services/api';

function isLocalhostUrl(value) {
  try {
    const hostname = new URL(value).hostname;
    return ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname);
  } catch (_) {
    return false;
  }
}

function getInitialBackendUrl() {
  const stored = normalizeBackendUrl(localStorage.getItem(STORAGE_KEYS.backendUrl));
  // A localhost value saved during local development must not override the
  // configured Render URL when the same browser opens the production build.
  if (import.meta.env.PROD && isLocalhostUrl(stored)) return BACKEND_URL;
  return stored || BACKEND_URL;
}

function getConnectionError(error, backendUrl) {
  const message = error?.message || '';
  const target = backendUrl || 'no backend URL configured';

  if (!backendUrl) {
    return 'Backend URL is not configured. Set VITE_BACKEND_URL in the deployment environment or enter the Render URL above.';
  }
  if (/failed to fetch|network|load failed|timed out|timeout/i.test(message)) {
    return `Cannot reach ${target}. Check that the Render service is running and that its CORS policy allows this frontend.`;
  }
  return message || `Unable to connect to ${target}.`;
}

/**
 * Hook: manages API key and backend URL with localStorage persistence.
 * Provides connect function to load clients.
 */
export function useConnection() {
  const [apiKey, setApiKey] = useState(
    () => DEFAULT_API_KEY
  );
  const [backendUrl, setBackendUrlState] = useState(getInitialBackendUrl);
  const [clients, setClients] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  const setBackendUrl = useCallback((value) => {
    setBackendUrlState(normalizeBackendUrl(value));
    setConnectionError('');
  }, []);

  useEffect(() => {
    if (backendUrl) localStorage.setItem(STORAGE_KEYS.backendUrl, backendUrl);
    else localStorage.removeItem(STORAGE_KEYS.backendUrl);
  }, [backendUrl]);

  useEffect(() => {
    // A URL or credential change represents a new backend/tenant boundary.
    // Do not leave the previous client's records visible during reconnect.
    setClients([]);
  }, [backendUrl, apiKey]);

  const loadClients = useCallback(async () => {
    setConnectionError('');
    if (!backendUrl) {
      setConnectionError(getConnectionError(null, backendUrl));
      return false;
    }
    if (!apiKey) {
      setConnectionError('API key is required before connecting to the backend.');
      return false;
    }

    setIsConnecting(true);
    try {
      const data = await fetchClients(backendUrl, apiKey);
      const nextClients = data?.clients || data?.data || [];
      if (!Array.isArray(nextClients)) {
        throw new Error('Backend returned an invalid client list.');
      }
      setClients(nextClients);
      return true;
    } catch (error) {
      setClients([]);
      setConnectionError(getConnectionError(error, backendUrl));
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [apiKey, backendUrl]);

  return {
    apiKey,
    setApiKey,
    backendUrl,
    setBackendUrl,
    clients,
    setClients,
    isConnecting,
    connectionError,
    loadClients,
  };
}
