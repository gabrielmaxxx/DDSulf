/**
 * React Hook: useWorkflowEngine
 * Primary entry point for controlling rules, instances, metrics, and approvals in real time.
 */

import { useState, useEffect, useCallback } from 'react';
import { WorkflowEngineService } from '../engine/workflowEngine';
import { WorkflowEventBus } from '../events/eventBus';
import { WorkflowRule, WorkflowInstance, AutomationExecutionMetrics, ApprovalRequest } from '../types';

export function useWorkflowEngine(tenantId: string = 'tenant_ddsulf_enterprise') {
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [metrics, setMetrics] = useState<AutomationExecutionMetrics | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);

  // Reload lists from the core engine static state
  const loadState = useCallback(() => {
    setRules(WorkflowEngineService.getRules(tenantId));
    setInstances(WorkflowEngineService.getInstances(tenantId));
    setMetrics(WorkflowEngineService.getMetrics(tenantId));
    setApprovals(WorkflowEngineService.getApprovals(tenantId));
  }, [tenantId]);

  useEffect(() => {
    loadState();
    // Subscribe to engine storage mutation events for reactive UI rendering
    const unsubscribe = WorkflowEngineService.subscribe(() => {
      loadState();
    });
    return unsubscribe;
  }, [loadState]);

  /**
   * Dispatches a manual event trigger into the workflow pipeline
   */
  const triggerWorkflowManual = useCallback((eventKey: string, payload: Record<string, any>) => {
    // Process through global event bus to activate matching rules
    WorkflowEventBus.publish(eventKey, payload, tenantId, 'user_active_dashboard');
    WorkflowEngineService.handleEvent(eventKey, payload, tenantId);
  }, [tenantId]);

  /**
   * Resolves a supervisor gate approval request
   */
  const resolveApproval = useCallback(async (
    approvalId: string, 
    status: 'approved' | 'rejected', 
    comment: string = ''
  ) => {
    await WorkflowEngineService.resolveApproval(
      approvalId, 
      status, 
      'user_tech_dir_1', 
      'Diretoria Técnica DDSulf', 
      comment
    );
  }, []);

  /**
   * Extends active rules tree with safe deep cloned templates suggested by Gemini
   */
  const adoptSuggestedRule = useCallback((rule: Partial<WorkflowRule>) => {
    const fullRule: WorkflowRule = {
      id: rule.id || 'rule_adopted_' + Math.random().toString(36).substr(2, 9),
      name: rule.name || 'Nova Regra Adotada',
      description: rule.description || 'Regra automatizada sugerida por IA.',
      tenantId,
      trigger: rule.trigger || { id: 'tr_adopted', type: 'event', eventKey: 'event.custom' },
      actions: rule.actions || [],
      isActive: true,
      priority: rule.priority || 50,
      isOfflineCapable: rule.isOfflineCapable ?? true,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    WorkflowEngineService.addRule(fullRule);
  }, [tenantId]);

  /**
   * Toggles rule state key (Active/Inactive)
   */
  const toggleRuleActive = useCallback((ruleId: string) => {
    const allRules = WorkflowEngineService.getRules(tenantId);
    const updated = allRules.map(r => {
      if (r.id === ruleId) {
        return { ...r, isActive: !r.isActive, updatedAt: Date.now() };
      }
      return r;
    });
    WorkflowEngineService.saveRules(updated);
  }, [tenantId]);

  /**
   * Deletes a custom rule
   */
  const deleteRule = useCallback((ruleId: string) => {
    const allRules = WorkflowEngineService.getRules(tenantId);
    const updated = allRules.filter(r => r.id !== ruleId);
    WorkflowEngineService.saveRules(updated);
  }, [tenantId]);

  /**
   * Resets execution streams for test environments
   */
  const clearAllLogs = useCallback(() => {
    WorkflowEngineService.clearLogs(tenantId);
  }, [tenantId]);

  return {
    rules,
    instances,
    metrics,
    approvals,
    triggerWorkflowManual,
    resolveApproval,
    adoptSuggestedRule,
    toggleRuleActive,
    deleteRule,
    clearAllLogs,
    reloadState: loadState
  };
}

export default useWorkflowEngine;
