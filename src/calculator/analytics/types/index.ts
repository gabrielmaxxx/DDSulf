import { 
  PestType, 
  EnvironmentType, 
  InfestationLevel, 
  OperationalComplexity, 
  Recurrence, 
  UrgencyLevel, 
  QuoteStatus 
} from '@/types/database';
import { ProductCostItem, PricingBreakdown, PricingInputs } from '../../types';

export interface OperationalSnapshot {
  id: string;
  quoteId: string;
  version: number;
  timestamp: string;
  inputs: PricingInputs;
  breakdown: PricingBreakdown;
  activeMarginPercent: number;
  totalOperationalCost: number;
  suggestedPrice: number;
  techniciansCount: number;
  estimatedHours: number;
  productCosts: Array<{
    id: string;
    name: string;
    amountUsed: number;
    totalCost: number;
  }>;
  changedBy: string;
  changeReason?: string;
}

export interface QuoteVersionHistory {
  quoteId: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  snapshots: OperationalSnapshot[];
}

export interface HistoricalMetrics {
  ticketMedio: number;
  margemMediaPercent: number;
  margemPorTipoPraga: Record<PestType, number>;
  margemPorTipoAmbiente: Record<EnvironmentType, number>;
  lucratividadeTotal: number;
  frequenciaOperacional: Record<PestType, number>;
  frequenciaPeloAmbiente: Record<EnvironmentType, number>;
  mediaHorasEstimadas: number;
  distribuicaoComplexidade: Record<OperationalComplexity, number>;
  distribuicaoRecorrencia: Record<Recurrence, number>;
  tempoMedioOrcamentoSegundos: number;
  taxaAprovacao: number;
}

export interface WorkflowAnalytics {
  taxaConclusaoPercent: number;
  tempoMedioPorEtapaSegundos: Record<number, number>; // key: step index, value: seconds
  etapaAbandoneFrequencia: Record<number, number>; // key: step index, value: count
  tempoTotalMedioSegundos: number;
  totalIniciados: number;
  totalFinalizados: number;
}

export interface OperationalIntelligenceInsight {
  id: string;
  type: 'financial_health' | 'operational_risk' | 'margin_leakage' | 'pricing_optimization' | 'chemical_efficiency' | 'recurring_opportunity';
  title: string;
  message: string;
  impactValue: number; // e.g. R$ amount or percentage
  impactType: 'savings' | 'revenue_leak' | 'margin_gain' | 'risk_score';
  confidence: number; // 0 to 1
  evidence: {
    key: string;
    value: string | number;
  }[];
  suggestedAction: string;
  applied?: boolean;
}

export interface ForecastingScenario {
  periodLabel: string; // e.g. 'Junho 2026'
  projecaoReceita: number;
  projecaoCustoOperacional: number;
  margemMediaEsperada: number;
  taxaCrescimentoPrevistaPercent: number;
  fatorSazonalidade: number; // e.g. 1.2 for summer
  riscoEscassezProdutoScore: number; // 0 to 1
}

export interface AIReadyContext {
  promptContextString: string;
  structuredPayload: {
    clientDetails: {
      name: string;
      segment: EnvironmentType;
    };
    operation: {
      pestType: PestType;
      areaSize: number;
      complexity: OperationalComplexity;
      infestation: InfestationLevel;
      urgency: UrgencyLevel;
    };
    financials: {
      suggestedPrice: number;
      totalOperationalCost: number;
      estimatedMargin: number;
      chemicalPercentageOfCost: number;
    };
    similarHistoricalStats: {
      avgMarginForPest: number;
      recommendationConfidence: number;
      idealTechnicianCount: number;
    };
    aiTokens: {
      recommendedDisplacementMarkup: number;
      optimalProductVolumeDosage: Record<string, number>;
    };
  };
}

export interface RealtimeProfitabilitySnap {
  currentProfit: number;
  currentMarginPercent: number;
  hoursNeeded: number;
  chemicalCostRatio: number; // ratio of chemical cost to total price
  breakEvenThreshold: number;
  leakageAlert: boolean;
}
