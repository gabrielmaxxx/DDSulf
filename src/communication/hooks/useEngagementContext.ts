/**
 * Engagement Intelligence and Delivery Observability Hook
 */

import { useState, useEffect } from 'react';
import DDSulfNotificationService from '../services/notificationService';
import { CommunicationMetrics } from '../types';

export function useEngagementContext() {
  const service = DDSulfNotificationService.getInstance();
  const [metrics, setMetrics] = useState<CommunicationMetrics>(service.getLiveMetrics());

  useEffect(() => {
    const unsub = service.subscribe(() => {
      setMetrics(service.getLiveMetrics());
    });
    return unsub;
  }, []);

  return {
    metrics,
    refreshMetrics: () => setMetrics(service.getLiveMetrics())
  };
}

export default useEngagementContext;
