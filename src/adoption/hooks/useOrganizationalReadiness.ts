/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { transformationIntelligenceService } from '../services/transformationIntelligenceService';
import { OrganizationalReadiness } from '../types';

export function useOrganizationalReadiness() {
  const [readiness, setReadiness] = useState<OrganizationalReadiness>(() => 
    transformationIntelligenceService.getReadiness()
  );

  const refreshReadiness = useCallback(() => {
    setReadiness({ ...transformationIntelligenceService.getReadiness() });
  }, []);

  const changeResistance = useCallback((diff: number) => {
    transformationIntelligenceService.updateResistance(diff);
    refreshReadiness();
  }, [refreshReadiness]);

  const setTrainedRatio = useCallback((ratio: number) => {
    transformationIntelligenceService.updateStaffTrained(ratio);
    refreshReadiness();
  }, [refreshReadiness]);

  return {
    readiness,
    changeResistance,
    setTrainedRatio
  };
}
export default useOrganizationalReadiness;
