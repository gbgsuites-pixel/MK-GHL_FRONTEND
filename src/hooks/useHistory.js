import { useState, useEffect, useCallback } from 'react';
import { fetchExecutionHistory, fetchExecutionDetail } from '../services/api';

function normalizeExecution(row) {
  const startTime = row.started_at || row.startTime || null;
  const endTime = row.ended_at || row.endTime || null;
  const durationSec = row.duration_sec ?? row.durationSec ?? null;
  return {
    id: String(row.id || row.executionId || `${startTime}-${endTime}`),
    status: row.status || 'completed',
    startTime,
    endTime,
    durationMin: durationSec === null ? row.durationMin : Math.round((Number(durationSec) / 60) * 10) / 10,
    totalClients: row.total_clients ?? row.totalClients ?? 0,
    successCount: row.success_count ?? row.successCount ?? 0,
    failCount: row.fail_count ?? row.failCount ?? 0,
    results: Array.isArray(row.results) ? row.results : [],
  };
}

function normalizeClientResult(row) {
  return {
    name: row.client_name || row.clientName || row.name || row.consultant_num || 'Unknown client',
    consultantNum: row.consultant_num || row.consultantNum || null,
    status: row.status || 'unknown',
    durationMin: row.duration_sec === undefined ? row.durationMin : Math.round((Number(row.duration_sec) / 60) * 10) / 10,
    stats: {
      mergedContacts: row.merged_contacts || 0,
      ghlSynced: row.ghl_synced || 0,
      ghlErrors: row.ghl_errors || 0,
    },
    error: row.error_message || null,
    errorDetail: row.error_detail || null,
  };
}

/**
 * Durable execution history with a live-status fallback. Completed execution
 * IDs are used as the deduplication key so status polling cannot duplicate
 * the same historical run.
 */
export function useHistory(backendUrl, apiKey, syncStatus) {
  const [historySyncs, setHistorySyncs] = useState([]);
  const [historyError, setHistoryError] = useState('');

  const loadHistory = useCallback(async () => {
    if (!backendUrl || !apiKey) {
      setHistorySyncs([]);
      return;
    }
    try {
      const data = await fetchExecutionHistory(backendUrl, apiKey, 50);
      const rows = Array.isArray(data?.executions) ? data.executions : [];
      setHistorySyncs(rows.map(normalizeExecution));
      setHistoryError('');
    } catch (error) {
      setHistoryError(error.message || 'Unable to load durable sync history.');
    }
  }, [backendUrl, apiKey]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!syncStatus || !['completed', 'completed_with_errors', 'failed'].includes(syncStatus.status)) return;
    const summary = syncStatus.summary || syncStatus;
    const executionId = syncStatus.executionId || summary.executionId;
    if (!executionId) return;

    const liveEntry = normalizeExecution({
      id: executionId,
      status: syncStatus.status,
      started_at: summary.startTime || syncStatus.startTime,
      ended_at: summary.endTime || syncStatus.endTime,
      duration_sec: summary.durationMs ? summary.durationMs / 1000 : null,
      total_clients: summary.results?.length || syncStatus.clients?.length || 0,
      results: summary.results || syncStatus.clients || [],
    });
    setHistorySyncs((previous) => {
      const index = previous.findIndex((entry) => entry.id === liveEntry.id);
      if (index === -1) return [liveEntry, ...previous].slice(0, 50);
      const next = [...previous];
      next[index] = { ...next[index], ...liveEntry };
      return next;
    });
  }, [syncStatus]);

  const loadExecutionDetail = useCallback(async (executionId) => {
    if (!backendUrl || !apiKey || !executionId) return null;
    try {
      const data = await fetchExecutionDetail(backendUrl, apiKey, executionId);
      const results = (data?.clients || []).map(normalizeClientResult);
      setHistorySyncs((previous) => previous.map((entry) => (
        entry.id === String(executionId)
          ? { ...entry, results, status: data.execution?.status || entry.status }
          : entry
      )));
      return data;
    } catch (error) {
      setHistoryError(error.message || 'Unable to load execution details.');
      return null;
    }
  }, [backendUrl, apiKey]);

  return { historySyncs, historyError, loadHistory, loadExecutionDetail };
}
