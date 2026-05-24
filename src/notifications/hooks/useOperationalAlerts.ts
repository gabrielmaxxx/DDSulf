/**
 * Custom React Hook: useOperationalAlerts
 * Isolates and tracks field operations warnings, POP checklist logs and inventory drops
 */

import { useNotifications } from './useNotifications';

export function useOperationalAlerts() {
  const { alerts, markAsRead, markAllAsRead } = useNotifications();

  // Narrow target down to operations & workflow categories
  const operationalList = alerts.filter(
    a => a.category === 'operations' || a.category === 'workflow'
  );

  return {
    operationalAlerts: operationalList,
    unreadOperationsCount: operationalList.filter(a => !a.isRead).length,
    markOpsAsRead: (id: string) => markAsRead(id),
    markAllOpsAsRead: () => markAllAsRead()
  };
}

export default useOperationalAlerts;
