import { useState, useEffect } from 'react';

/**
 * Hook: builds an in-memory history of completed syncs.
 * Each time syncStatus transitions to 'completed', a new entry is recorded.
 */
export function useHistory(syncStatus) {
  const [historySyncs, setHistorySyncs] = useState([]);

  useEffect(() => {
    if (syncStatus && syncStatus.status === 'completed' && syncStatus.summary) {
      const newEntry = {
        id: `sync-${Date.now()}`,
        startTime: syncStatus.summary.startTime,
        endTime: syncStatus.summary.endTime,
        durationMin: syncStatus.summary.durationMin,
        results: syncStatus.summary.results || syncStatus.clients || [],
        totalClients:
          syncStatus.summary.results?.length ||
          syncStatus.clients?.length ||
          0,
      };
      setHistorySyncs((prev) => [newEntry, ...prev].slice(0, 50));
    }
  }, [syncStatus]);

  return historySyncs;
}
