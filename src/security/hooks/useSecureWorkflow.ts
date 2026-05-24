/**
 * Hook: useSecureWorkflow
 * Safely executes sensitive workflows inside complete transactional auth evaluations and forensic audit streams.
 */

import { useAuthorization } from './useAuthorization';
import { useAuditTrail } from './useAuditTrail';
import { Permission } from '@/organization/types';

export function useSecureWorkflow() {
  const { hasPermission } = useAuthorization();
  const { logEvent, logSecurityIncident } = useAuditTrail();

  /**
   * Executes a sensitive business flow behind standard RBAC protection
   */
  const runWorkflow = async <T>(params: {
    permissionRequired: Permission;
    workflowName: string;
    resourceType: 'auth' | 'financial' | 'inventory' | 'schedule' | 'ai' | 'tenant' | 'compliance';
    resourceId?: string;
    payload?: Record<string, any>;
    execute: () => Promise<T>;
  }): Promise<{ success: boolean; data?: T; error?: string }> => {
    
    // Check permission
    if (!hasPermission(params.permissionRequired)) {
      logSecurityIncident(
        `workflow:unauthorized_attempt:${params.workflowName}`,
        `Permissão "${params.permissionRequired}" ausente para executar a ação comercial crítica.`,
        params.payload
      );
      
      return {
        success: false,
        error: `Acesso negado. Requer permissão "${params.permissionRequired}" para executar este fluxo operacional.`
      };
    }

    try {
      const data = await params.execute();
      
      logEvent(
        `workflow:success:${params.workflowName}`,
        params.resourceType,
        params.resourceId,
        params.payload
      );

      return { success: true, data };
    } catch (err: any) {
      logSecurityIncident(
        `workflow:runtime_error:${params.workflowName}`,
        err.message || 'Erro inesperado de execução no banco de dados',
        { ...params.payload, error: err.message }
      );

      return {
        success: false,
        error: err.message || 'Falha ao processar o fluxo transacional.'
      };
    }
  };

  return {
    runWorkflow
  };
}

export default useSecureWorkflow;
