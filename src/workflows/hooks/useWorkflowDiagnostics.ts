/**
 * React Hook: useWorkflowDiagnostics
 * Traces steps, logs, and timelines of individual workflow instance executions for diagnostic insights.
 */

import { useState, useEffect } from 'react';
import { useWorkflowEngine } from './useWorkflowEngine';
import { WorkflowInstance } from '../types';

export function useWorkflowDiagnostics(instanceId: string | null) {
  const { instances } = useWorkflowEngine();
  const [activeInstance, setActiveInstance] = useState<WorkflowInstance | null>(null);

  useEffect(() => {
    if (!instanceId) {
      setActiveInstance(null);
      return;
    }
    const match = instances.find(i => i.id === instanceId);
    if (match) {
      setActiveInstance(match);
    }
  }, [instanceId, instances]);

  const latencyMs = activeInstance?.completedAt 
    ? activeInstance.completedAt - activeInstance.startedAt 
    : activeInstance?.startedAt 
      ? Date.now() - activeInstance.startedAt 
      : 0;

  return {
    instance: activeInstance,
    steps: activeInstance?.steps || [],
    trail: activeInstance?.executionTrail || [],
    retryCount: activeInstance?.retryCount || 0,
    latencyMs,
    isCompleted: activeInstance?.status === 'completed',
    isFailed: activeInstance?.status === 'failed',
    isRunning: activeInstance?.status === 'running' || activeInstance?.status === 'retrying',
    isApprovalPending: activeInstance?.status === 'approval_pending'
  };
}

export default useWorkflowDiagnostics;
