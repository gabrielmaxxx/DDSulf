/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { operationalTestingService } from '../services/operationalTestingService';
import { SecurityAuditResult, AIConsistencyMetric } from '../types';

export function useOperationalTesting() {
  const [securityAudits, setSecurityAudits] = useState<SecurityAuditResult[]>(() =>
    operationalTestingService.getSecurityAudits()
  );
  const [aiMetrics, setAiMetrics] = useState<AIConsistencyMetric[]>(() =>
    operationalTestingService.getAIMetrics()
  );
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    const unsubscribe = operationalTestingService.subscribe(() => {
      setSecurityAudits([...operationalTestingService.getSecurityAudits()]);
      setAiMetrics([...operationalTestingService.getAIMetrics()]);
    });
    return () => unsubscribe();
  }, []);

  const runTenantAudit = useCallback(async () => {
    setIsAuditing(true);
    const result = await operationalTestingService.runTenantSegregationAudit();
    setIsAuditing(false);
    return result;
  }, []);

  const runAIValidation = useCallback(async (promptSignature: string) => {
    const fresh = await operationalTestingService.validateAICopilotInferences(promptSignature);
    return fresh;
  }, []);

  const resetAudits = useCallback(() => {
    operationalTestingService.clearSecurityAudits();
  }, []);

  return {
    securityAudits,
    aiMetrics,
    isAuditing,
    runTenantAudit,
    runAIValidation,
    resetAudits
  };
}
export default useOperationalTesting;
