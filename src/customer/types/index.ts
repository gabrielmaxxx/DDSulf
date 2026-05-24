/**
 * DDSulf Premium Customer Relationship, Experience and Retentions Types
 */

export type CustomerSegment = 'corporate' | 'residential' | 'industrial' | 'agricultural';

export type ContractStatus = 'active' | 'pending_renewal' | 'churn_risk' | 'inactive';

export interface CustomerProfile {
  id: string;
  name: string;
  corporateName?: string;
  cnpjOrCpf: string;
  segment: CustomerSegment;
  email: string;
  phone: string;
  firstContractAt: number;
  contractStatus: ContractStatus;
  lastServiceAt: number;
  recurrencePeriodDays: number; // Suggested interval between service cycles, e.g. 90 days
  totalServicesCompleted: number;
  lifeTimeValue: number;
}

export interface ServiceHistoryItem {
  id: string;
  customerId: string;
  serviceType: string; // e.g. "Desinsetização Química", "Desratização"
  executedAt: number;
  status: 'completed' | 'canceled' | 'scheduled';
  technicianName: string;
  warrantyExpirationAt: number;
  satisfactionScore?: number; // 1 to 5 scale
  pestIdentified: string[];
}

export interface RecurrenceOpportunity {
  id: string;
  customerId: string;
  customerName: string;
  segment: CustomerSegment;
  lastServiceType: string;
  lastExecutedAt: number;
  daysOverdue: number;
  confidenceScore: number; // e.g. 0.85
  estimatedRevenue: number;
  recommendedPestAction: string;
}

export interface CustomerRelationshipInsight {
  id: string;
  customerId: string;
  customerName: string;
  impactLevel: 'high' | 'medium' | 'low';
  message: string;
  suggestedAction: string;
}

export interface SatisfactionMetrics {
  averageNpsScore: number; // 0 to 100
  customerRetentionRate: number; // 0.0 to 1.0 (percent representation)
  churnRatePrev30Days: number; // percentage
  collectedFeedbacksCount: number;
}
