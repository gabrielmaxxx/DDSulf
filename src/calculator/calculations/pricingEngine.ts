import { PricingInputs, PricingBreakdown, ProductCostItem } from '../types';
import { PestType, EnvironmentType, InfestationLevel, OperationalComplexity } from '@/types/database';

// Technical standard pest multipliers
export const PEST_FACTORS: Record<PestType, { timeMultiplier: number; chemicalIntensity: number }> = {
  'Baratas': { timeMultiplier: 1.0, chemicalIntensity: 1.0 },
  'Ratos': { timeMultiplier: 1.3, chemicalIntensity: 1.2 },
  'Cupins': { timeMultiplier: 2.5, chemicalIntensity: 2.2 },
  'Formigas': { timeMultiplier: 0.9, chemicalIntensity: 0.95 },
  'Escorpiões': { timeMultiplier: 1.6, chemicalIntensity: 1.4 },
  'Pulgas': { timeMultiplier: 1.4, chemicalIntensity: 1.5 },
  'Mosquitos': { timeMultiplier: 1.2, chemicalIntensity: 1.3 },
  'Percevejos': { timeMultiplier: 1.8, chemicalIntensity: 1.8 },
  'Outros': { timeMultiplier: 1.0, chemicalIntensity: 1.0 }
};

// Regulatory and complexity multipliers based on environments
export const ENVIRONMENT_FACTORS: Record<EnvironmentType, { riskFactor: number; overheadFactor: number }> = {
  'Residência': { riskFactor: 1.0, overheadFactor: 1.0 },
  'Comércio': { riskFactor: 1.2, overheadFactor: 1.15 },
  'Indústria': { riskFactor: 1.8, overheadFactor: 1.4 },
  'Restaurante': { riskFactor: 1.5, overheadFactor: 1.3 },
  'Condomínio': { riskFactor: 1.4, overheadFactor: 1.25 },
  'Hospital': { riskFactor: 2.0, overheadFactor: 1.5 },
  'Área Externa': { riskFactor: 1.0, overheadFactor: 1.0 }
};

export const INFESTATION_POWER: Record<InfestationLevel, { time: number; dosage: number }> = {
  'Baixo': { time: 0.8, dosage: 0.8 },
  'Médio': { time: 1.0, dosage: 1.0 },
  'Alto': { time: 1.4, dosage: 1.4 },
  'Crítico': { time: 2.2, dosage: 2.0 }
};

export const COMPLEXITY_RATES: Record<OperationalComplexity, number> = {
  'Normal': 1.0,
  'Simples': 0.8,
  'Complexo': 1.5
};

export interface PricingEngineSettings {
  costPerHour: number;
  costPerKm: number;
  baseOperationalCost: number;
  indirectOverheadRate: number; // e.g. 15% (0.15) of direct costs
  targetMarginDefault: number; // e.g. 60%
  baseEquipmentAmortization: number; // static wear & tear cost
}

export const DEFAULT_ENGINE_SETTINGS: PricingEngineSettings = {
  costPerHour: 45,
  costPerKm: 2.4,
  baseOperationalCost: 75,
  indirectOverheadRate: 0.15,
  targetMarginDefault: 60, // SaaS-like highly profitable target margin
  baseEquipmentAmortization: 35
};

/**
 * Calculates estimated hours to treat an area
 */
export function estimateDurationHours(
  areaSize: number,
  pestType: PestType,
  complexity: OperationalComplexity,
  infestation: InfestationLevel
): number {
  const baseRate = 1 / 150; // default 1 hour per 150m²
  let duration = areaSize * baseRate;
  
  // Apply multipliers
  duration *= PEST_FACTORS[pestType]?.timeMultiplier ?? 1.0;
  duration *= COMPLEXITY_RATES[complexity] ?? 1.0;
  duration *= INFESTATION_POWER[infestation]?.time ?? 1.0;
  
  // Minimum treatment window is 0.75 hours (45 min)
  return Math.max(0.75, Math.round(duration * 100) / 100);
}

/**
 * Calculates standard chemical usage based on defaults if custom chemicals are loaded or empty
 */
