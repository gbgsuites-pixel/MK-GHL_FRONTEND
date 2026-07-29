import { useState, useEffect, useCallback } from 'react';
import { fetchStatus, triggerSyncAll, triggerSyncSingle } from '../services/api';

/**
 * Hook: manages sync status polling and sync triggers.
 * Returns sync status, triggering functions, and computed stats.
 */
export function useSync(backendUrl, apiKey) {
  const [syncStatus, setSyncStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // ── Load status ──
  const loadStatus = useCallback(async () => {
    try {
      const data = await fetchStatus(backendUrl, apiKey);
      setSyncStatus(data);
      setIsSyncing(data.status === 'running');
    } catch (_) {
      // Endpoint might not exist yet
    }
  }, [backendUrl, apiKey]);

  // ── Poll every 10s ──
  useEffect(() => {
    if (!apiKey) return;
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, [apiKey, loadStatus]);

  // ── Trigger sync ──
  const triggerSync = useCallback(async (consultantNum, onLog) => {
    try {
      const path = consultantNum ? '/api/sync/' + consultantNum : '/api/sync/all';
      const data = await triggerSyncAll(backendUrl, apiKey);
      // fallback for single:
      const result = consultantNum
        ? await triggerSyncSingle(backendUrl, apiKey, consultantNum)
        : await triggerSyncAll(backendUrl, apiKey);
      setIsSyncing(true);
      loadStatus();
      if (onLog) {
        onLog({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: result.message,
        });
      }
      return result;
    } catch (e) {
      if (e.message.includes('already')) {
        if (onLog) {
          onLog({
            timestamp: new Date().toISOString(),
            level: 'warn',
            message: 'Sync already in progress.',
          });
        }
      }
      throw e;
    }
  }, [backendUrl, apiKey, loadStatus]);

  // ── Computed stats ──
  const stats = computeStats(syncStatus);

  return {
    syncStatus,
    isSyncing,
    setIsSyncing,
    loadStatus,
    triggerSync,
    ...stats,
  };
}

/**
 * Compute aggregate stats from sync status.
 */
function computeStats(syncStatus) {
  const clients = syncStatus?.clients || [];
  const totalErrors = clients.reduce(
    (sum, c) => sum + (c.stats?.ghlErrors || c.ghlResult?.errors?.length || 0), 0
  );
  const totalSynced = clients.reduce(
    (sum, c) => sum + (c.stats?.ghlSynced || c.ghlResult?.synced || 0), 0
  );
  const totalContacts = clients.reduce(
    (sum, c) => sum + (c.stats?.mergedContacts || c.stats?.total || 0), 0
  );
  const successCount = clients.filter((c) => c.status === 'completed').length;
  const failCount = clients.filter((c) => c.status === 'failed').length;

  const getClientErrors = (clientName) => {
    const client = clients.find((c) => c.name === clientName);
    return client?.ghlResult?.errors || [];
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
