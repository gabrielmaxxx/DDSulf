/**
 * Custom React Hook: useWorkflowEngine
 * Coordinates executing workflow list nodes, state tracking, rules configurations, and diagnostic trails.
 */

import { useState, useEffect } from 'react';
import { WorkflowRule, WorkflowInstance } from '../types';
import { WorkflowEngineService } from '../engine/workflowEngine';

export function useWorkflowEngine() {
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // Fill initial inputs
    setRules(WorkflowEngineService.getRules());
    setInstances(WorkflowEngineService.getInstances());
    setMetrics(WorkflowEngineService.getMetrics());

    // Connect to engine state trigger notifications
    const unsubscribe = WorkflowEngineService.subscribe(() => {
      setRules(WorkflowEngineService.getRules());
      setInstances(WorkflowEngineService.getInstances());
      setMetrics(WorkflowEngineService.getMetrics());
    });

    return () => unsubscribe();
  }, []);

  const toggleRule = (ruleId: string) => {
    const nextRules = rules.map(rule => {
      if (rule.id === ruleId) {
        return { ...rule, isActive: !rule.isActive };
      }
      return rule;
    });
    setRules(nextRules);
    WorkflowEngineService.saveRules(nextRules);
  };

  const triggerWorkflowManual = (expressionKey: string, payload: Record<string, any>) => {
    WorkflowEngineService.handleEvent(expressionKey, payload);
  };

  const clearHistory = () => {
    WorkflowEngineService.clearInstanceLogs();
  };

  return {
    rules,
    instances,
    metrics,
    toggleRule,
    triggerWorkflowManual,
    clearHistory,
    activeInstancesCount: instances.filter(i => i.status === 'running' || i.status === 'retrying').length,
    completedCount: instances.filter(i => i.status === 'completed').length,
    failedCount: instances.filter(i => i.status === 'failed').length
  };
}

export default useWorkflowEngine;
