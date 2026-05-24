/**
 * React state hook syncing multi-step workflow states directly with persistent draft storages
 */

import { useState, useEffect } from 'react';
import { DraftsService } from '../drafts';

export interface WorkflowOptions<T> {
  workflowId: string;
  initialStep: string;
  initialData: T;
}

export function useOfflineWorkflow<T>(options: WorkflowOptions<T>) {
  const { workflowId, initialStep, initialData } = options;

  const [currentStep, setCurrentStep] = useState<string>(initialStep);
  const [data, setData] = useState<T>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate draft from DB upon mounting
  useEffect(() => {
    const hydrateModel = async () => {
      try {
        const draft = await DraftsService.get<T>(workflowId);
        if (draft) {
          setCurrentStep(draft.stepKey);
          setData(draft.payload);
        }
      } catch (err) {
        console.warn(`[Offline Workflow] Failed to hydrate draft for workflow: ${workflowId}`, err);
      } finally {
        setIsLoaded(true);
      }
    };
    hydrateModel();
  }, [workflowId]);

  // Persistent updates on adjustments
  const updateWorkflow = async (nextStep: string, nextData: T) => {
    setCurrentStep(nextStep);
    setData(nextData);
    await DraftsService.save(workflowId, nextStep, nextData);
  };

  const completeWorkflow = async () => {
    await DraftsService.clear(workflowId);
    // Reset back to initial positions
    setCurrentStep(initialStep);
    setData(initialData);
  };

  return {
    currentStep,
    data,
    isLoaded,
    updateWorkflow,
    completeWorkflow,
    setCurrentStepOnly: async (step: string) => updateWorkflow(step, data),
    setDataOnly: async (payload: T) => updateWorkflow(currentStep, payload)
  };
}

export default useOfflineWorkflow;
