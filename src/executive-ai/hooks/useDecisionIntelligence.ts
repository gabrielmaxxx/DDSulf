/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { strategicReasoningService } from '../services/strategicReasoningService';
import { StrategicDecisionReasoning } from '../types';

export function useDecisionIntelligence() {
  const [scenarios, setScenarios] = useState<StrategicDecisionReasoning[]>(() =>
    [...strategicReasoningService.getScenarios()]
  );

  const registerScenario = useCallback((newScenario: Omit<StrategicDecisionReasoning, 'id'>) => {
    const created = strategicReasoningService.registerCustomScenario(newScenario);
    setScenarios([...strategicReasoningService.getScenarios()]);
    return created;
  }, []);

  return {
    scenarios,
    registerScenario
  };
}
