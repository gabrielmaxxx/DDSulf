/**
 * DDSulf Enterprise Core Firestore & Operational Domain Model Definitions
 * Strictly aligned with `firebase-blueprint.json` and `firestore.rules`.
 */

import { DocumentData, FieldValue } from 'firebase/firestore';

export type UserRole = 'admin' | 'manager' | 'commercial' | 'technician';
export type UserStatus = 'active' | 'inactive';

export interface UserProfile extends DocumentData {
  id?: string;
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatar?: string;
  createdAt: string | FieldValue;
  updatedAt: string | FieldValue;
  lastLogin?: string | FieldValue;
}

export interface ClientAddress {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface Client extends DocumentData {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  cpfCnpj?: string;
  address?: ClientAddress;
  city?: string;
  region?: string;
  leadSource?: string;
  notes?: string;
  createdAt: string | FieldValue;
  updatedAt: string | FieldValue;
}

export type QuoteStatus = 'Rascunho' | 'Enviado' | 'Aprovado' | 'Executado' | 'Cancelado';
export type PestType = 'Baratas' | 'Cupins' | 'Formigas' | 'Ratos' | 'Aracnídeos' | 'Geral';
export type RecurrenceType = 'Único' | 'Mensal' | 'Trimestral' | 'Semestral';
export type InfestationLevelType = 'Baixo' | 'Médio' | 'Alto';
export type OperationalComplexityType = 'Simples' | 'Normal' | 'Complexo';

export interface Quote extends DocumentData {
  id?: string;
  clientId: string;
  pestType: PestType;
  environmentType: string;
  areaSize: number;
  infestationLevel: InfestationLevelType;
  operationalComplexity: OperationalComplexityType;
  recurrence: RecurrenceType;
  urgency: boolean;
  displacement: number;
  estimatedTime: number; // in hours
  suggestedPrice: number;
  estimatedCost: number;
  estimatedMargin: number; // percentage
  suggestedTeam: number; // headcount
  status: QuoteStatus;
  createdBy: string;
  createdAt: string | FieldValue;
  updatedAt: string | FieldValue;
}

export type ServiceStatus = 'Agendado' | 'Em Andamento' | 'Finalizado' | 'Atrasado';

export interface ChemicalConsumption {
  productId: string;
  productName: string;
  quantityUsed: number;
  unit: string;
}

export interface ServiceExecution extends DocumentData {
  id?: string;
  quoteId: string;
  clientId: string;
  technicians: string[]; // uid list
  executionDate: string; // ISO date
  startTime?: string;
  endTime?: string;
  actualDuration?: number; // hours
  actualCost?: number;
  actualConsumption?: ChemicalConsumption[];
  actualDisplacement?: number;
  returnRequired: boolean;
  operationalNotes?: string;
  status: ServiceStatus;
  createdAt: string | FieldValue;
  updatedAt: string | FieldValue;
}

export type CostCategory = 'Fixo' | 'Variável' | 'Operacional';

export interface FinancialCost extends DocumentData {
  id?: string;
  category: CostCategory;
  subcategory: string;
  amount: number;
  recurrence?: string;
  relatedServiceId?: string;
  createdBy: string;
  createdAt: string | FieldValue;
  updatedAt: string | FieldValue;
}

export interface Revenue extends DocumentData {
  id?: string;
  clientId?: string;
  serviceId?: string;
  category?: string;
  amount: number;
  paymentMethod?: string;
  receivedAt: string; // ISO String
  createdAt: string | FieldValue;
  updatedAt: string | FieldValue;
}

export interface Product extends DocumentData {
  id?: string;
  name: string;
  category: string;
  manufacturer?: string;
  unit: string;
  unitCost: number;
  quantityAvailable: number;
  minimumStock: number;
  supplier?: string;
  updatedAt: string | FieldValue;
}

export type StockMovementType = 'Entrada' | 'Saída';

export interface StockMovement extends DocumentData {
  id?: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  relatedServiceId?: string;
  responsibleUser: string;
  createdAt: string | FieldValue;
}

export interface POP extends DocumentData {
  id?: string;
  title: string;
  category: string;
  pestType: string;
  environmentType?: string;
  description: string;
  epis: string[];
  recommendedProducts?: string[];
  checklist: string[];
  updatedAt: string | FieldValue;
}

export interface DashboardMetric extends DocumentData {
  id?: string;
  key: string;
  value: number;
  period: string;
  timestamp: string;
}

export interface HistoricalInsight extends DocumentData {
  id?: string;
  type: string;
  pattern: string;
  confidence: number;
  dataPoints: number;
}
