/**
 * Hook: useWorkflowTesting
 * Provides high-precision interface to simulate and test SaaS operational pipelines in realtime.
 */

import { useState } from 'react';
import { workflowTestingService, TestableWorkflow } from '@/services/qa/workflowTestingService';

export function useWorkflowTesting() {
  const [workflows, setWorkflows] = useState<TestableWorkflow[]>(() => workflowTestingService.getWorkflows());
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [runningStepIndex, setRunningStepIndex] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const executeSimulation = async (workflowId: string) => {
    setActiveWorkflowId(workflowId);
    setIsSimulating(true);

    const success = await workflowTestingService.executeWorkflowSimulation(
      workflowId,
      (idx, status) => {
        setRunningStepIndex(idx);
        // shallow-force rerender to push updates live to UI
        setWorkflows([...workflowTestingService.getWorkflows()]);
      }
    );

    setIsSimulating(false);
    setRunningStepIndex(null);
    return success;
  };

  return {
    workflows,
    activeWorkflowId,
    runningStepIndex,
    isSimulating,
    executeSimulation,
    resetWorkflows: () => setWorkflows([...workflowTestingService.getWorkflows()])
  };
}
