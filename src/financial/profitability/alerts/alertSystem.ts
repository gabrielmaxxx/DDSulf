import { MarginIntelligenceAlert, DetailedOperationalMargin } from '../types';

/**
 * Sweeps a finished operational calculation matrix to diagnose hidden commercial risks
 */
export function auditMarginAlerts(
  margins: DetailedOperationalMargin,
  paramPriceProposed: number,
  displacementKm: number
): MarginIntelligenceAlert[] {
  const alerts: MarginIntelligenceAlert[] = [];

  // 1. Critical net margin drop warning
  if (margins.netMarginPercent < 15.0) {
    alerts.push({
      id: 'mar_al_101',
      code: 'MARGIN_CRITICAL',
      level: 'error',
      title: 'Margem Líquida em Zona Crítica',
      description: `A rentabilidade real estimada de ${margins.netMarginPercent}% está severamente abaixo da meta recomendada (mínimo 35%).`,
      financialWeight: `Perda potencial residual de R$ ${(margins.breakEvenThresholdPrice * 1.35 - paramPriceProposed).toFixed(2)} por execução.`,
      correctiveGuidance: 'Aumente o preço final ou reprojete a quantidade de produto e tempo técnico empregados.'
    });
  } else if (margins.netMarginPercent < 35.0) {
    alerts.push({
      id: 'mar_al_102',
      code: 'MARGIN_WARNING',
      level: 'warning',
      title: 'Margem Líquida Abaixo do Piso',
      description: `Margem líquida de ${margins.netMarginPercent}% está acima do ponto de prejuízo bruto, mas restringe o capital circulante operacional.`,
      financialWeight: `Defasagem técnica estimada em R$ ${(margins.breakEvenThresholdPrice * 1.5 - paramPriceProposed).toFixed(2)}.`,
      correctiveGuidance: 'Acresça taxa fixa de preparação biológica ou remova descontos comerciais vigentes.'
    });
  }

  // 2. High logistics degradation
  if (margins.displacementDegradationPercent > 8.0) {
    alerts.push({
      id: 'mar_al_103',
      code: 'LOGISTIC_DEGRADATION',
      level: 'warning',
      title: 'Deterioração por Deslocamento Geográfico',
      description: `O percurso de ${displacementKm} Km corrói ${margins.displacementDegradationPercent}% da rentabilidade final do contrato.`,
      financialWeight: `Gasto logístico bruto estipulado em R$ ${(displacementKm * 1.85).toFixed(2)}.`,
      correctiveGuidance: 'Consolide rotas para amanhã na mesma região ou fixe taxa extra de Km rodado excedente.'
    });
  }

  // 3. Operational complexity risk alert
  if (margins.complexityPenaltyPercent > 5.0 && margins.netMarginPercent < 50.0) {
    alerts.push({
      id: 'mar_al_104',
      code: 'COMPLEXITY_OVERLOAD',
      level: 'warning',
      title: 'Gravidade Operacional Não Coberta',
      description: `Medidas especiais de segurança e bioproteção consomem R$ ${margins.unproductivityBufferPercent}% de produtividade ociosa de campo.`,
      financialWeight: 'Custo residual de seguro e EPIs sobredimensionados.',
      correctiveGuidance: 'Recomenda-se adicionar taxa de bio-segurança obrigatória na proposta.'
    });
  }

  // 4. Overpricing/elite margin opportunity
  if (margins.netMarginPercent > 70.0) {
    alerts.push({
      id: 'mar_al_105',
      code: 'PREMIUM_OPTIMIZATION',
      level: 'success',
      title: 'Contrato Comercial de Alta Performance (Elite)',
      description: `Margem líquida excepcional de ${margins.netMarginPercent}% detectada para este perfil de atendimento.`,
      financialWeight: `Lucro líquido real estimado de R$ ${margins.actualNetProfitAmount.toFixed(2)} por faturamento.`,
      correctiveGuidance: 'Técnica perfeitamente dimensionada. Excelente padrão para fidelização imediata.'
    });
  }

  return alerts;
}