export function computeChemicalCosts(
  areaSize: number,
  pestType: PestType,
  infestation: InfestationLevel,
  customProducts?: ProductCostItem[]
): { totalChemicalCost: number; items: ProductCostItem[] } {
  if (customProducts && customProducts.length > 0) {
    // Process custom selection with reactive calculations
    const items = customProducts.map(prod => {
      const pestIntensity = PEST_FACTORS[pestType]?.chemicalIntensity ?? 1.0;
      const infestDosage = INFESTATION_POWER[infestation]?.dosage ?? 1.0;
      const dosageMult = pestIntensity * infestDosage;
      
      const amt = areaSize * prod.dosagePerM2 * dosageMult;
      const cost = amt * prod.unitCost;
      return {
        ...prod,
        amountUsed: Math.round(amt * 10) / 10,
        totalCost: Math.round(cost * 100) / 100
      };
    });

    const totalChemicalCost = items.reduce((acc, curr) => acc + curr.totalCost, 0);
    return { totalChemicalCost, items };
  }

  // Fallback default chemical products standard definition
  const defaults: Record<PestType, string> = {
    'Baratas': 'K-Othrine Gel & Deltametrina EC',
    'Ratos': 'Raticida Grão & Bloco Parafinado',
    'Cupins': 'Termicida Fipronil Concentrado',
    'Formigas': 'Gel Formicida & Bifentrina',
    'Escorpiões': 'Fendona Pro Suspensão',
    'Pulgas': 'Inibidor de Crescimento lufenuron',
    'Mosquitos': 'Adulticida Lambdacialotrina',
    'Percevejos': 'Temprid Multi-Action',
    'Outros': 'Inseticida Clorpirifós'
  };

  const name = defaults[pestType] || 'Inseticida Padrão PestFlow';
  const pestIntensity = PEST_FACTORS[pestType]?.chemicalIntensity ?? 1.0;
  const infestDosage = INFESTATION_POWER[infestation]?.dosage ?? 1.0;
  
  // average price of chemicals is around R$ 0.15 per m²
  const baseCostPerM2 = 0.18;
  const finalCostM2 = baseCostPerM2 * pestIntensity * infestDosage;
  const chemicalCost = areaSize * finalCostM2;

  const defaultItem: ProductCostItem = {
    id: `def_${pestType}`,
    name,
    dosagePerM2: pestType === 'Cupins' ? 5.0 : 2.0,
    unitCost: finalCostM2 / (pestType === 'Cupins' ? 5.0 : 2.0),
    unitLabel: 'ml',
    amountUsed: areaSize * (pestType === 'Cupins' ? 5.2 : 2.0),
    totalCost: Math.round(chemicalCost * 100) / 100
  };

  return {
    totalChemicalCost: Math.round(chemicalCost * 100) / 100,
    items: [defaultItem]
  };
}

// ============================================================
// NOVA INTERFACE DE SETTINGS
// ============================================================
export interface MarkupPricingSettings {
  // CDV Components
  costPerHour: number;           // Custo/hora do técnico
  costPerKm: number;             // Custo/km de deslocamento
  baseEquipmentAmortization: number;  // Amortização equipamentos por serviço

  // Markup Parameters
  despesasVariaveisPercent: number;  // %DV (impostos + taxas sobre faturamento)
  margemAlvoPercent: number;         // %ML desejada
  margemMinimaPercent: number;       // %ML mínima (floor de alerta)
}

export const DEFAULT_MARKUP_SETTINGS: MarkupPricingSettings = {
  costPerHour: 45,
  costPerKm: 2.40,
  baseEquipmentAmortization: 35,
  despesasVariaveisPercent: 15,
  margemAlvoPercent: 35,
  margemMinimaPercent: 20,
};

// ============================================================
// NOVO TIPO DE RETORNO
// ============================================================
export interface MarkupPricingResult {
  // CDV Breakdown
  cdv: {
    produtos: number;
    maoDeObra: number;
    transporte: number;
    equipamentos: number;
    total: number;              // CDV total
  };

  // Markup
  markupDivisor: number;        // ex: 0.50
  markupMultiplicador: number;  // ex: 2.0
  
  // Preços
  precoBaseMarkup: number;      // CDV × Multiplicador (sem ajustes)
  ajusteAmbiente: number;       // fator de risco ambiental (ex: hospital +20%)
  ajusteRecorrencia: number;    // desconto recorrência (ex: -12% trimestral)
  ajusteUrgencia: number;       // adicional urgência (ex: +35% emergência)
  precoFinalSugerido: number;   // preço final recomendado
  precoMinimo: number;          // CDV / (1 - %DV) ← break-even real

  // Margem real resultante
  margemRealPercent: number;
  lucroAbsoluto: number;

  // Alertas
  abaixoMargemMinima: boolean;
  abaixoBreakEven: boolean;
  
  // Dados auxiliares
  estimatedTimeHours: number;
  produtosUsados: ProductCostItem[];
}

