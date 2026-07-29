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
  triggerSyncAll,
  triggerSyncSingle,
  refreshSession,
  downloadCsv,
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
  // ── State ──
  const [activeTab, setActiveTab] = useState('dashboard');

  // ── Hooks ──
  const connection = useConnection();
  const sync = useSync(connection.backendUrl, connection.apiKey);
  const schedule = useSchedule(
    connection.backendUrl,
    connection.apiKey,
    (log) => {
      connection.setLogs((prev) => {
        const next = [...prev, log];
        if (next.length > DEFAULTS.logMaxEntries) next.shift();
        return next;
      });
    }
  );
  const logs = useLogs(connection.backendUrl, connection.apiKey);
  const progress = useProgress(
    connection.backendUrl,
    connection.apiKey,
    () => {
      sync.loadStatus();
      sync.setIsSyncing(false);
    }
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
      await sync.triggerSync(null, (log) => {
        connection.setLogs((prev) => {
          const next = [...prev, log];
          if (next.length > DEFAULTS.logMaxEntries) next.shift();
          return next;
        });
      });
    } catch (_) {}
  }, [sync, connection]);

  const handleSyncSingle = useCallback(
    async (consultantNum) => {
      try {
        const path = '/api/sync/' + consultantNum;
        await sync.triggerSync(consultantNum, (log) => {
          connection.setLogs((prev) => {
            const next = [...prev, log];
            if (next.length > DEFAULTS.logMaxEntries) next.shift();
            return next;
          });
        });
      } catch (_) {}
    },
    [sync, connection]
  );

  const handleCsv = useCallback(
    async (num, name) => {
      try {
        await downloadCsv(connection.backendUrl, connection.apiKey, num, name);
      } catch (e) {
        connection.setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `CSV download failed: ${e.message}`,
          },
        ]);
      }
    },
    [connection]
  );

  const handleRefresh = useCallback(
    async (num) => {
      try {
        await refreshSession(connection.backendUrl, connection.apiKey, num);
      } catch (e) {
        connection.setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `Session refresh failed: ${e.message}`,
          },
        ]);
      }
    },
    [connection]
  );

  // ── Render ──
  return (
    <div style={pageStyle}>
      <style>{globalStyles}</style>

      {/* Header */}
      <Header
        memoryInfo={memoryInfo}
        serverUptime={uptime}
        isSyncing={sync.isSyncing}
        schedule={schedule.schedule}
        scheduleForm={schedule.scheduleForm}
      />

      {/* Tab Navigation */}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div style={contentStyle}>
        {/* Connection Bar */}
        <ConnectionBar
          backendUrl={connection.backendUrl}
          setBackendUrl={connection.setBackendUrl}
          apiKey={connection.apiKey}
          setApiKey={connection.setApiKey}
          isConnecting={connection.isConnecting}
          connectionError={connection.connectionError}
          onConnect={handleConnect}
        />

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            clients={connection.clients}
            syncStatus={sync.syncStatus}
            isSyncing={sync.isSyncing}
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
            totalErrors={sync.totalErrors}
            onSyncAll={handleSyncAll}
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

        {activeTab === 'history' && (
          <HistoryTab historySyncs={historySyncs} />
        )}

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
          />
        )}
      </div>
    </div>
  );
}
