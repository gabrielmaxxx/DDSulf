import { WorkflowSchedulingService } from '../scheduling/schedulingService';
import { WorkflowRule } from '../types';

export class SchedulingService {
  public static startScheduler(): void {
    WorkflowSchedulingService.init();
  }

  public static stopScheduler(): void {
    WorkflowSchedulingService.destroy();
  }

  public static schedule(rule: WorkflowRule): void {
    WorkflowSchedulingService.scheduleRule(rule);
  }

  public static unschedule(ruleId: string): void {
    WorkflowSchedulingService.unscheduleRule(ruleId);
  }

  public static getActiveSchedules(): any[] {
    return WorkflowSchedulingService.getTasks();
  }
}
export default SchedulingService;
