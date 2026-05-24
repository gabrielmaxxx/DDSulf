import { PestType, EnvironmentType, InfestationLevel, OperationalComplexity, Recurrence, UrgencyLevel } from '@/types/database';
import { ProductCostItem, OperationalCostItem } from '../../types';

export interface PricingRule {
  id: string;
  name: string;
  category: 'pest' | 'environment' | 'infestation' | 'urgency' | 'complexity' | 'recurrence';
  multiplier: number;
  flatFee: number;
  description: string;
}

export interface RuleEngineSettings {
  multipliers: {
    pests: Record<PestType, number>;
    environments: Record<EnvironmentType, number>;
    infestations: Record<InfestationLevel, number>;
    complexities: Record<OperationalComplexity, number>;
    urgencies: Record<UrgencyLevel, number>;
    recurrences: Record<Recurrence, number>; // Discounts and LTV multipliers
  };
  baseRates: {
    hourlyLaborCost: number;     // R$ cost/hour per technician
    costPerKm: number;            // logistics cost per Km (fuel, vehicle amort.)
    equipmentBaseAmortization: number;
    wasteSafetyRatio: number;     // chemical surplus safety ratio (e.g., 10% overflow)
    fixedOperationalIndirectFee: number; // R$ general SG&A allowance
  };
}

export interface DetailedOperationalCost {
  chemicalInsumos: {
    items: ProductCostItem[];
    rawCost: number;
    wasteAdjustment: number;
    totalChemicalCost: number;
  };
  logistics: {
    distanceKm: number;
    costPerKm: number;
    totalLogisticsCost: number;
    estimatedTransitTimeHours: number;
  };
  labor: {
    technicianCount: number;
    manHoursSpent: number;
    hourlyCost: number;
    totalLaborCost: number;
  };
  overheadAndAssets: {
    equipmentAmortization: number;
    complexityRiskFactor: number;
    indirectOverheadFee: number;
    totalAssetAndOverheadCost: number;
  };
  subtotalDirectCost: number;
  taxAmount: number;             // e.g. ISS / Simples Nacional percentage
  totalOperationCost: number;    // Absolute bottom line to perform the job
}

export interface MarginMatrix {
  minimumMarginPercent: number;    // Under which we block with Warning
  targetMarginPercent: number;     // Ideal pricing engine margin
  optimisticMarginPercent: number; // Maximum value-add premium margin
  riskPremiumPercent: number;      // Extra buffer margin overlayed by high complexity
}

export interface CompositePrice {
  baseOperationalCost: number;
  breakEvenPrice: number;          // Zero profit point including overheads
  suggestedPrice: number;         // Mathematically optimized starting point
  minPermittedPrice: number;      // Absolute floor value (warn/block user)
  riskPremiumAmount: number;
  taxesTotal: number;
  profitMarginSelected: number;    // Used to back-calculate margin
  actualMarginPercent: number;
  actualNetProfitAmount: number;
}

export interface PricingAnalyticsMetrics {
  version: string;
  timestamp: string;
  dealSizeCategory: 'Pequeno' | 'Médio' | 'Grande' | 'Enterprise';
  estimatedLTV: number;           // Recurrence * expected monthly contract life
  contractPeriodMonths: number;
  operationalComplexityIndex: number; // calculated relative weight
  geographyCoefficient: number;
  futureIARecommendation: {
    confidenceScore: number;
    suggestedMarginDelta: number;
    optimizationTip: string;
  };
}

export interface PricingSimulationScenario {
  id: string;
  scenarioLabel: string;
  inputs: {
    areaSize: number;
    displacementKm: number;
    techniciansCount: number;
    targetMarginPercent: number;
    recurrence: Recurrence;
  };
  breakdown: {
    totalCost: number;
    suggestedPrice: number;
    netProfit: number;
    marginPercent: number;
  };
  isSaved: boolean;
}

export interface FinancialAlert {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  code: string;
  title: string;
  message: string;
  financialImpact?: string;
  actionRequired?: string;
}

export interface PricingSessionDraft {
  id: string;
  clientName: string;
  inputs: {
    clientName: string;
    pestType: PestType;
    environmentType: EnvironmentType;
    areaSize: number;
    infestationLevel: InfestationLevel;
    complexity: OperationalComplexity;
    displacement: number;
    technicians: number;
    urgency: UrgencyLevel;
    recurrence: Recurrence;
    customMargin?: number;
    selectedProducts?: ProductCostItem[];
  };
  updatedAt: string;
  cacheStatus: 'local' | 'synced' | 'dirty';
}
