/**
 * Custom React Hook: useWorkflowExecution
 * Tracks a single workflow execution instance, ideal for detailed progress components.
 */

import { useState, useEffect } from 'react';
import { WorkflowInstance } from '../types';
import { WorkflowEngineService } from '../engine/workflowEngine';

export function useWorkflowExecution(instanceId: string | null) {
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);

  useEffect(() => {
    if (!instanceId) {
      setInstance(null);
      return;
    }

    const loadInstance = () => {
      const activeList = WorkflowEngineService.getInstances();
      const matched = activeList.find(i => i.id === instanceId);
      setInstance(matched || null);
    };

    loadInstance();
    const unsubscribe = WorkflowEngineService.subscribe(loadInstance);
    return () => unsubscribe();
  }, [instanceId]);

  return {
    instance,
    name: instance?.name || 'N/A',
    status: instance?.status || 'idle',
    startedAt: instance?.startedAt || 0,
    trail: instance?.executionTrail || [],
    stepIndex: instance?.currentStepIndex || 0,
    retryCount: instance?.retryCount || 0
  };
}

export default useWorkflowExecution;
