/**
 * React Hook: useAutomationRules
 * Handles creation, modification, validation, and serialization of custom workflow rules.
 */

import { useCallback } from 'react';
import { useWorkflowEngine } from './useWorkflowEngine';
import { WorkflowRule, WorkflowTrigger, WorkflowAction } from '../types';
import { WorkflowEngineService } from '../engine/workflowEngine';

export function useAutomationRules(tenantId: string = 'tenant_ddsulf_enterprise') {
  const { rules, toggleRuleActive, deleteRule } = useWorkflowEngine(tenantId);

  /**
   * Adds or updates a custom operational workflow rule
   */
  const saveRuleComposition = useCallback((
    id: string | null,
    name: string,
    description: string,
    trigger: WorkflowTrigger,
    actions: WorkflowAction[],
    priority: number = 50,
    isOfflineCapable: boolean = true
  ) => {
    const isNew = !id;
    const ruleId = id || 'rule_' + Math.random().toString(36).substr(2, 9);

    const composedRule: WorkflowRule = {
      id: ruleId,
      name: name.trim() || 'Composição Sem Título',
      description: description.trim() || 'Sem descrição associada.',
      tenantId,
      trigger,
      actions,
      isActive: true,
      priority,
      isOfflineCapable,
      version: 1,
      createdAt: isNew ? Date.now() : Date.now() - 86400000, // keep past if editing
      updatedAt: Date.now()
    };

    WorkflowEngineService.addRule(composedRule);
  }, [tenantId]);

  return {
    rules,
    toggleRuleActive,
    deleteRule,
    saveRuleComposition
  };
}

export default useAutomationRules;
