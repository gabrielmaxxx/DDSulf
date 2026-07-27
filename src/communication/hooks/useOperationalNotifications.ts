/**
 * Hook to interface directly with PestFlow Realtime Notification Services
 */

import { useState, useEffect, useCallback } from 'react';
import PestFlowNotificationService from '../services/notificationService';
import { OperationalNotification, AlertCategory, AlertSeverity, QuickAction } from '../types';

export function useOperationalNotifications() {
  const [notifications, setNotifications] = useState<OperationalNotification[]>([]);
  const service = PestFlowNotificationService.getInstance();

  useEffect(() => {
    const unsub = service.subscribe((latest) => {
      setNotifications(latest);
    });
    return unsub;
  }, []);

  const sendNotification = useCallback(async (params: {
    category: AlertCategory;
    templateKey?: string;
    variables?: Record<string, any>;
    customTitle?: string;
    customMessage?: string;
    severity?: AlertSeverity;
    actorId?: string;
    recipientId?: string;
    routeUrl?: string;
    actions?: QuickAction[];
  }) => {
    return await service.createNotification(params);
  }, []);

  const markAsRead = useCallback((id: string) => {
    service.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    service.markAllAsRead();
  }, []);

  const archiveNotification = useCallback((id: string) => {
    service.archiveNotification(id);
  }, []);

  return {
    notifications,
    sendNotification,
    markAsRead,
    markAllAsRead,
    archiveNotification
  };
}

export default useOperationalNotifications;
