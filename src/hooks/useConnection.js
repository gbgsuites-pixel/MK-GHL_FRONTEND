import { useState, useEffect, useCallback } from 'react';
import { BACKEND_URL, DEFAULT_API_KEY, STORAGE_KEYS } from '../constants/config';
import { fetchClients } from '../services/api';

/**
 * Hook: manages API key and backend URL with localStorage persistence.
 * Provides connect function to load clients.
 */
export function useConnection() {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(STORAGE_KEYS.apiKey) || DEFAULT_API_KEY
  );
  const [backendUrl, setBackendUrl] = useState(
    () => localStorage.getItem(STORAGE_KEYS.backendUrl) || BACKEND_URL
  );
  const [clients, setClients] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.apiKey, apiKey);
    localStorage.setItem(STORAGE_KEYS.backendUrl, backendUrl);
  }, [apiKey, backendUrl]);

  const loadClients = useCallback(async () => {
    if (!apiKey) return;
    setIsConnecting(true);
    setConnectionError('');
    try {
      const data = await fetchClients(backendUrl, apiKey);
      setClients(data.clients || []);
    } catch (e) {
      setConnectionError(e.message);
    }
    setIsConnecting(false);
  }, [apiKey, backendUrl]);

  return {
    apiKey, setApiKey,
    backendUrl, setBackendUrl,
    clients, setClients,
    isConnecting,
    connectionError,
    loadClients,
  };
}
