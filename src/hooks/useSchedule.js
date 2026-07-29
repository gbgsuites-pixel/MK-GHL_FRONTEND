import { useState, useCallback } from 'react';
import { fetchSchedule, updateSchedule, toggleCron } from '../services/api';
import { DEFAULTS } from '../constants/config';

/**
 * Hook: manages auto-sync schedule configuration.
 */
export function useSchedule(backendUrl, apiKey, onLog) {
  const [schedule, setSchedule] = useState(null);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    cron: DEFAULTS.cron,
    timezone: DEFAULTS.timezone,
    enabled: true,
  });
  const [scheduleSaving, setScheduleSaving] = useState(false);

  const loadSchedule = useCallback(async () => {
    try {
      const data = await fetchSchedule(backendUrl, apiKey);
      setSchedule(data);
      setScheduleForm({
        cron: data.cron || DEFAULTS.cron,
        timezone: data.timezone || DEFAULTS.timezone,
        enabled: data.enabled !== false,
      });
    } catch (_) {
      // Endpoint might not exist
    }
  }, [backendUrl, apiKey]);

  const saveSchedule = useCallback(async () => {
    setScheduleSaving(true);
    try {
      await updateSchedule(backendUrl, apiKey, scheduleForm);
      setSchedule({ ...scheduleForm });
      setIsEditingSchedule(false);
      if (onLog) {
        onLog({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Schedule updated: ${scheduleForm.cron} (${scheduleForm.timezone})`,
        });
      }
    } catch (e) {
      if (onLog) {
        onLog({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Schedule update failed: ${e.message}`,
        });
      }
    }
    setScheduleSaving(false);
  }, [backendUrl, apiKey, scheduleForm, onLog]);

  const toggleCronEnabled = useCallback(async (enable) => {
    try {
      const data = await toggleCron(backendUrl, apiKey, enable);
      setSchedule((prev) => ({ ...prev, enabled: enable }));
      setScheduleForm((prev) => ({ ...prev, enabled: enable }));
      if (onLog) {
        onLog({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: data.message,
        });
      }
    } catch (e) {
      if (onLog) {
        onLog({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Cron toggle failed: ${e.message}`,
        });
      }
    }
  }, [backendUrl, apiKey, onLog]);

  return {
    schedule,
    isEditingSchedule, setIsEditingSchedule,
    scheduleForm, setScheduleForm,
    scheduleSaving,
    loadSchedule,
    saveSchedule,
    toggleCronEnabled,
  };
}
