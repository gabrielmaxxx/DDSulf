/**
 * Hook: useComplianceMonitoring
 * Monitores LGPD consent agreements, active tenant tickets and open security threats.
 */

import { useState, useEffect } from 'react';
import { useTenant } from '@/organization';
import { useAuth } from '@/contexts/AuthContext';
import { complianceService } from '../services/complianceService';
import { ThreatIncident, ComplianceConsent } from '../types';

export function useComplianceMonitoring() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<ThreatIncident[]>([]);

  const reloadIncidents = () => {
    if (tenant) {
      setIncidents(complianceService.getSecurityIncidents(tenant.id));
    }
  };

  useEffect(() => {
    reloadIncidents();
    const interval = setInterval(() => {
      reloadIncidents();
    }, 5000);
    return () => clearInterval(interval);
  }, [tenant]);

  /**
   * Safe registry of standard corporate consent
   */
  const grantConsent = (type: ComplianceConsent['consentType'], accepted: boolean) => {
    if (!user || !tenant) return;

    complianceService.registerConsent({
      userId: user.uid || 'user_demo',
      tenantId: tenant.id,
      consentType: type,
      accepted,
      ipAddress: '177.105.12.84'
    });
  };

  /**
   * Safe escalations of suspicious behaviors or cyber threats
   */
  const fileIncident = (title: string, desc: string, severity: ThreatIncident['severity']) => {
    if (!tenant) return;
    complianceService.escalateIncident({
      tenantId: tenant.id,
      title,
      description: desc,
      severity
    });
    reloadIncidents();
  };

  /**
   * Closes a ticket
   */
  const closeIncidentTicket = (id: string, notes: string) => {
    complianceService.resolveIncident(id, notes);
    reloadIncidents();
  };

  return {
    incidents,
    hasConsented: (type: ComplianceConsent['consentType']) => {
      if (!user) return true;
      return complianceService.hasConsentedTo(user.uid || 'user_demo', type);
    },
    grantConsent,
    escalateSafetyIncident: fileIncident,
    resolveIncident: closeIncidentTicket,
    openThreatsCount: incidents.filter(i => !i.resolved).length
  };
}

export default useComplianceMonitoring;
