/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { orchestrationService } from '../services/orchestrationService';
import { OrchestrationWorkflow } from '../types';

export function useWorkflowOrchestration() {
  const [workflows, setWorkflows] = useState<OrchestrationWorkflow[]>(() => oracleWorkflows());

  function oracleWorkflows(): OrchestrationWorkflow[] {
    return [...orchestrationService.getWorkflows()];
  }

  const refreshWorkflows = useCallback(() => {
    setWorkflows(oracleWorkflows());
  }, []);

  const resetWorkflows = useCallback(() => {
    orchestrationService.resetWorkflowStates();
    refreshWorkflows();
  }, [refreshWorkflows]);

  // Sync state periodically
  useEffect(() => {
    const t = setInterval(() => {
      refreshWorkflows();
    }, 1000);
    return () => clearInterval(t);
  }, [refreshWorkflows]);

  return {
    workflows,
    resetWorkflows,
    refreshWorkflows
  };
}
export default useWorkflowOrchestration;
