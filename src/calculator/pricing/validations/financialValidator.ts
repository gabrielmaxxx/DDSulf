import { FinancialAlert, DetailedOperationalCost, CompositePrice, MarginMatrix } from '../types';
import { PestType, EnvironmentType, OperationalComplexity } from '@/types/database';

/**
 * Executes a full operational and financial audit on the proposed service structure
 */
export function auditFinancialViability(
  inputs: {
    areaSize: number;
    pestType: PestType;
    environmentType: EnvironmentType;
    complexity: OperationalComplexity;
    displacementKm: number;
    techniciansCount: number;
  },
  costing: DetailedOperationalCost,
  pricing: CompositePrice,
  marginMatrix: MarginMatrix
): FinancialAlert[] {
  const alerts: FinancialAlert[] = [];

  const { areaSize, environmentType, complexity, displacementKm, techniciansCount } = inputs;

  // 1. Margin Deficit Validations
  if (pricing.actualMarginPercent < marginMatrix.minimumMarginPercent) {
    alerts.push({
      id: 'ERR_MARGIN_CRITICAL',
      type: 'error',
      code: 'FC001',
      title: 'Déficit de Lucratividade Crítico',
      message: `A margem calculada (${pricing.actualMarginPercent.toFixed(1)}%) está abaixo do piso recomendado para ${environmentType} (${marginMatrix.minimumMarginPercent}%).`,
      financialImpact: `Prejuízo de R$ ${(pricing.breakEvenPrice - pricing.suggestedPrice).toFixed(2)} acumulativo se executado nesta taxa.`,
      actionRequired: 'Ajuste a margem customizada do simulador para reestabelecer a saúde operacional.'
    });
  } else if (pricing.actualMarginPercent < marginMatrix.targetMarginPercent) {
    alerts.push({
      id: 'WARN_MARGIN_SUBOPTIMAL',
      type: 'warning',
      code: 'FC002',
      title: 'Margem de Venda Subótima',
      message: `A margem está acima do mínimo, porém residual ao alvo de ${marginMatrix.targetMarginPercent}% ideal para este perfil de risco.`,
      financialImpact: `Diferença de faturamento de R$ ${(pricing.breakEvenPrice / (1 - marginMatrix.targetMarginPercent / 100) - pricing.suggestedPrice).toFixed(2)} contra a meta Ideal.`,
      actionRequired: 'Avalie valor agregado intangível para reposicionar preco final.'
    });
  }

  // 2. Specialized Logistical / Fuel Overheads Audit
  const logisticsRatio = costing.logistics.totalLogisticsCost / costing.totalOperationCost;
  if (logisticsRatio > 0.40) {
    alerts.push({
      id: 'WARN_DISPLACEMENT_BURDEN',
      type: 'warning',
      code: 'OP001',
      title: 'Custos Logísticos Excessivos',
      message: `O deslocamento de ${displacementKm} Km consome ${Number(logisticsRatio * 100).toFixed(1)}% do total do custo de operação.`,
      financialImpact: `Impacto logístico de R$ ${costing.logistics.totalLogisticsCost.toFixed(2)} sobre o ticket de execução.`,
      actionRequired: 'Consolide rotas regionais ou aplique uma taxa extraordinária de deslocamento externo.'
    });
  }

  // 3. Labor Scarcity / Risk of Service Delays
  const sqMeterPerTechnician = areaSize / techniciansCount;
  if (sqMeterPerTechnician > 1000 && complexity === 'Complexo') {
    alerts.push({
      id: 'ERR_LABOR_UNDERSTAFFED',
      type: 'error',
      code: 'OP002',
      title: 'Dimensionamento de Equipe Insuficiente',
      message: `Alocação de apenas ${techniciansCount} técnicos para tratar ${areaSize}m² em complexidade de nível ${complexity} gera risco agudo de fadiga e perda de controle de qualidade.`,
      actionRequired: 'Adicione pelo menos mais 1 técnico auxiliar à escala na lateral.'
    });
  } else if (sqMeterPerTechnician > 1500) {
    alerts.push({
      id: 'WARN_LABOR_STRETCHED',
      type: 'warning',
      code: 'OP003',
      title: 'Equipe Limítrofe por Cobertura',
      message: `Área média de ${sqMeterPerTechnician.toFixed(0)}m² por técnico está próxima de exceder os limites padrão de eficácia para aplicação uniforme.`,
      actionRequired: 'Aumente o tempo operacional projetado ou revise o controle de insumos.'
    });
  }

  // 4. Chemical Cost Proportions (Indicator of dilution errors or incorrect pesticide selections)
  const chemicalRatio = costing.chemicalInsumos.totalChemicalCost / costing.totalOperationCost;
  if (chemicalRatio > 0.45) {
    alerts.push({
      id: 'WARN_CHEMICAL_OVERCONSUMPTION',
      type: 'warning',
      code: 'CH001',
      title: 'Consumo de Insumos Desproporcional',
      message: `Químicos representam ${Number(chemicalRatio * 100).toFixed(1)}% do custo operacional líquido.`,
      financialImpact: `Despesa de químicos: R$ ${costing.chemicalInsumos.totalChemicalCost.toFixed(2)}.`,
      actionRequired: 'Verifique se a dosagem escolhida ou diluição em calda para m² não está sobredimensionada.'
    });
  }

  // 5. Excellent Performance Flag
  if (pricing.actualMarginPercent >= marginMatrix.optimisticMarginPercent) {
    alerts.push({
      id: 'SUCCESS_ELITE_PRICING',
      type: 'success',
      code: 'FC003',
      title: 'Venda de Alto Rendimento (Elite)',
      message: `Este orçamento gera mais de ${marginMatrix.optimisticMarginPercent}% de margem, caracterizando uma negociação altamente vantajosa.`,
      financialImpact: `Lucro operacional líquido garantido de: R$ ${pricing.actualNetProfitAmount.toFixed(2)}`,
    });
  }

  return alerts;
}