// ============================================================
// NOVA FUNÇÃO PRINCIPAL
// ============================================================
export function calcularPrecoPorMarkup(
  inputs: PricingInputs,
  settings: MarkupPricingSettings = DEFAULT_MARKUP_SETTINGS
): MarkupPricingResult {

  // ETAPA 1: Calcular CDV
  const estimatedTimeHours = estimateDurationHours(
    inputs.areaSize, inputs.pestType, inputs.complexity, inputs.infestationLevel
  );

  const { totalChemicalCost, items: produtosUsados } = computeChemicalCosts(
    inputs.areaSize, inputs.pestType, inputs.infestationLevel, inputs.selectedProducts
  );

  const maoDeObra = inputs.technicians * estimatedTimeHours * settings.costPerHour;
  const transporte = inputs.displacement * settings.costPerKm;
  const equipamentos = settings.baseEquipmentAmortization
    + (inputs.complexity === 'Complexo' ? 25 : 0);

  const cdvTotal = totalChemicalCost + maoDeObra + transporte + equipamentos;

  // ETAPA 2: Calcular Markup
  const dv = settings.despesasVariaveisPercent / 100;
  const ml = (inputs.customMargin !== undefined
    ? inputs.customMargin
    : settings.margemAlvoPercent) / 100;

  const markupDivisor = 1 - (dv + ml);

  // Proteção: divisor nunca pode ser <= 0
  const divisorSeguro = markupDivisor <= 0.01 ? 0.01 : markupDivisor;
  const markupMultiplicador = 1 / divisorSeguro;

  // ETAPA 3: Preço base
  let precoBase = cdvTotal * markupMultiplicador;

  // ETAPA 4: Ajuste de risco ambiental (apenas sobre o preço, não sobre o CDV)
  const riskFactor = ENVIRONMENT_FACTORS[inputs.environmentType]?.riskFactor ?? 1.0;
  const ajusteAmbiente = riskFactor;
  precoBase *= riskFactor;

  // ETAPA 5: Ajuste de recorrência (desconto por fidelidade)
  let descontoRecorrencia = 0;
  if (inputs.recurrence === 'Mensal') descontoRecorrencia = 0.10;
  if (inputs.recurrence === 'Trimestral') descontoRecorrencia = 0.06;
  if (inputs.recurrence === 'Semestral') descontoRecorrencia = 0.03;
  const ajusteRecorrencia = 1 - descontoRecorrencia;
  precoBase *= ajusteRecorrencia;

  // ETAPA 6: Adicional de urgência
  let urgencyFactor = 1.0;
  if (inputs.urgency === 'Prioritário') urgencyFactor = 1.15;
  if (inputs.urgency === 'Emergência') urgencyFactor = 1.35;
  const ajusteUrgencia = urgencyFactor;
  let precoFinalSugerido = Math.round(precoBase * urgencyFactor);

  // ETAPA 7: Preço mínimo real (break-even considerando impostos)
  // Para cobrir apenas o CDV + impostos:
  //   precoMinimo × (1 - %DV) = CDV
  //   precoMinimo = CDV / (1 - %DV)
  const precoMinimo = Math.round(cdvTotal / (1 - dv));

  // Garantia de floor: nunca cobrar abaixo do break-even
  if (precoFinalSugerido < precoMinimo) {
    precoFinalSugerido = precoMinimo;
  }

  // ETAPA 8: Calcular margem real resultante
  const receitaLiquida = precoFinalSugerido * (1 - dv);  // descontando impostos
  const lucroAbsoluto = receitaLiquida - cdvTotal;
  const margemRealPercent = precoFinalSugerido > 0
    ? (lucroAbsoluto / precoFinalSugerido) * 100
    : 0;

  return {
    cdv: {
      produtos: Math.round(totalChemicalCost * 100) / 100,
      maoDeObra: Math.round(maoDeObra * 100) / 100,
      transporte: Math.round(transporte * 100) / 100,
      equipamentos: Math.round(equipamentos * 100) / 100,
      total: Math.round(cdvTotal * 100) / 100,
    },
    markupDivisor: Math.round(markupDivisor * 1000) / 1000,
    markupMultiplicador: Math.round(markupMultiplicador * 100) / 100,
    precoBaseMarkup: Math.round(cdvTotal * markupMultiplicador),
    ajusteAmbiente,
    ajusteRecorrencia,
    ajusteUrgencia,
    precoFinalSugerido,
    precoMinimo,
    margemRealPercent: Math.round(margemRealPercent * 10) / 10,
    lucroAbsoluto: Math.round(lucroAbsoluto * 100) / 100,
    abaixoMargemMinima: margemRealPercent < settings.margemMinimaPercent,
    abaixoBreakEven: precoFinalSugerido < precoMinimo,
    estimatedTimeHours,
    produtosUsados,
  };
}

/**
 * Computes entire pricing breakdown based on active settings (backwards compatible wrapper)
 */
export function processOperationalPricing(
  inputs: PricingInputs,
  settings: any = DEFAULT_ENGINE_SETTINGS
): PricingBreakdown {
  // Safe mapping to MarkupPricingSettings
  const markupSettings: MarkupPricingSettings = {
    costPerHour: settings.costPerHour ?? 45,
    costPerKm: settings.costPerKm ?? 2.40,
    baseEquipmentAmortization: settings.baseEquipmentAmortization ?? settings.baseOperationalCost ?? 35,
    despesasVariaveisPercent: settings.despesasVariaveisPercent ?? 15,
    margemAlvoPercent: inputs.customMargin !== undefined ? inputs.customMargin : (settings.targetMarginDefault ?? 35),
    margemMinimaPercent: settings.margemMinimaPercent ?? 20,
  };

  const result = calcularPrecoPorMarkup(inputs, markupSettings);

  return {
    directLaborCost: result.cdv.maoDeObra,
    displacementCost: result.cdv.transporte,
    chemicalsCost: result.cdv.produtos,
    indirectOverheadCost: 0,
    equipmentsCost: result.cdv.equipamentos,
    totalOperationalCost: result.cdv.total,
    suggestedPrice: result.precoFinalSugerido,
    actualMarginPercent: result.margemRealPercent,
    profitAmount: result.lucroAbsoluto,
    estimatedTimeHours: result.estimatedTimeHours,
    breakEvenPrice: result.precoMinimo
  };
}
