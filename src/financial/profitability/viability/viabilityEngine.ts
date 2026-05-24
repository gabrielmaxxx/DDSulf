import { OperationalViabilityReport, RiskAnalysisSnapshot } from '../types';

/**
 * Investigates a trade proposal and tags operational bottlenecks
 *
 * @param netMarginPercent Calculated real net margin
 * @param totalProductCost Cost of pesticide chemical formulations
 * @param logisticsCost Fleet fuel and depreciation
 * @param laborCost Field technician wages
 * @param indirectOverhead General overhead rateio absorption
 * @param targetPrice Total selling price proposed
 */
export function evaluateOperationalViability(inputs: {
  netMarginPercent: number;
  totalProductCost: number;
  logisticsCost: number;
  laborCost: number;
  indirectOverhead: number;
  targetPrice: number;
}): OperationalViabilityReport {
  const { netMarginPercent, totalProductCost, logisticsCost, laborCost, indirectOverhead, targetPrice } = inputs;

  let score = 50; // default medium score
  let classification: 'OUTSTANDING' | 'VIABLE' | 'WARNING' | 'UNVIABLE' = 'WARNING';
  let limitingFactor: 'OVERHEAD' | 'LOGISTICS' | 'LABOR_SHORTAGE' | 'INSUFFICIENT_PRICE' | 'NONE' = 'NONE';
  const remedialActions: string[] = [];

  // Determine baseline classification
  if (netMarginPercent < 0) {
    score = Math.max(5, 20 + Math.round(netMarginPercent));
    classification = 'UNVIABLE';
    limitingFactor = 'INSUFFICIENT_PRICE';
  } else if (netMarginPercent < 35.0) {
    score = Math.round(20 + (netMarginPercent / 35.0 * 45));
    classification = 'WARNING';
  } else if (netMarginPercent <= 55.0) {
    score = Math.round(65 + ((netMarginPercent - 35.0) / 20.0 * 20));
    classification = 'VIABLE';
  } else {
    score = Math.min(100, 85 + Math.round((netMarginPercent - 55.0) * 0.75));
    classification = 'OUTSTANDING';
    classification = 'OUTSTANDING';
  }

  // Pinpoint limiting factors and craft concrete operational recommendations
  const totalCosts = totalProductCost + logisticsCost + laborCost + indirectOverhead;
  const logisticsRatio = totalCosts > 0 ? logisticsCost / totalCosts : 0;
  const overheadRatio = totalCosts > 0 ? indirectOverhead / totalCosts : 0;
  const laborRatio = totalCosts > 0 ? laborCost / totalCosts : 0;

  if (logisticsRatio > 0.40) {
    limitingFactor = 'LOGISTICS';
    remedialActions.push('Sinergia do Veículo: Combine esta rota com outros atendimentos secundários na mesma macrorregião geográfica.');
    remedialActions.push('Taxa de Deslocamento Dedicado: Cobre tarifa por quilometragem excedente direta para recuperar custos de combustível.');
    score = Math.max(10, score - 15);
  } else if (overheadRatio > 0.35 && netMarginPercent < 45.0) {
    limitingFactor = 'OVERHEAD';
    remedialActions.push('Redistribuição Administrativa: Dilua custos fixos automatizando agendamento e laudo com IA.');
    score = Math.max(15, score - 10);
  } else if (laborRatio > 0.40 && netMarginPercent < 45.0) {
    limitingFactor = 'LABOR_SHORTAGE';
    remedialActions.push('Eficiência por Tempo: Otimize processos de barreira química ou use formulações de maior persistência para pular retrabalho.');
    score = Math.max(15, score - 8);
  }

  // Base pricing recommendations
  if (classification === 'UNVIABLE') {
    remedialActions.push('Recomposição Geral de Preço: Eleve o valor ofertado para atingir o ponto de equilíbrio mínimo.');
    remedialActions.push('Redivisão de Calda Química: Aplique bicos de vazão restrita para reduzir custo bruto de ingredientes químicos ativos.');
  } else if (classification === 'WARNING') {
    remedialActions.push('Uso de Recorrência Provisória: Altere este faturamento para um plano semestral garantido para consolidar margem anual estável.');
  } else if (classification === 'OUTSTANDING') {
    remedialActions.push('Excelente Performance: Replique estas metodologias de diluição química em outras propostas semelhantes.');
  }

  if (remedialActions.length === 0) {
    remedialActions.push('Operação perfeitamente calibrada.');
  }

  return {
    score,
    classification,
    limitingFactor,
    remedialActions
  };
}

/**
 * Calculates financial, logistics, and operational risk metrics
 */
export function processRiskAnalysis(inputs: {
  netMarginPercent: number;
  displacementKm: number;
  chemicalWasteSafetyCost: number;
  urgencyLevel: 'Normal' | 'Urgente' | 'Emergencial';
}): RiskAnalysisSnapshot {
  const { netMarginPercent, displacementKm, chemicalWasteSafetyCost, urgencyLevel } = inputs;

  let logisticsRiskScore = Math.min(100, Math.round(displacementKm * 0.9));
  let operationalRiskScore = urgencyLevel === 'Emergencial' ? 85 : urgencyLevel === 'Urgente' ? 60 : 25;
  
  if (chemicalWasteSafetyCost > 120) {
    operationalRiskScore = Math.min(100, operationalRiskScore + 15);
  }

  let financialRiskScore = 0;
  if (netMarginPercent < 15.0) {
    financialRiskScore = 90;
  } else if (netMarginPercent < 35.0) {
    financialRiskScore = 65;
  } else if (netMarginPercent < 55.0) {
    financialRiskScore = 30;
  } else {
    financialRiskScore = 10;
  }

  // Predict margin degradation probability
  let marginDeteriorationProbabilityPercent = 10; // baseline
  if (displacementKm > 100) marginDeteriorationProbabilityPercent += 30;
  if (urgencyLevel === 'Emergencial') marginDeteriorationProbabilityPercent += 20;
  if (netMarginPercent < 35.0) marginDeteriorationProbabilityPercent += 25;
  
  marginDeteriorationProbabilityPercent = Math.min(95, marginDeteriorationProbabilityPercent);

  // Overall qualitative evaluation
  let overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM_CRITICAL' = 'LOW';
  const averageRiskWeight = (logisticsRiskScore + operationalRiskScore + financialRiskScore) / 3;

  if (averageRiskWeight >= 75) {
    overallRiskLevel = 'MAXIMUM_CRITICAL';
  } else if (averageRiskWeight >= 50) {
    overallRiskLevel = 'HIGH';
  } else if (averageRiskWeight >= 25) {
    overallRiskLevel = 'MEDIUM';
  }

  return {
    overallRiskLevel,
    financialRiskScore,
    operationalRiskScore,
    logisticsRiskScore: Number(logisticsRiskScore.toFixed(0)),
    marginDeteriorationProbabilityPercent: Number(marginDeteriorationProbabilityPercent.toFixed(0))
  };
}
