import { CostAnomalyAlert, OperationalCostBreakdown, ProfitabilityMetrics } from '../types';

/**
 * Audits a completed services budget or draft spreadsheet to warn administrators about potential operational deficits
 */
export function auditOperationalFinances(
  costBreakdown: OperationalCostBreakdown,
  profitMetrics: ProfitabilityMetrics,
  inputs: {
    areaSize: number;
    techniciansCount: number;
    pestType: string;
    environmentType: string;
  }
): CostAnomalyAlert[] {
  const alerts: CostAnomalyAlert[] = [];

  // 1. Margin Deficits Warnings
  if (profitMetrics.riskCoefficient === 'CRÍTICO') {
    alerts.push({
      id: 'an_001',
      code: 'FC_DEFICIT_A',
      title: 'Déficit Crítico de Lucratividade',
      type: 'error',
      message: `A margem líquida calculada (${profitMetrics.netMarginPercent}%) está abaixo do limite aceitável. Esse contrato é economicamente inviável.`,
      financialImpact: `Impacto negativo estimado de R$ ${(profitMetrics.breakEvenPrice - profitMetrics.sellingPrice).toFixed(2)} por execução.`,
      actionRequired: 'Ajuste a margem ou diminua a quilometragem logística para recompor o preço.',
      metricReference: `${profitMetrics.netMarginPercent}%`
    });
  } else if (profitMetrics.riskCoefficient === 'ALERTA_BAIXO') {
    alerts.push({
      id: 'an_002',
      code: 'FC_DEFICIT_B',
      title: 'Margem Subótima Identificada',
      type: 'warning',
      message: `O retorno líquido de ${profitMetrics.netMarginPercent}% está acima do prejuízo, mas não atinge a meta estipulada para o perfil operacional do cliente.`,
      financialImpact: `Faturamento residual de R$ ${profitMetrics.profitAmount.toFixed(2)}.`,
      actionRequired: 'Avalie acrescer taxa extra de atendimento emergencial ou emergência biológica.',
      metricReference: `${profitMetrics.netMarginPercent}%`
    });
  }

  // 2. High logistics overhead ratios
  const logisticsRatio = costBreakdown.logistics.totalLogisticsCost / costBreakdown.totalOperationalCost;
  if (logisticsRatio > 0.35) {
    alerts.push({
      id: 'an_003',
      code: 'FC_LOG_BURDEN',
      title: 'Custo Logístico Desproporcional',
      type: 'warning',
      message: `A distância logística consome ${Math.round(logisticsRatio * 100)}% de todo o custo de faturamento operacional.`,
      financialImpact: `Logística custando R$ ${costBreakdown.logistics.totalLogisticsCost.toFixed(2)} no orçamento final.`,
      actionRequired: 'Recomenda-se centralizar o agendamento regional do veículo ou acrescer taxa por Km sênior.',
      metricReference: `${Math.round(logisticsRatio * 100)}%`
    });
  }

  // 3. Stretched personnel coverage
  const coverageRate = inputs.areaSize / inputs.techniciansCount;
  if (coverageRate > 1500) {
    alerts.push({
      id: 'an_004',
      code: 'OP_STAFF_STRETCHED',
      title: 'Escala de Campo Limítrofe',
      type: 'warning',
      message: `Técnicos sobrecarregados: média superior a ${Math.round(coverageRate)} m² por técnico no local.`,
      financialImpact: 'Possível desperdício de defensivos químicos por aplicação apressada.',
      actionRequired: 'Avalie escalar mais um assistente ou alongar o tempo padrão de dedicação na rota.',
      metricReference: `${Math.round(coverageRate)}m²/técnico`
    });
  }

  // 4. Heavy chemical product costs
  const chemicalRatio = costBreakdown.chemicalProducts.totalCost / costBreakdown.subtotalDirectCost;
  if (chemicalRatio > 0.50 && costBreakdown.chemicalProducts.totalCost > 150) {
    alerts.push({
      id: 'an_005',
      code: 'CH_CONSUMPTION_A',
      title: 'Proporção de Insumos Elevada',
      type: 'warning',
      message: `Gastos de produto representam ${Math.round(chemicalRatio * 100)}% dos custos diretos de atendimento.`,
      financialImpact: `Insumos custando R$ ${costBreakdown.chemicalProducts.totalCost.toFixed(2)}.`,
      actionRequired: 'Identifique se a dosagem de calda para cupins/ratos ou m² de aplicação não está sobredimensionada.',
      metricReference: `${Math.round(chemicalRatio * 100)}%`
    });
  }

  return alerts;
}
