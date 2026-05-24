import { useState, useCallback } from 'react';
import { subDays, subMonths, startOfMonth, startOfQuarter, formatISO } from 'date-fns';

export type TimePeriod = 'today' | 'last_7_days' | 'last_30_days' | 'current_month' | 'current_quarter' | 'all';

export function useAnalyticsFilters() {
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('current_month');

  const getStartDateISO = useCallback((period: TimePeriod): string | undefined => {
    const now = new Date();
    switch (period) {
      case 'today':
        return formatISO(subDays(now, 1)); // last 24h
      case 'last_7_days':
        return formatISO(subDays(now, 7));
      case 'last_30_days':
        return formatISO(subDays(now, 30));
      case 'current_month':
        return formatISO(startOfMonth(now));
      case 'current_quarter':
        return formatISO(startOfQuarter(now));
      case 'all':
      default:
        return undefined;
    }
  }, []);

  return {
    activePeriod,
    startDateISO: getStartDateISO(activePeriod),
    setPeriod: setActivePeriod
  };
}

export default useAnalyticsFilters;
