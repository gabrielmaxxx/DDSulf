import { PestType, EnvironmentType, InfestationLevel, OperationalComplexity, Recurrence, UrgencyLevel, QuoteStatus } from '@/types/database';
import { ProductCostItem, PricingBreakdown } from '../../types';

export type CurrentStepIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface StepMetadata {
  number: CurrentStepIndex;
  title: string;
  subtitle: string;
  description: string;
  category: 'Cadastro' | 'Operacional' | 'Comercial' | 'Finanças' | 'Conclusão';
}

export interface QuoteWorkflowState {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  pestType: PestType;
  environmentType: EnvironmentType;
  areaSize: number;
  infestationLevel: InfestationLevel;
  complexity: OperationalComplexity;
  displacement: number;
  technicians: number;
  urgency: UrgencyLevel;
  recurrence: Recurrence;
  selectedProducts: ProductCostItem[];
  customMargin: number;
  notes: string;
  additionalCosts: number;
  
  // Progress tracker
  currentStep: CurrentStepIndex;
  maxStepReached: number;
  budgetStartedAt: string;
  lastSavedAt?: string;
  isOfflineDraft: boolean;
  version: string;
}

export interface WorkflowDraft {
  id: string;
  state: QuoteWorkflowState;
  timestamp: string;
  syncAttempts: number;
  isSynced: boolean;
}

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface WorkflowAnalyticsMetrics {
  durationSeconds: number;
  stepsVisited: number[];
  abandonmentStep?: number;
  completed: boolean;
  pricingRevisedCount: number;
  syncTimestamp: string;
}
