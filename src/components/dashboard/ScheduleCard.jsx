import React from 'react';
import { TIMEZONES } from '../../constants/timezones';
import { TIME_PRESETS } from '../../constants/presets';
import { cardStyle, btnSecondary } from '../../styles/theme';

/**
 * Schedule configuration card with view and edit modes.
 */
export default function ScheduleCard({
  schedule,
  isEditingSchedule,
  setIsEditingSchedule,
  scheduleForm,
  setScheduleForm,
  scheduleSaving,
  onSave,
  onToggle,
}) {
  const cronToHuman = (cron) => {
    if (cron === '30 0 * * *') return '12:30 AM';
    const parts = cron.split(' ');
    if (parts.length >= 2) {
      const min = parseInt(parts[0]);
      const hr = parseInt(parts[1]);
      const ampm = hr >= 12 ? 'PM' : 'AM';
      const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
      return `${hr12}:${min.toString().padStart(2, '0')} ${ampm}`;
    }
    return cron;
  };

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#475569' }}>
          Auto-Sync Schedule
        </h3>
        {schedule && (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: schedule.enabled ? '#dcfce7' : '#fee2e2',
              color: schedule.enabled ? '#16a34a' : '#dc2626',
            }}
          >
            {schedule.enabled ? 'ENABLED' : 'DISABLED'}
          </span>
        )}
      </div>

      {!isEditingSchedule ? (
        <div>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
                Next Run
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>
                {cronToHuman(scheduleForm.cron)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
                Timezone
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>
                {TIMEZONES.find((t) => t.value === scheduleForm.timezone)?.label ||
                  scheduleForm.timezone}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setIsEditingSchedule(true)}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              Edit Schedule
            </button>
            <button
              onClick={() => onToggle(!scheduleForm.enabled)}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: '6px',
                backgroundColor: scheduleForm.enabled ? '#fee2e2' : '#dcfce7',
                color: scheduleForm.enabled ? '#dc2626' : '#16a34a',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {scheduleForm.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '8px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 500,
                color: '#64748b',
                marginBottom: '4px',
              }}
            >
              Quick Select Time
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
              {TIME_PRESETS.map((p) => (
                <button
                  key={p.cron}
                  onClick={() => setScheduleForm((prev) => ({ ...prev, cron: p.cron }))}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    backgroundColor: scheduleForm.cron === p.cron ? '#4f46e5' : '#f1f5f9',
                    color: scheduleForm.cron === p.cron ? 'white' : '#475569',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 500,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 500,
                color: '#64748b',
                marginBottom: '3px',
              }}
            >
              Timezone
            </label>
            <select
              value={scheduleForm.timezone}
              onChange={(e) =>
                setScheduleForm((prev) => ({ ...prev, timezone: e.target.value }))
              }
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setIsEditingSchedule(false)}
              style={btnSecondary}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={scheduleSaving}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: '6px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {scheduleSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
