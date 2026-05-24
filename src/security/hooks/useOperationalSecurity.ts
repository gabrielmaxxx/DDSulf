/**
 * Hook: useOperationalSecurity
 * Inspects operational parameters, dangerous chemical applications, and logs failures.
 */

import { useAuditTrail } from './useAuditTrail';
import { validationService } from '../services/validationService';

export function useOperationalSecurity() {
  const { logEvent, logSecurityIncident } = useAuditTrail();

  /**
   * Safe validate chemical dosage and submit double checks if flagged
   */
  const auditChemicalUse = (chemical: string, qty: number) => {
    const result = validationService.validateChemicalUsage(chemical, qty);
    
    if (!result.isValid) {
      logSecurityIncident('chemical:validation_failed', result.reason || 'Dose de produto inválida', { chemical, qty });
      return result;
    }

    if (result.requiresDoubleCheck) {
      logEvent('chemical:volume_threshold_reached', 'inventory', chemical, { quantity: qty, alert: 'Requer liberação SecOps' });
    } else {
      logEvent('chemical:applied_successfully', 'inventory', chemical, { quantity: qty });
    }

    return result;
  };

  return {
    auditChemicalUse,
    verifyCertification: (tech: string, service: string) => validationService.hasActiveCertification(tech, service)
  };
}

export default useOperationalSecurity;
