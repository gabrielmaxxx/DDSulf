/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { governanceService } from '../services/governanceService';
import { SecurityPolicyRule } from '../types';

export function useEnterprisePolicies() {
  const [securityRules, setSecurityRules] = useState<SecurityPolicyRule[]>([]);

  const loadRules = useCallback(() => {
    setSecurityRules(governanceService.getSecurityRules());
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const toggleEnforcement = useCallback((id: string) => {
    governanceService.toggleRuleEnforcements(id);
    loadRules();
  }, [loadRules]);

  return {
    securityRules,
    toggleEnforcement,
    refreshPolicies: loadRules
  };
}
