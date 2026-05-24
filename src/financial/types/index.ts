import { EnvironmentType, OperationalComplexity, PestType, Recurrence, UrgencyLevel } from '@/types/database';

export interface FixedCostItem {
  id: string;
  name: string;
  category: 'Aluguel' | 'Salários' | 'Sistemas' | 'Internet' | 'Energia' | 'Administrativo' | 'Outros';
  monthlyAmount: number;
  allocationFactor: number; // weight/percentage of allocation to the general operational pool
  description?: string;
  updatedAt: string;
}

export interface VariableCostItem {
  id: string;
  name: string;
  type: 'Combustível' | 'Produto' | 'Deslocamento' | 'Manutenção' | 'Consumo' | 'Horas' | 'Outros';
  unitCost: number;
  unitLabel: string;
  frequency: 'Uso' | 'Mensal' | 'Anual';
  description?: string;
  updatedAt: string;
}

// Allocation parameters for indirect overhead rateio
export interface CostAllocationSettings {
  id: 'current_allocation';
  allocationMethod: 'TIME_BASED' | 'EQUALLY_DISTRIBUTED' | 'REVENUE_PROPORTIONAL';
  totalMonthlyFixedOverhead: number;
  monthlyAverageServices: number; // approximate services per month to spread fixed cost
  indirectCostPerServiceBase: number; // default indirect rateio to apply per service if not time-based
  activeTechniciansCount: number;
  workingHoursPerMonth: number; // e.g. 220 hours
  updatedAt: string;
}

export interface OperationalCostBreakdown {
  serviceId?: string;
  // Direct Costs
  chemicalProducts: {
    totalRawCost: number;
    wasteSafetyAdjustment: number;
    totalCost: number;
    items: Array<{
      productId: string;
      name: string;
      unitCost: number;
      amountUsed: number;
      unitLabel: string;
      totalCost: number;
    }>;
  };
  logistics: {
    displacementKm: number;
    costPerKm: number;
    totalLogisticsCost: number;
    estimatedTransitHours: number;
  };
  labor: {
    technicianCount: number;
    totalManHoursSpent: number;
    hourlyCostRate: number;
    totalLaborCost: number;
  };
  // Indirect Allocated Costs
  indirectAllocation: {
    allocatedOverheadCost: number; // proportion of fixedCosts allocated to this service
    equipmentAmortization: number;
    complexityRiskFactor: number;
    indirectFeeTotal: number;
  };
  subtotalDirectCost: number;
  subtotalTotalCost: number; // subtotalDirectCost + indirectAllocation
  taxAmount: number;          // Simples Nacional or local ISS ratio
  totalOperationalCost: number; // Net total cost to execute the job
}

export interface ProfitabilityMetrics {
  sellingPrice: number;
  breakEvenPrice: number;
  minPermittedPrice: number;
  profitAmount: number;
  grossMarginPercent: number;
  netMarginPercent: number;
  riskCoefficient: 'CRÍTICO' | 'ALERTA_BAIXO' | 'OTIMIZADO' | 'EXCELENTE';
  viabilityScore: number; // 0 to 100 rating
}

export interface CostAnomalyAlert {
  id: string;
  code: string;
  title: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  financialImpact: string;
  actionRequired: string;
  metricReference?: string;
}

export interface OperationalFinancialSnapshot {
  id: string;
  title: string;
  timestamp: string;
  totalRevenue: number;
  totalDirectCosts: number;
  totalIndirectCosts: number;
  netProfitAmount: number;
  averageMarginPercent: number;
  serviceCount?: number;
  growthProjectionPercent?: number;
}

export interface FinancialForecastMetrics {
  period: string; // e.g., "Junho 2026"
  projectedRevenue: number;
  projectedCosts: number;
  projectedProfit: number;
  marginTrend: 'UP' | 'DOWN' | 'STABLE';
  aiSavingsRecommendation: {
    estimatedSavings: number;
    tip: string;
    targetCategory: string;
  };
}
