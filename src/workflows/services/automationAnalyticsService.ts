import { WorkflowEngineService } from '../engine/workflowEngine';
import { AutomationExecutionMetrics, WorkflowInstance } from '../types';

export class AutomationAnalyticsService {
  /**
   * Evaluates success statistics and real-time executors count
   */
  public static getMetricsSummary(tenantId: string): AutomationExecutionMetrics {
    return WorkflowEngineService.getMetrics(tenantId);
  }

  /**
   * Evaluates operational latency histograms
   */
  public static getExecutionHistograms(tenantId: string): { name: string; latencyMs: number; success: boolean }[] {
    const instances = WorkflowEngineService.getInstances(tenantId);
    return instances.map(inst => ({
      name: inst.name.length > 20 ? inst.name.slice(0, 18) + '...' : inst.name,
      latencyMs: inst.completedAt ? inst.completedAt - inst.startedAt : 80,
      success: inst.status === 'completed'
    })).slice(0, 10).reverse(); // Return last 10 entries for Recharts compatibility
  }

  /**
   * Returns a breakdown of trigger categories inside rules
   */
  public static getTriggerCategorySpread(tenantId: string) {
    const rules = WorkflowEngineService.getRules(tenantId);
    const summary: Record<string, number> = {
      event: 0,
      threshold: 0,
      timer: 0,
      cron: 0
    };

    rules.forEach(rule => {
      const type = rule.trigger.type;
      if (type === 'event') summary.event++;
      else if (type === 'threshold') summary.threshold++;
      else if (type === 'timer') summary.timer++;
      else if (type === 'cron') summary.cron++;
    });

    return Object.entries(summary).map(([name, value]) => ({ name, value }));
  }
}
export default AutomationAnalyticsService;
