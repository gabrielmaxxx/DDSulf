/**
 * Custom React Hook: useAutomationRules
 * Handles creating, updating, and removing rule declarations in rules templates registries.
 */

import { useState, useEffect } from 'react';
import { WorkflowRule, WorkflowTrigger, WorkflowAction } from '../types';
import { WorkflowEngineService } from '../engine/workflowEngine';

export function useAutomationRules() {
  const [rules, setRules] = useState<WorkflowRule[]>([]);

  useEffect(() => {
    setRules(WorkflowEngineService.getRules());
    const unsubscribe = WorkflowEngineService.subscribe(() => {
      setRules(WorkflowEngineService.getRules());
    });
    return () => unsubscribe();
  }, []);

  const addRule = (name: string, trigger: WorkflowTrigger, actions: WorkflowAction[], priority: number = 50) => {
    const newRule: WorkflowRule = {
      id: 'rule_' + Math.random().toString(36).substr(2, 9),
      name,
      trigger,
      actions,
      isActive: true,
      priority
    };

    const updated = [...rules, newRule].sort((a, b) => b.priority - a.priority);
    WorkflowEngineService.saveRules(updated);
  };

  const removeRule = (ruleId: string) => {
    const updated = rules.filter(r => r.id !== ruleId);
    WorkflowEngineService.saveRules(updated);
  };

  return {
    rules,
    addRule,
    removeRule
  };
}

export default useAutomationRules;
