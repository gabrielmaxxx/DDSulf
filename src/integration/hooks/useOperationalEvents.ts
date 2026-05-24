/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useCallback } from 'react';
import { eventBusService } from '../services/eventBusService';
import { OperationalEvent, OperationalEventType, SystemModuleName } from '../types';

export function useOperationalEvents(targetEvent?: OperationalEventType) {
  const [lastReceivedEvent, setLastReceivedEvent] = useState<OperationalEvent | null>(null);

  useEffect(() => {
    if (!targetEvent) return;

    const unsubscribe = eventBusService.subscribe(targetEvent, (event) => {
      setLastReceivedEvent(event);
    });

    return () => {
      unsubscribe();
    };
  }, [targetEvent]);

  const generateMockWorkflowTrigger = useCallback(async (type: 'calculator' | 'stock' | 'pops' | 'ai') => {
    const cid = `corr_trigger_${Math.random().toString(36).substring(4)}`;
    
    if (type === 'calculator') {
      await eventBusService.publish(
        OperationalEventType.PESTICIDE_CALCULATED,
        { item: 'Piretróide 2.4SL', targetHectares: 250, computedVolumeLiters: 1120.5 },
        SystemModuleName.CALCULATOR,
        cid
      );
    } else if (type === 'pops') {
      await eventBusService.publish(
        OperationalEventType.POP_SAVED_ANVISA,
        { operatorCpf: '01*.***.***-98', locationZip: '96010-000', reportId: 'POP-ANS-2026-X9' },
        SystemModuleName.POPS,
        cid
      );
    } else if (type === 'stock') {
      await eventBusService.publish(
        OperationalEventType.STOCK_LOW,
        { item: 'Organofosforado 500S', unitsRemaining: 15, triggerThreshold: 40 },
        SystemModuleName.STOCK,
        cid
      );
    } else if (type === 'ai') {
      await eventBusService.publish(
        OperationalEventType.AI_ANOMALY_DETECTED,
        { description: 'Pico de aspersão estocástica acima da curva de faturamento do trimestre', confidenceScore: 0.94 },
        SystemModuleName.AI,
        cid
      );
    }
  }, []);

  return {
    lastReceivedEvent,
    generateMockWorkflowTrigger
  };
}
export default useOperationalEvents;
