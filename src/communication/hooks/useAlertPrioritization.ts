/**
 * Hook to intelligently prioritize notifications and sort by AI score
 */

import { useMemo } from 'react';
import { useOperationalNotifications } from './useOperationalNotifications';
import { OperationalNotification } from '../types';

export function useAlertPrioritization() {
  const { notifications } = useOperationalNotifications();

  const prioritizedNotifications = useMemo(() => {
    // Clone notifications to sort them
    const list = [...notifications];
    
    return list.sort((a, b) => {
      // Unread items always come first
      if (a.status === 'unread' && b.status !== 'unread') return -1;
      if (a.status !== 'unread' && b.status === 'unread') return 1;

      // Sort by AI priority index if available
      const scoreA = a.aiPriorityIndex ?? 50;
      const scoreB = b.aiPriorityIndex ?? 50;
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Descending priority
      }

      // Sort by severity as second tier
      const severityMap: Record<string, number> = {
        critical: 5,
        high: 4,
        medium: 3,
        low: 2,
        informational: 1
      };

      const sevA = severityMap[a.severity] || 0;
      const sevB = severityMap[b.severity] || 0;

      if (sevA !== sevB) {
        return sevB - sevA;
      }

      // Final fallback to timing
      return b.timestamp - a.timestamp;
    });
  }, [notifications]);

  // Bubble up any extreme emergency notices
  const criticalFlashlist = useMemo(() => {
    return notifications.filter(
      n => n.severity === 'critical' && n.status === 'unread'
    );
  }, [notifications]);

  return {
    prioritizedNotifications,
    criticalFlashlist
  };
}

export default useAlertPrioritization;
