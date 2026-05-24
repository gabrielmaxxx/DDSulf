import { PricingInputs, PricingBreakdown, PricingAlert } from '../types';

export function validatePricingInputs(inputs: PricingInputs): string[] {
  const errors: string[] = [];
  
  if (inputs.areaSize <= 0) {
    errors.push('A área total do ambiente deve ser maior que zero (0 m²).');
  }
  if (inputs.areaSize > 25000) {
    errors.push('Aviso especial: Áreas acima de 25.000 m² necessitam de análise técnica presencial especial.');
  }
  if (inputs.displacement < 0) {
    errors.push('O deslocamento da sede não pode ser negativo.');
  }
  if (inputs.technicians < 1) {
    errors.push('Pelo menos 1 técnico é necessário para realizar a operação.');
  }

  return errors;
}

export function evaluatePricingHealth(
  inputs: PricingInputs,
  breakdown: PricingBreakdown,
  minHealthyMargin: number = 40
): PricingAlert[] {
  const alerts: PricingAlert[] = [];

  // 1. Critical margin threshold check
  if (breakdown.actualMarginPercent < 30) {
    alerts.push({
      type: 'error',
      title: 'Margem Negativa ou Crítica',
      message: `A margem atual (${breakdown.actualMarginPercent.toFixed(1)}%) coloca a operação em risco de prejuízo. Aumente o preço final ou simule mais margem.`,
      actionRequired: 'Aumente o preço final ou mude a margem do simulador'
    });
  } else if (breakdown.actualMarginPercent < minHealthyMargin) {
    alerts.push({
      type: 'warning',
      title: 'Margem Abaixo do Alvo',
      message: `A margem ajustada de ${breakdown.actualMarginPercent.toFixed(1)}% está abaixo do percentual saudável padrão de ${minHealthyMargin}%.`,
      actionRequired: 'Considere otimizar a rota ou reduzir o tempo operacional'
    });
  } else {
    alerts.push({
      type: 'success',
      title: 'Estrutura Financeira Excelente',
      message: `Saúde financeira validada! Margem operacional saudável de ${breakdown.actualMarginPercent.toFixed(1)}% com retorno projetado ideal.`,
    });
  }

  // 2. High Displacement checks
  if (inputs.displacement > 75) {
    alerts.push({
      type: 'warning',
      title: 'Deslocamento Crítico',
      message: `Distância de ${inputs.displacement} Km impõe custos severos de combustível e horas ociosas de trânsito.`,
      actionRequired: 'Cobrar taxa de deslocamento adicional ou consolidar rotas locais'
    });
  }

  // 3. Technical saturation warning
  const hoursPerTechtalk = breakdown.estimatedTimeHours;
  if (hoursPerTechtalk > 8 && inputs.technicians === 1) {
    alerts.push({
      type: 'warning',
      title: 'Risco de Fadiga do Técnico',
      message: `Tempo estimado de ${hoursPerTechtalk.toFixed(1)}h excede o limite diário padrão para apenas 1 colaborador.`,
      actionRequired: 'Considere aumentar o tamanho da equipe para 2 técnicos'
    });
  }

  return alerts;
}
