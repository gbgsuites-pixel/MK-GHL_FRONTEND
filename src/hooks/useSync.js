import { useState, useEffect, useCallback } from 'react';
import { fetchStatus, triggerSyncAll, triggerSyncSingle } from '../services/api';
import {
  getClientErrors as extractClientErrors,
  getClientStats,
} from '../utils/syncResult';

/**
 * Hook: manages sync status polling and sync triggers.
 * Returns sync status, triggering functions, and computed stats.
 */
export function useSync(backendUrl, apiKey) {
  const [syncStatus, setSyncStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeClientNum, setActiveClientNum] = useState(null);
  const [syncError, setSyncError] = useState('');

  // ── Load status ──
  const loadStatus = useCallback(async ({ preserveActive = false } = {}) => {
    try {
      const data = await fetchStatus(backendUrl, apiKey);
      setSyncStatus(data);
      setSyncError('');
      const running = ['running', 'in_progress', 'pending'].includes(data.status);
      setIsSyncing(running);
      if (!running && !preserveActive) setActiveClientNum(null);
      return data;
    } catch (error) {
      setSyncError(error.message || 'Unable to load sync status.');
      return null;
    }
  }, [backendUrl, apiKey]);

  // ── Poll every 10s ──
  useEffect(() => {
    if (!apiKey || !backendUrl) return undefined;
    loadStatus();
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, [apiKey, loadStatus]);

  // ── Trigger sync ──
  const triggerSync = useCallback(async (consultantNum, onLog) => {
    try {
      setSyncError('');
      setActiveClientNum(consultantNum || null);
      setIsSyncing(true);

      // Exactly one request is made here. The previous implementation called
      // /api/sync/all before the single-client endpoint, so a per-client click
      // started a full sync as well as the requested client sync.
      const result = consultantNum
        ? await triggerSyncSingle(backendUrl, apiKey, consultantNum)
        : await triggerSyncAll(backendUrl, apiKey);

      await loadStatus({ preserveActive: true });
      if (onLog) {
        onLog({
          timestamp: new Date().toISOString(),
          level: 'info',
          message:
            result?.message ||
            (consultantNum
              ? `Single-client sync started for ${consultantNum}.`
              : 'Full sync started.'),
          consultantNum: consultantNum || undefined,
        });
      }
      return result;
    } catch (error) {
      const message = error.message || 'Sync request failed.';
      setSyncError(message);
      setIsSyncing(false);
      setActiveClientNum(null);
      if (onLog) {
        onLog({
          timestamp: new Date().toISOString(),
          level: message.toLowerCase().includes('already') ? 'warn' : 'error',
          message,
          consultantNum: consultantNum || undefined,
        });
      }
      throw error;
    }
  }, [backendUrl, apiKey, loadStatus]);

  const stats = computeStats(syncStatus);

  return {
    syncStatus,
    isSyncing,
    setIsSyncing,
    activeClientNum,
    setActiveClientNum,
    syncError,
    setSyncError,
    loadStatus,
    triggerSync,
    ...stats,
  };
}

function computeStats(syncStatus) {
  const clients = syncStatus?.clients || [];
  const totalErrors = clients.reduce(
    (sum, client) => sum + Math.max(getClientStats(client).ghlErrors, extractClientErrors(client).length),
    0
  );
  const totalSynced = clients.reduce(
    (sum, client) => sum + getClientStats(client).ghlSynced,
    0
  );
  const totalContacts = clients.reduce(
    (sum, client) => sum + getClientStats(client).mergedContacts,
    0
  );
  const successCount = clients.filter(
    (client) => client.status === 'completed' && extractClientErrors(client).length === 0
  ).length;
  const failCount = clients.filter(
    (client) => client.status === 'failed' || extractClientErrors(client).length > 0
  ).length;

  const getClientErrors = (clientName) => {
    const client = clients.find(
      (entry) => entry.name === clientName || entry.clientName === clientName
    );
    return extractClientErrors(client);
  };

  return {
    totalErrors,
    totalSynced,
    totalContacts,
    successCount,
    failCount,
    getClientErrors,
  };
}
