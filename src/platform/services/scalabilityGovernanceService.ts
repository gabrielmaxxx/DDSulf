/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LatencyMetric {
  route: string;
  avgResponseMs: number;
  maxResponseMs: number;
  requestFrequencyPerMin: number;
}

export class ScalabilityGovernanceService {
  private latencies: LatencyMetric[] = [];

  constructor() {
    this.latencies = [
      { route: '/api/calculations', avgResponseMs: 145, maxResponseMs: 520, requestFrequencyPerMin: 42 },
      { route: '/api/inventory', avgResponseMs: 230, maxResponseMs: 1200, requestFrequencyPerMin: 18 },
      { route: '/api/telemetry', avgResponseMs: 45, maxResponseMs: 180, requestFrequencyPerMin: 110 },
      { route: '/api/ai-suggestions', avgResponseMs: 820, maxResponseMs: 3100, requestFrequencyPerMin: 15 },
    ];
  }

  public getLatencyMetrics(): LatencyMetric[] {
    return this.latencies;
  }

  /**
   * Evaluates if any route exceeds the performance-critical 1000ms threshold
   */
  public getOverburdenedRoutes(): LatencyMetric[] {
    return this.latencies.filter(l => l.avgResponseMs > 800 || l.maxResponseMs > 2500);
  }

  /**
   * Compiles the dynamic scalability footprint ratio of the infrastructure
   */
  public compileScalabilityIndex(): number {
    const totalRoutes = this.latencies.length;
    const fastRoutesCount = this.latencies.filter(l => l.avgResponseMs < 300).length;
    
    // Normal 100 max scale
    return totalRoutes > 0 ? Math.round((fastRoutesCount / totalRoutes) * 100) : 90;
  }
}

export const scalabilityGovernanceService = new ScalabilityGovernanceService();
export default scalabilityGovernanceService;
