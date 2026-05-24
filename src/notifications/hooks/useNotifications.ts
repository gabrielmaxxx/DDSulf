/**
 * Custom React Hook: useNotifications
 * Handles reactive reading and mutation of client alert notices list
 */

import { useState, useEffect } from 'react';
import { OperationalAlert } from '../types';
import { NotificationService } from '../services/notificationService';

export function useNotifications() {
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);

  useEffect(() => {
    // Fill first state in
    setAlerts(NotificationService.getAlerts());

    // Connect listener for storage updates
    const unsubscribe = NotificationService.subscribe(() => {
      setAlerts(NotificationService.getAlerts());
    });

    return () => unsubscribe();
  }, []);

  return {
    alerts,
    unreadCount: alerts.filter(a => !a.isRead).length,
    markAsRead: (id: string) => NotificationService.markAsRead(id),
    markAllAsRead: () => NotificationService.markAllAsRead(),
    clearAll: () => NotificationService.clearAll()
  };
}

export default useNotifications;
