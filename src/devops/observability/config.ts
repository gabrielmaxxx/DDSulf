/**
 * Observability Stream frequency and Latency SLO Rules
 */
export const observabilityConfig = {
  telemetrySendIntervalMs: 5000,
  maxMetricsBufferSize: 50,
  slaLimits: {
    latencyAmberMs: 120,
    latencyRedMs: 180,
    offlineBufferCapacity: 100
  }
};
export default observabilityConfig;
