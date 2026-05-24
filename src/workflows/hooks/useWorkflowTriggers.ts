/**
 * React Hook: useWorkflowTriggers
 * Manages operational event mapping, trigger keys, and active scheduler streams for administrative triggers.
 */

import { useState, useEffect, useCallback } from 'react';
import { useWorkflowEngine } from './useWorkflowEngine';
import { WorkflowSchedulingService, ScheduledTask } from '../scheduling/schedulingService';

export interface SystemEventTriggerDescription {
  key: string;
  name: string;
  category: 'operations' | 'financial' | 'inventory' | 'customer';
  description: string;
  testPayload: Record<string, any>;
}

export function useWorkflowTriggers(tenantId: string = 'tenant_ddsulf_enterprise') {
  const { triggerWorkflowManual } = useWorkflowEngine(tenantId);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);

  const loadScheduledTasks = useCallback(() => {
    setScheduledTasks(
      WorkflowSchedulingService.getTasks().filter(t => t.tenantId === tenantId)
    );
  }, [tenantId]);

  useEffect(() => {
    loadScheduledTasks();
    const interval = setInterval(loadScheduledTasks, 10000); // Poll scheduler tasks
    return () => clearInterval(interval);
  }, [loadScheduledTasks]);

  /**
   * Complete portfolio of standard operational DDSulf trigger keys
   */
  const systemTriggers: SystemEventTriggerDescription[] = [
    {
      key: 'event.operations.report_submitted',
      name: 'Relatório Sanitário de Campo de Técnico',
      category: 'operations',
      description: 'Disparado automaticamente toda vez que um POP de dedetização é concluído.',
      testPayload: {
        pestType: 'Cupins de Solo',
        chemicalVolumeUsedStr: '12 Litros calda fipronil 2%',
        completedAt: new Date().toLocaleDateString(),
        technicianName: 'Mateus Schimdt'
      }
    },
    {
      key: 'event.operations.inventory_starved',
      name: 'Escassez Crítica de Saneantes e Caldas',
      category: 'inventory',
      description: 'Gatilho ativado se níveis de glifosato ou praguicidas caírem abaixo das margens normativas.',
      testPayload: {
        itemId: 'ins_fipronil_sc',
        itemName: 'Fipronil SC Concentrado Premium',
        currentVolume: 8,
        minRequired: 25
      }
    },
    {
      key: 'event.operations.route_deviation',
      name: 'Desvio Crítico de Rota ou Alerta de OS',
      category: 'operations',
      description: 'Gatilho para detecção de problemas mecânicos em trânsito de caldas.',
      testPayload: {
        vehicleId: 'veh_sprinter_12',
        driverName: 'Claudio Barbosa',
        reasonDetails: 'Alinhador com pane mecânica na BR116 KM42'
      }
    },
    {
      key: 'customer.certification.expiring',
      name: 'Aviso de Vencimento de POP e Certificados',
      category: 'customer',
      description: 'Garante renovações operacionais de controle de pragas sob resoluções da ANVISA.',
      testPayload: {
        customerId: 'cli_hospital_sul',
        customerName: 'Hospital Metropolitano do Sul',
        certificateId: 'cert_84920_anvisa',
        expiryDays: 14
      }
    }
  ];

  const triggerEvent = useCallback((key: string, customPayload?: Record<string, any>) => {
    const defaultPayload = systemTriggers.find(t => t.key === key)?.testPayload || {};
    triggerWorkflowManual(key, customPayload || defaultPayload);
  }, [triggerWorkflowManual]);

  return {
    systemTriggers,
    scheduledTasks,
    triggerEvent,
    reloadScheduledTasks: loadScheduledTasks
  };
}

export default useWorkflowTriggers;
