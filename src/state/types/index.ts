/**
 * DDSulf Distributed State & Governance Types
 * Comprehensive TypeScript configurations for operational, financial, realtime, and offline-first layers.
 */

export enum SyncStatus {
  IDLE = 'IDLE',
  SYNCING = 'SYNCING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR'
}

export enum SyncActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export interface UserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'technician' | 'commercial' | 'auditor';
  tenantId: string;
  isVerified: boolean;
}

// 1. Calculator State Interface
export interface CalculatorInputs {
  clientName: string;
  pestType: 'Baratas' | 'Cupins' | 'Ratos' | 'Formigas' | 'Nenhum' | string;
  environmentType: 'Residencial' | 'Comercial' | 'Industrial' | string;
  areaSize: number; // in m²
  complexity: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  displacementDistance: number; // in km
}

export interface ChemicalItem {
  id: string;
  name: string;
  dosagePerM2: number; // in ml or g per m²
  unitCost: number; // price per ml or g
  dilutionRatio: number; // water ratio
  stockLevel: number; // in ml or g
  recommendedPests: string[];
}

export interface PricingBreakdown {
  rawChemicalsCost: number;
  displacementCost: number;
  laborCost: number;
  basePrice: number;
  appliedMarginPercent: number;
  suggestedPrice: number;
  finalPrice: number;
  taxAmount: number;
  riskBuffer: number;
}

// 2. Workflow State Interface
export interface WorkflowStep {
  index: number;
  title: string;
  isCompleted: boolean;
  isValid: boolean;
}

export interface QuoteDraft {
  id: string;
  inputs: Partial<CalculatorInputs>;
  breakdown: Partial<PricingBreakdown>;
  currentStep: number;
  updatedAt: string;
  clientSignature?: string;
  version: number;
}

// 3. Operational Financial State
export interface OperationalExpense {
  id: string;
  category: 'quimicos' | 'combustivel' | 'diaria_tecnico' | 'equipamentos' | 'outro';
  amount: number;
  description: string;
  timestamp: string;
}

export interface RevenueMetric {
  id: string;
  quoteId: string;
  clientName: string;
  finalPrice: number;
  marginPercent: number;
  profit: number;
  timestamp: string;
}

// 4. Server-State Seasonal Forecast & Analytics Models
export interface SeasonalTrend {
  periodLabel: string; // "Jan", "Fev" etc.
  seasonalityFactor: number; // multiplier e.g. 1.25
  growthTrendPercent: number;
  predictedRevenue: number;
  predictedCost: number;
  avgExpectedMargin: number;
}

export interface SecurityMarginLeak {
  id: string;
  quoteId: string;
  leakType: 'underpriced_labor' | 'over_dosage' | 'distance_underestimation' | 'low_margin_approved';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  impactAmount: number;
  confidence: number; // 0 to 1
  evidenceMessage: string;
  resolved: boolean;
}

// 5. Sync & Offline Event Queue
export interface OutgoingSyncTask {
  id: string;
  collection: string;
  documentId: string;
  action: SyncActionType;
  payload: any;
  timestamp: string;
  retryCount: number;
  error?: string;
}

export interface PresenceUser {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  activeView: string;
  lastActive: string;
}

// Global state model definitions for easier reference
export interface SystemMetadata {
  apiVersion: string;
  deployedEnvironment: string;
  latencyMs: number;
  lastSuccessfulSync: string | null;
  storageUsageBytes: number;
}
