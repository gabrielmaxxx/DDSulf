/**
 * DDSulf Observability, telemetry and performance analytics service
 */

import { OperationalMetric } from '../types';

class ObservabilityService {
  private metricsStream: OperationalMetric[] = [];

  constructor() {
    this.seedDefaultMetrics();
  }

  private seedDefaultMetrics() {
    const now = Date.now();
    for (let i = 10; i >= 0; i--) {
      this.metricsStream.push({
        timestamp: new Date(now - i * 5000).toISOString(),
        pwaCacheHits: Math.floor(92 + Math.random() * 8),
        firestoreReads: Math.floor(10 + Math.random() * 25),
        apiLatencyMs: Math.floor(45 + Math.random() * 40),
        pwaSyncQueueSize: i === 0 ? 0 : Math.floor(Math.random() * 3),
        activeRealtimeListeners: 14,
        pwaOfflineStatus: 'online',
        cpuUtilization: Math.floor(10 + Math.random() * 25),
        memoryUsageMb: Math.floor(110 + Math.random() * 30)
      });
    }
  }

  public getLiveMetrics(): OperationalMetric[] {
    return this.metricsStream;
  }

  public pushMetric(metric: Omit<OperationalMetric, 'timestamp'>) {
    const full: OperationalMetric = {
      timestamp: new Date().toISOString(),
      ...metric
    };
    this.metricsStream.push(full);
    if (this.metricsStream.length > 50) {
      this.metricsStream.shift();
    }
  }

  public getAverageLatency(): number {
    if (this.metricsStream.length === 0) return 0;
    const total = this.metricsStream.reduce((acc, current) => acc + current.apiLatencyMs, 0);
    return Math.floor(total / this.metricsStream.length);
  }
}

export const observabilityService = new ObservabilityService();
export default observabilityService;
