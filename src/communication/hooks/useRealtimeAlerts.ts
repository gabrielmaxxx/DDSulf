/**
 * Hook to stream dynamic high-priority operational alarms and incidents
 */

import { useState, useEffect, useCallback } from 'react';
import { useOperationalNotifications } from './useOperationalNotifications';
import PestFlowIncidentService from '../alerts/incidentService';
import { IncidentLog, AlertCategory } from '../types';

export function useRealtimeAlerts() {
  const { notifications } = useOperationalNotifications();
  const [incidents, setIncidents] = useState<IncidentLog[]>([]);
  const incidentService = PestFlowIncidentService.getInstance();

  useEffect(() => {
    const unsub = incidentService.subscribe((list) => {
      setIncidents(list);
    });
    return unsub;
  }, []);

  // Filter out high-severity active items
  const activeAlerts = notifications.filter(
    n => (n.severity === 'critical' || n.severity === 'high') && n.status === 'unread'
  );

  const createIncident = useCallback(async (params: {
    category: AlertCategory;
    carrierName?: string;
    technicianId?: string;
    failureLogString: string;
    severity: 'critical' | 'high';
    escalationPath: string[];
  }) => {
    return await incidentService.createIncident(params);
  }, []);

  const acknowledgeIncident = useCallback((id: string, operatorName: string) => {
    incidentService.acknowledgeIncident(id, operatorName);
  }, []);

  const resolveIncident = useCallback((id: string) => {
    incidentService.resolveIncident(id);
  }, []);

  return {
    activeAlerts,
    incidents,
    activeIncidentsCount: incidentService.getActiveIncidentsCount(),
    createIncident,
    acknowledgeIncident,
    resolveIncident
  };
}

export default useRealtimeAlerts;
