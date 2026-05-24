/**
 * Custom React Hook: useFinancialAlerts
 * Tracks low margin anomalies, pricing deviations or unbilled technician expenses
 */

import { useNotifications } from './useNotifications';

export function useFinancialAlerts() {
  const { alerts, markAsRead } = useNotifications();

  // Extract financial notifications
  const financialList = alerts.filter(a => a.category === 'financial');

  return {
    financialAlerts: financialList,
    unreadFinancialCount: financialList.filter(a => !a.isRead).length,
    markFinancialAsRead: (id: string) => markAsRead(id)
  };
}

export default useFinancialAlerts;
