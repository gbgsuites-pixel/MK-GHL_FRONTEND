import { MEMORY_THRESHOLDS } from '../constants/statusColors';

/**
 * Extract memory usage from log entries.
 * Parses [Server] Memory: RSS=XXXMB pattern.
 * @param {Array} logs - Log entries
 * @returns {{ value: number, color: string, label: string }|null}
 */
export function useMemory(logs) {
  const memRegex = /\[Server\]\s*Memory:\s*RSS=(\d+)MB/i;
  for (let i = logs.length - 1; i >= 0; i--) {
    const match = logs[i].message?.match(memRegex);
    if (match) {
      const rss = parseInt(match[1]);
      if (rss < MEMORY_THRESHOLDS.warning)
        return { value: rss, color: '#16a34a', label: 'Good' };
      if (rss < MEMORY_THRESHOLDS.critical)
        return { value: rss, color: '#f59e0b', label: 'Warning' };
      return { value: rss, color: '#dc2626', label: 'Critical' };
    }
  }
  return null;
}
