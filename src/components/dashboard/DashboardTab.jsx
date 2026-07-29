import React from 'react';
import StatCard from './StatCard';
import ScheduleCard from './ScheduleCard';
import QuickActions from './QuickActions';
import ClientGrid from './ClientGrid';

/**
 * Dashboard tab: summary cards, schedule, quick actions, client grid.
 */
export default function DashboardTab({
  clients,
  syncStatus,
  isSyncing,
  successCount,
  failCount,
  totalSynced,
  totalContacts,
  totalErrors,
  schedule,
  scheduleForm,
  isEditingSchedule,
  setIsEditingSchedule,
  scheduleSaving,
  onSyncAll,
  onSyncSingle,
  onSaveSchedule,
  onToggleCron,
  onTabChange,
}) {
  return (
    <div>
      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <StatCard label="Total Clients" value={clients.length} icon="👥" color="#4f46e5" />
        <StatCard
          label="Contacts Synced"
          value={totalSynced || '—'}
          sub={totalContacts > 0 ? `of ${totalContacts} found` : ''}
          icon="✅"
          color="#16a34a"
        />
        <StatCard
          label="GHL Errors"
          value={totalErrors || 0}
          icon="⚠️"
          color={totalErrors > 0 ? '#dc2626' : '#6b7280'}
        />
        <StatCard
          label="Sync Status"
          value={isSyncing ? 'Running' : 'Idle'}
          sub={
            isSyncing
              ? `${successCount} done, ${failCount} failed`
              : 'No active sync'
          }
          icon="📊"
          color={isSyncing ? '#2563eb' : '#6b7280'}
        />
      </div>

      {/* Schedule + Quick Actions Row */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}
      >
        <ScheduleCard
          schedule={schedule}
          isEditingSchedule={isEditingSchedule}
          setIsEditingSchedule={setIsEditingSchedule}
          scheduleForm={scheduleForm}
          setScheduleForm={(updater) => {
            // handled via parent setScheduleForm
            if (typeof updater === 'function') updater((prev) => prev);
          }}
          scheduleSaving={scheduleSaving}
          onSave={onSaveSchedule}
          onToggle={onToggleCron}
        />
        <QuickActions
          isSyncing={isSyncing}
          clientCount={clients.length}
          onTabChange={onTabChange}
        />
      </div>

      {/* Client Overview Grid */}
      {clients.length > 0 && (
        <ClientGrid
          clients={clients}
          syncStatus={syncStatus}
          isSyncing={isSyncing}
          onSyncSingle={onSyncSingle}
        />
      )}
    </div>
  );
}
