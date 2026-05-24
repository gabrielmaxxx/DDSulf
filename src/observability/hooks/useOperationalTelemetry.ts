/**
 * Hook: useOperationalTelemetry
 * Listens to active system telemetry notifications and allows client-side triggers of logs.
 */

import { useState, useEffect } from 'react';
import { telemetryService } from '../services';
import { OperationalTelemetryEvent, OperationalDomain, TelemetrySeverity } from '../types';

export function useOperationalTelemetry() {
  const [events, setEvents] = useState<OperationalTelemetryEvent[]>(() => telemetryService.getEvents());

  useEffect(() => {
    // Refresh local lists on any logging event
    const unsubscribe = telemetryService.subscribe(() => {
      setEvents(telemetryService.getEvents());
    });
    return () => unsubscribe();
  }, []);

  const emitTelemetryEvent = (
    domain: OperationalDomain,
    severity: TelemetrySeverity,
    title: string,
    description: string,
    metadata?: Record<string, any>
  ) => {
    telemetryService.logEvent(domain, severity, title, description, metadata);
  };

  return {
    events,
    emitTelemetryEvent,
    clearAllTelemetryHistory: () => {
      telemetryService.clearAll();
      setEvents([]);
    }
  };
}
