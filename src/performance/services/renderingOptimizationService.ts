/**
 * DDSulf Enterprise Rendering Optimization Service
 * Governs visual repaint cycles, isolates components, registers paint delays, and triggers renders debugging.
 */

import { RenderMeasurement, RenderingGovernancePolicy } from '../types';

class RenderingOptimizationService {
  private renderTimeline = new Map<string, RenderMeasurement[]>();
  private defaultPolicy: RenderingGovernancePolicy = {
    maxRenderTimeMs: 16.67, // 1 frame budget at 60Hz
    maxRendersPerMinute: 60,
    logToConsoleOnBreach: true,
    highlightPerformanceIssues: true
  };

  /**
   * Registers a fresh render measurement for auditing
   */
  public logRenderCycle(measurement: RenderMeasurement): void {
    const historical = this.renderTimeline.get(measurement.componentName) || [];
    historical.push(measurement);

    // Caps logs window to avoid memory overhead
    if (historical.length > 50) {
      historical.shift();
    }
    this.renderTimeline.set(measurement.componentName, historical);

    // Audit policy breaches
    if (measurement.lastDurMs > this.defaultPolicy.maxRenderTimeMs) {
      if (this.defaultPolicy.logToConsoleOnBreach && process.env.NODE_ENV !== 'production') {
        console.warn(
          `[DDSulf Rendering Boundary Breach] Component "${measurement.componentName}" exceeded render budget. ` +
          `Duration: ${measurement.lastDurMs}ms | Allowed: ${this.defaultPolicy.maxRenderTimeMs}ms`
        );
      }
    }
  }

  public getHistoricalData(componentName: string): RenderMeasurement[] {
    return this.renderTimeline.get(componentName) || [];
  }

  public getRenderingAnomalies() {
    const anomalies: { componentName: string; rendersStreakCount: number; maxTimeMs: number }[] = [];

    this.renderTimeline.forEach((history, name) => {
      const slowRenders = history.filter(h => h.lastDurMs > this.defaultPolicy.maxRenderTimeMs);
      if (slowRenders.length > 3 || history.length > 30) {
        anomalies.push({
          componentName: name,
          rendersStreakCount: history.length,
          maxTimeMs: Math.max(...history.map(h => h.lastDurMs))
        });
      }
    });

    return anomalies;
  }

  public updatePolicy(updated: Partial<RenderingGovernancePolicy>): void {
    this.defaultPolicy = { ...this.defaultPolicy, ...updated };
  }

  public getActivePolicy(): RenderingGovernancePolicy {
    return { ...this.defaultPolicy };
  }
}

export const renderingOptimizationService = new RenderingOptimizationService();
export default renderingOptimizationService;
