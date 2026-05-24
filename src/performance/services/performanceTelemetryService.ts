/**
 * DDSulf Performance Telemetry Service
 * Aggregates real-time layout rendering, network delays, INP interactions, frame rates, and memory alerts.
 */

import { telemetryEngine } from '../telemetry';
import { TelemetryEvent, InpMetric } from '../types';

class PerformanceTelemetryService {
  private inpsCaptured: InpMetric[] = [];

  /**
   * Safe logs an operational metric from components hooks or stream triggers
   */
  public reportEvent(
    name: string,
    value: number,
    type: TelemetryEvent['type'],
    amberLimit: number,
    redLimit: number
  ): TelemetryEvent {
    return telemetryEngine.logMetric(name, value, type, amberLimit, redLimit);
  }

  /**
   * Connects user clicks/keypress durations for Interaction to Next Paint diagnostics
   */
  public logUserInteraction(interactionName: string, latencyMs: number): void {
    const metric = telemetryEngine.trackInteraction(interactionName, latencyMs);
    this.inpsCaptured.push(metric);

    if (this.inpsCaptured.length > 30) {
      this.inpsCaptured.shift(); // FIFO trim
    }
  }

  public getSystemAuditRecord() {
    const engineReport = telemetryEngine.getSystemPerformanceReport();
    const activeRecentLogs = telemetryEngine.getRecentLogs();

    return {
      ...engineReport,
      recentPerformanceEvents: activeRecentLogs,
      capturedInpMeters: [...this.inpsCaptured]
    };
  }

  public clearStats() {
    this.inpsCaptured = [];
  }
}

export const performanceTelemetryService = new PerformanceTelemetryService();
export default performanceTelemetryService;
