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
  const [loading, setLoading] = useState(false);

  const reloadTrail = async () => {
    if (tenant) {
      setLoading(true);
      try {
        const result = await auditService.getTenantAuditTrail(tenant.id);
        setLogs(result);
      } catch (err) {
        console.error('Error reloading audit trail:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    reloadTrail();
    
    // Setup interval to simulate real-time enterprise log streaming
    const interval = setInterval(() => {
      reloadTrail();
    }, 8000); // 8 seconds interval to keep it performant with Firestore

    return () => clearInterval(interval);
  }, [tenant]);

  /**
   * Safe contextual audit logging method
   */
  const logEvent = async (action: string, resourceType: AuditLogEntry['resourceType'], resourceId?: string, payload?: Record<string, any>) => {
    if (!tenant) return;

    await auditService.log({
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

    await reloadTrail();
  };

  /**
   * Suspicious or failed logins logging
   */
  const logSecurityIncident = async (action: string, reason: string, payload?: Record<string, any>) => {
    if (!tenant) return;

    await auditService.log({
      tenantId: tenant.id,
      userId: user?.name || 'anonymous_user',
      userName: user?.name || user?.email || 'Desconhecido',
      userRole: (user?.role || role || 'operator') as any,
      action,
      resourceType: 'auth',
      status: 'suspicious',
      payload: { ...payload, reason }
    });

    await reloadTrail();
  };

  return {
    logs,
    loading,
    logEvent,
    logSecurityIncident,
    refreshTrail: reloadTrail
  };
}

export default useAuditTrail;
