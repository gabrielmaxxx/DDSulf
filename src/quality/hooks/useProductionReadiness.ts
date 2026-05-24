/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { productionReadinessService, ReadinessGate } from '../services/productionReadinessService';

export function useProductionReadiness() {
  const [gates, setGates] = useState<ReadinessGate[]>(() => productionReadinessService.getGates());
  const [certification, setCertification] = useState(() =>
    productionReadinessService.evaluateReleaseCertification()
  );

  useEffect(() => {
    const unsubscribe = productionReadinessService.subscribe(() => {
      setGates([...productionReadinessService.getGates()]);
      setCertification(productionReadinessService.evaluateReleaseCertification());
    });
    return () => unsubscribe();
  }, []);

  const toggleGateStatus = useCallback((id: string) => {
    productionReadinessService.toggleGate(id);
  }, []);

  const triggerFormalCertification = useCallback(async () => {
    // Simulates validating compiling package size, and final release signing
    await new Promise(resolve => setTimeout(resolve, 2000));
    const result = productionReadinessService.evaluateReleaseCertification();
    return result;
  }, []);

  const resetAllGates = useCallback(() => {
    productionReadinessService.resetReadiness();
  }, []);

  return {
    gates,
    certification,
    toggleGateStatus,
    triggerFormalCertification,
    resetAllGates
  };
}
export default useProductionReadiness;
