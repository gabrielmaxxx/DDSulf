import { WorkflowEngineService } from '../engine/workflowEngine';
import { WorkflowInstance, WorkflowRule } from '../types';

export class OrchestrationService {
  /**
   * Evaluates and boots custom transactional workflow runs
   */
  public static triggerProcess(eventKey: string, payload: Record<string, any>, tenantId: string): void {
    WorkflowEngineService.handleEvent(eventKey, payload, tenantId);
  }

  /**
   * Returns current active instances list
   */
  public static getRunningOrchestrations(tenantId: string): WorkflowInstance[] {
    return WorkflowEngineService.getInstances(tenantId).filter(
      inst => inst.status === 'running' || inst.status === 'paused' || inst.status === 'retrying' || inst.status === 'approval_pending'
    );
  }

  /**
   * Force dynamic compensation / run rollback action for custom recovery tasks
   */
  public static async abortAndRollback(instanceId: string, tenantId: string): Promise<void> {
    const instances = WorkflowEngineService.getInstances(tenantId);
    const inst = instances.find(i => i.id === instanceId);
    if (!inst) return;

    inst.status = 'failed';
    inst.executionTrail.push('Sessão abortada manualmente pelo administrador. Iniciando reversões de segurança.');
    
    // Simulate reverse compensation trigger
    const rules = WorkflowEngineService.getRules(tenantId);
    const rule = rules.find(r => r.id === inst.ruleId);
    if (rule) {
      for (let i = inst.currentStepIndex; i >= 0; i--) {
        const act = rule.actions[i];
        const step = inst.steps[i];
        if (step.status === 'completed' && act.compensateActionId) {
          inst.executionTrail.push(`Abort/Rollback Compensador Passo ${i + 1}: ${act.compensateActionId}`);
          step.status = 'rolled_back';
        }
      }
    }
    
    inst.completedAt = Date.now();
    WorkflowEngineService.saveRules([]); // Forces a flush on the subscriber chain logs
  }
}
export default OrchestrationService;
