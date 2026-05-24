/**
 * Custom React Hook: useAutomation
 * Handles setting up dynamic triggers, active rules templates, and programmatic evaluations.
 */

import { useWorkflowEngine } from './useWorkflowEngine';
import { WorkflowRule } from '../types';

export function useAutomation() {
  const { rules, toggleRule, triggerWorkflowManual, metrics } = useWorkflowEngine();

  const enableAllRules = () => {
    const updated = rules.map(r => ({ ...r, isActive: true }));
    // Access singleton method directly to bypass state sync cycle
    import('../engine/workflowEngine').then(m => {
      m.WorkflowEngineService.saveRules(updated);
    });
  };

  const disableAllRules = () => {
    const updated = rules.map(r => ({ ...r, isActive: false }));
    import('../engine/workflowEngine').then(m => {
      m.WorkflowEngineService.saveRules(updated);
    });
  };

  return {
    rules,
    metrics,
    toggleRule,
    triggerWorkflowManual,
    enableAllRules,
    disableAllRules
  };
}

export default useAutomation;
