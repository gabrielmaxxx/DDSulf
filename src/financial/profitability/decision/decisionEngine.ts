import { DecisionRecommendation } from '../types';
import { EnvironmentType, OperationalComplexity, PestType, Recurrence } from '@/types/database';

/**
 * Formulates tactical financial recommendations for pricing and operational adjustments.
 */
export function formulateDecisionSupport(inputs: {
  netMarginPercent: number;
  environment: EnvironmentType;
  complexity: OperationalComplexity;
  pest: PestType;
  recurrence: Recurrence;
  breakEvenThresholdPrice: number;
  currentProposedPrice: number;
}): DecisionRecommendation {
  const { netMarginPercent, environment, complexity, pest, recurrence, breakEvenThresholdPrice, currentProposedPrice } = inputs;

  let recommendedPriceDeltaPercent = 0;
  let idealMarginAdjustmentPercent = 0;
  let suggestedAction = '';
  let rationale = '';
  let confidenceScore = 0.90; // Default engineering precision confidence

  if (netMarginPercent < 0) {
    // Critical margin deficit
    const necessaryMarkup = ((breakEvenThresholdPrice * 1.45) - currentProposedPrice) / currentProposedPrice;
    recommendedPriceDeltaPercent = Number((necessaryMarkup * 100).toFixed(1));
    idealMarginAdjustmentPercent = 45.0 - netMarginPercent;
    suggestedAction = 'Bloquear Orçamento & Reajustar Margem Bruta';
    rationale = `O preço proposto está abaixo do Break-Even ajustado de R$ ${breakEvenThresholdPrice.toFixed(2)}. É mandatório aplicar no mínimo 45% de markup para viabilizar custos fixos administrativos e o Simples Nacional.`;
    confidenceScore = 0.98;
  } else if (netMarginPercent < 35.0) {
    // Under acceptable margin floor
    recommendedPriceDeltaPercent = 15.0;
    idealMarginAdjustmentPercent = 12.0;
    suggestedAction = 'Aplicar Adicional de Dificuldade Técnica';
    
    if (environment === 'Hospital' || environment === 'Indústria') {
      suggestedAction = 'Aplicar Adicional de Risco Biológico';
      recommendedPriceDeltaPercent = 25.0;
      rationale = `Ambientes de alto estresse do tipo (${environment}) exigem custos ocultos de vestimenta estéril e descarte seguro. Corrija o preço agregando um fator multiplicador k=1.25.`;
    } else {
      rationale = `Margem de lucro de ${netMarginPercent.toFixed(1)}% compromete o fundo de reserva técnica. Alavanque o valor nominal adicionando taxa de monitoramento para recomprar equilíbrio.`;
    }
  } else if (netMarginPercent <= 55.0) {
    // Perfectly stable
    recommendedPriceDeltaPercent = 0;
    idealMarginAdjustmentPercent = 0;
    suggestedAction = 'Prosseguir com Contrato Comercial';
    
    if (recurrence !== 'Único') {
      suggestedAction = 'Aprovar com Fidelidade de Recorrência';
      rationale = `Contrato de recorrência (${recurrence}) estabiliza fluxo de caixa operacional. A margem líquida de ${netMarginPercent.toFixed(1)}% está alinhada e protegida pela fidelidade.`;
    } else {
      rationale = `A composição financeira atual atinge a meta operacional estabelecida. Proposta saudável para faturamento imediato.`;
    }
    confidenceScore = 0.85;
  } else {
    // High-yield premium margin
    recommendedPriceDeltaPercent = -5.0; // optional wiggle room discount
    idealMarginAdjustmentPercent = 0.0;
    suggestedAction = 'Oferecer Desconto Premium para Fechamento Imediato';
    
    if (pest === 'Cupins') {
      suggestedAction = 'Manter Preço Elite (Sem Descontos)';
      recommendedPriceDeltaPercent = 0;
      rationale = `Tratamento premium de Cupins exige monitoramento estendido de 12 meses. Lucro operacional superior a 55% representa colchão técnico valioso contra re-execuções físicas.`;
    } else {
      rationale = `Excepcional margem técnica de ${netMarginPercent.toFixed(1)}%. Há flexibilidade de margem de até 5.0% de desconto caso o cliente necessite para assinatura imediata.`;
    }
    confidenceScore = 0.92;
  }

  return {
    id: `rec_${Date.now()}`,
    recommendedPriceDeltaPercent,
    idealMarginAdjustmentPercent: Number(idealMarginAdjustmentPercent.toFixed(1)),
    suggestedAction,
    rationale,
    confidenceScore
  };
}
