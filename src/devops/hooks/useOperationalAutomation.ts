/**
 * Hook to manage operational automations, event-driven action triggers, and security log monitoring.
 */

import { useState, useEffect } from 'react';
import { operationalAutomationService, AutomatedTrigger } from '../services/operationalAutomationService';
import { SecurityAuditRecord } from '../types';

export function useOperationalAutomation() {
  const [triggers, setTriggers] = useState<AutomatedTrigger[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditRecord[]>([]);

  const loadData = () => {
    setTriggers(operationalAutomationService.getTriggers());
    setSecurityLogs(operationalAutomationService.getSecurityLogs());
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleAutomationTrigger = (id: string) => {
    operationalAutomationService.toggleTrigger(id);
    loadData();
  };

  const executeTriggerWorkflowManually = (id: string) => {
    const res = operationalAutomationService.triggerManualWorkflowAction(id);
    loadData();
    return res;
  };

  const dispatchCustomSecurityLog = (
    module: string,
    action: string,
    actor: string,
    details: string,
    status: SecurityAuditRecord['status'] = 'allowed'
  ) => {
    operationalAutomationService.recordSecurityEvent(
      module,
      action,
      actor,
      '127.0.0.1 (local_instance)',
      status,
      details
    );
    loadData();
  };

  return {
    triggers,
    securityLogs,
    toggleAutomationTrigger,
    executeTriggerWorkflowManually,
    dispatchCustomSecurityLog,
    refreshAutomation: loadData
  };
}
