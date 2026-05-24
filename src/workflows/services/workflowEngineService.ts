import { WorkflowEngineService } from '../engine/workflowEngine';

export const workflowEngineService = {
  getRules: (tenantId: string) => WorkflowEngineService.getRules(tenantId),
  saveRules: (rules: any[]) => WorkflowEngineService.saveRules(rules),
  getInstances: (tenantId: string) => WorkflowEngineService.getInstances(tenantId),
  handleEvent: (eventKey: string, payload: any, tenantId: string) => 
    WorkflowEngineService.handleEvent(eventKey, payload, tenantId),
  executeInstance: (instanceId: string, tenantId: string) => 
    WorkflowEngineService.executeInstance(instanceId, tenantId),
  resolveApproval: (approvalId: string, status: 'approved' | 'rejected', approverId: string, approverName: string, comment: string) =>
    WorkflowEngineService.resolveApproval(approvalId, status, approverId, approverName, comment),
  clearLogs: (tenantId: string) => WorkflowEngineService.clearLogs(tenantId),
};

export default workflowEngineService;
