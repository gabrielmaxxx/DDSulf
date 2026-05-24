/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { useBusinessContext } from './useBusinessContext';
import { useExecutiveRecommendations } from './useExecutiveRecommendations';

export function useStrategicInsights() {
  const { snapshot } = useBusinessContext();
  const { recommendations } = useExecutiveRecommendations();

  const alerts = useMemo(() => {
    const activeAlerts: string[] = [];

    if (snapshot.monthlySafetyIndexPercent < 99) {
      activeAlerts.push('Segurança Regulatória Geral abaixo de 99%. Risco elevado de inconsistência estequiométrica em silos alimentares.');
    }

    const pendingHighCount = recommendations.filter(
      r => r.severity === 'high' && r.status === 'pending_supervision'
    ).length;

    if (pendingHighCount > 0) {
      activeAlerts.push(`Supervisão Executiva Necessária: Existe ${pendingHighCount} tomada de decisão de Alta Criticidade travada em estágio consultivo.`);
    }

    if (snapshot.contingentAssetsReservedBrl < 500000) {
      activeAlerts.push('Reserva estatutária inferior a R$ 500.000,00. Planejar redirecionamento parcial do MRR líquido.');
    }

    return activeAlerts;
  }, [snapshot, recommendations]);

  return {
    alerts,
    mrr: snapshot.mrrTotal,
    safetyIndex: snapshot.monthlySafetyIndexPercent,
    contingentAssets: snapshot.contingentAssetsReservedBrl,
    efficiency: snapshot.operationalEfficiencyCoefficient
  };
}
