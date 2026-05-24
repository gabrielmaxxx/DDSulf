/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { enterpriseStandardsService, ComplianceGuideline } from '../services/enterpriseStandardsService';

export function useOperationalConsistency() {
  const [guidelines, setGuidelines] = useState<ComplianceGuideline[]>([]);

  const loadGuidelines = useCallback(() => {
    setGuidelines(enterpriseStandardsService.getGuidelines());
  }, []);

  useEffect(() => {
    loadGuidelines();
  }, [loadGuidelines]);

  const auditCSSClassSafety = useCallback((classes: string) => {
    return enterpriseStandardsService.evaluateClassSafety(classes);
  }, []);

  return {
    guidelines,
    auditCSSClassSafety,
    refreshConsistencyChecklist: loadGuidelines
  };
}
