/**
 * Hook: useAuditTrail
 * Interface for reading and registering cryptographic-grade audit logs with automatic contextual parsing.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/organization';
import { auditService } from '../services/auditService';
import { AuditLogEntry } from '../types';

export function useAuditTrail() {
  const { user, role } = useAuth();
  const { tenant } = useTenant();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  const reloadTrail = () => {
    if (tenant) {
      setLogs(auditService.getTenantAuditTrail(tenant.id));
    }
  };

  useEffect(() => {
    reloadTrail();
    
    // Setup interval to simulate real-time enterprise log streaming
    const interval = setInterval(() => {
      reloadTrail();
    }, 4000);

    return () => clearInterval(interval);
  }, [tenant]);

  /**
   * Safe contextual audit logging method
   */
  const logEvent = (action: string, resourceType: AuditLogEntry['resourceType'], resourceId?: string, payload?: Record<string, any>) => {
    if (!tenant) return;

    auditService.log({
      tenantId: tenant.id,
      userId: user?.name || 'anonymous_user',
      userName: user?.name || user?.email || 'Desconhecido',
      userRole: (user?.role || role || 'operator') as any,
      action,
      resourceType,
      resourceId,
      status: 'success',
      payload
    });

    reloadTrail();
  };

  /**
   * Suspicious or failed logins logging
   */
  const logSecurityIncident = (action: string, reason: string, payload?: Record<string, any>) => {
    if (!tenant) return;

    auditService.log({
      tenantId: tenant.id,
      userId: user?.name || 'anonymous_user',
      userName: user?.name || user?.email || 'Desconhecido',
      userRole: (user?.role || role || 'operator') as any,
      action,
      resourceType: 'auth',
      status: 'suspicious',
      payload: { ...payload, reason }
    });

    reloadTrail();
  };

  return {
    logs,
    logEvent,
    logSecurityIncident,
    refreshTrail: reloadTrail
  };
}

export default useAuditTrail;
