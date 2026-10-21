import React, { useState, useCallback } from 'react';

// ── Hooks ──
import { useConnection } from './hooks/useConnection';
import { useSync } from './hooks/useSync';
import { useSchedule } from './hooks/useSchedule';
import { useLogs } from './hooks/useLogs';
import { useProgress } from './hooks/useProgress';
import { useHealth } from './hooks/useHealth';
import { useMemory } from './hooks/useMemory';
import { useHistory } from './hooks/useHistory';

// ── Services ──
import {
  refreshSession,
  downloadCsv,
  downloadAllMaryKayCsv,
} from './services/api';

// ── Constants ──
import { DEFAULTS } from './constants/config';

// ── Styles ──
import { pageStyle, contentStyle, globalStyles } from './styles/theme';

// ── Layout Components ──
import Header from './components/layout/Header';
import TabNav from './components/layout/TabNav';
import ConnectionBar from './components/layout/ConnectionBar';

// ── Tab Components ──
import DashboardTab from './components/dashboard/DashboardTab';
import ClientsTab from './components/clients/ClientsTab';
import SyncTab from './components/sync/SyncTab';
import HistoryTab from './components/history/HistoryTab';
import LogsTab from './components/logs/LogsTab';

/**
 * Root application component.
 * Thin wiring layer that composes hooks and passes props to tab components.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isExportingAllCsv, setIsExportingAllCsv] = useState(false);

  const connection = useConnection();
  const sync = useSync(connection.backendUrl, connection.apiKey);
  const logs = useLogs(connection.backendUrl, connection.apiKey);

  // Local action logs must use the same store as the Logs tab. The previous
  // code appended these to connection.setLogs, which was never rendered.
  const appendLog = useCallback(
    (log) => {
      logs.setLogs((previous) => [...previous, log].slice(-DEFAULTS.logMaxEntries));
    },
    [logs.setLogs]
  );

  const schedule = useSchedule(
    connection.backendUrl,
    connection.apiKey,
    appendLog
  );

  // Keep the callback stable. Recreating it on every App render caused the
  // progress EventSource to tear down and reconnect repeatedly.
  const handleSyncComplete = useCallback(() => {
    sync.loadStatus();
    sync.setIsSyncing(false);
    sync.setActiveClientNum(null);
  }, [sync.loadStatus, sync.setIsSyncing, sync.setActiveClientNum]);

  const progress = useProgress(
    connection.backendUrl,
    connection.apiKey,
    handleSyncComplete
  );
  const uptime = useHealth(connection.backendUrl, connection.apiKey);
  const memoryInfo = useMemory(logs.logs);
  const historySyncs = useHistory(sync.syncStatus);

  // ── Handlers ──
  const handleConnect = useCallback(() => {
    connection.loadClients().then(() => {
      schedule.loadSchedule();
      logs.loadLogs();
    });
  }, [connection, schedule, logs]);

  const handleSyncAll = useCallback(async () => {
    try {
      await sync.triggerSync(null, appendLog);
    } catch (_) {
      // useSync records the visible error log and syncError state.
    }
  }, [sync, appendLog]);

  const handleSyncSingle = useCallback(
    async (consultantNum) => {
      try {
        await sync.triggerSync(consultantNum, appendLog);
      } catch (_) {
        // useSync records the visible error log and syncError state.
      }
    },
    [sync, appendLog]
  );

  const handleCsv = useCallback(
    async (num, name) => {
      try {
        await downloadCsv(connection.backendUrl, connection.apiKey, num, name);
        appendLog({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `CSV export completed for ${name || num}.`,
          consultantNum: num,
        });
      } catch (error) {
        appendLog({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `CSV download failed for ${name || num}: ${error.message}`,
          consultantNum: num,
        });
      }
    },
    [connection.backendUrl, connection.apiKey, appendLog]
  );

  const handleRefresh = useCallback(
    async (num) => {
      try {
        await refreshSession(connection.backendUrl, connection.apiKey, num);
        appendLog({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Session refresh completed for ${num}.`,
          consultantNum: num,
        });
      } catch (error) {
        appendLog({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Session refresh failed for ${num}: ${error.message}`,
          consultantNum: num,
        });
      }
    },
    [connection.backendUrl, connection.apiKey, appendLog]
  );

  const handleExportAllCsv = useCallback(async () => {
    setIsExportingAllCsv(true);
    try {
      await downloadAllMaryKayCsv(connection.backendUrl, connection.apiKey);
      appendLog({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Complete Mary Kay CSV export downloaded without a GHL upload.',
      });
    } catch (error) {
      appendLog({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Complete Mary Kay CSV export failed: ${error.message}`,
      });
    } finally {
      setIsExportingAllCsv(false);
    }
  }, [connection.backendUrl, connection.apiKey, appendLog]);

  return (
    <div style={pageStyle}>
      <style>{globalStyles}</style>

      <Header
        memoryInfo={memoryInfo}
        serverUptime={uptime}
        isSyncing={sync.isSyncing}
        schedule={schedule.schedule}
        scheduleForm={schedule.scheduleForm}
      />

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div style={contentStyle}>
        <ConnectionBar
          backendUrl={connection.backendUrl}
          setBackendUrl={connection.setBackendUrl}
          apiKey={connection.apiKey}
          setApiKey={connection.setApiKey}
          isConnecting={connection.isConnecting}
          connectionError={connection.connectionError}
          onConnect={handleConnect}
        />

        {activeTab === 'dashboard' && (
          <DashboardTab
            clients={connection.clients}
            syncStatus={sync.syncStatus}
            isSyncing={sync.isSyncing}
            activeClientNum={sync.activeClientNum}
            syncError={sync.syncError}
            successCount={sync.successCount}
            failCount={sync.failCount}
            totalSynced={sync.totalSynced}
            totalContacts={sync.totalContacts}
            totalErrors={sync.totalErrors}
            schedule={schedule.schedule}
            scheduleForm={schedule.scheduleForm}
            isEditingSchedule={schedule.isEditingSchedule}
            setIsEditingSchedule={schedule.setIsEditingSchedule}
            scheduleSaving={schedule.scheduleSaving}
            onSyncAll={handleSyncAll}
            onSyncSingle={handleSyncSingle}
            onSaveSchedule={schedule.saveSchedule}
            onToggleCron={schedule.toggleCronEnabled}
            onTabChange={setActiveTab}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsTab
            clients={connection.clients}
            syncStatus={sync.syncStatus}
            isSyncing={sync.isSyncing}
            activeClientNum={sync.activeClientNum}
            syncError={sync.syncError}
            totalErrors={sync.totalErrors}
            onSyncAll={handleSyncAll}
            onExportAllCsv={handleExportAllCsv}
            isExportingAllCsv={isExportingAllCsv}
            onSyncSingle={handleSyncSingle}
            onCsv={handleCsv}
            onRefresh={handleRefresh}
            getClientErrors={sync.getClientErrors}
          />
        )}

        {activeTab === 'sync' && (
          <SyncTab
            liveProgress={progress.liveProgress}
            isSyncing={sync.isSyncing}
            clients={connection.clients}
            onSyncAll={handleSyncAll}
          />
        )}

        {activeTab === 'history' && <HistoryTab historySyncs={historySyncs} />}

        {activeTab === 'logs' && (
          <LogsTab
            filteredLogs={logs.filteredLogs}
            logSearch={logs.logSearch}
            setLogSearch={logs.setLogSearch}
            logFilter={logs.logFilter}
            setLogFilter={logs.setLogFilter}
            autoScroll={logs.autoScroll}
            setAutoScroll={logs.setAutoScroll}
            onLoadMore={logs.loadLogs}
            streamState={logs.streamState}
            logsError={logs.logsError}
            lastUpdatedAt={logs.lastUpdatedAt}
          />
        )}
      </div>
    </div>
  );
}
