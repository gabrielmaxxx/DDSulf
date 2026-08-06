export type UserRole = 'master' | 'admin' | 'manager' | 'commercial' | 'technician' | 'operator' | 'funcionario' | string;

export interface ModulePermissionActions {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export type UserPermissionsSchema = Record<string, ModulePermissionActions>;

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  login?: string;
  cargo?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  empresaId?: string;
  phone?: string;
  avatar?: string;
  permissions?: UserPermissionsSchema;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Client {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  cpfCnpj?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  city?: string;
  region?: string;
  leadSource?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PestType = 'Baratas' | 'Ratos' | 'Cupins' | 'Formigas' | 'Escorpiões' | 'Pulgas' | 'Mosquitos' | 'Percevejos' | 'Outros';
export type EnvironmentType = 'Residência' | 'Comércio' | 'Indústria' | 'Restaurante' | 'Condomínio' | 'Hospital' | 'Área Externa';
export type InfestationLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
export type OperationalComplexity = 'Simples' | 'Normal' | 'Complexo';
export type Recurrence = 'Único' | 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
export type UrgencyLevel = 'Normal' | 'Prioritário' | 'Emergência';
export type QuoteStatus = 'Rascunho' | 'Enviado' | 'Aprovado' | 'Executado' | 'Cancelado';

export interface Quote {
  id?: string;
  clientId: string;
  clientName?: string;
  pestType: PestType;
  environmentType: EnvironmentType;
  areaSize: number;
  infestationLevel: InfestationLevel;
  operationalComplexity: OperationalComplexity;
  recurrence: Recurrence;
  urgency: UrgencyLevel;
  displacement: number;
  estimatedTime: number;
  suggestedPrice: number;
  estimatedCost: number;
  estimatedMargin: number;
  suggestedTeam: number;
  status: QuoteStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ServiceStatus = 'Agendado' | 'Em Andamento' | 'Finalizado' | 'Atrasado';

export interface ServiceExecution {
  id?: string;
  quoteId: string;
  clientId: string;
  technicians: string[];
  executionDate: string;
  startTime?: string;
  endTime?: string;
  actualDuration?: number;
  actualCost?: number;
  actualConsumption?: Array<{
    productId: string;
    quantity: number;
    unit: string;
  }>;
  actualDisplacement?: number;
  returnRequired: boolean;
  operationalNotes?: string;
  status: ServiceStatus;
  createdAt: string;
}

export type FinancialCategory = 'Fixo' | 'Variável' | 'Operacional';

export interface FinancialCost {
  id?: string;
  category: FinancialCategory;
  subcategory?: string;
  amount: number;
  recurrence?: string;
  relatedServiceId?: string;
  createdBy: string;
  createdAt: string;
}

export interface FinancialSettings {
  id?: 'default';
  costPerHour: number;
  costPerKm: number;
  minimumMargin: number;
  baseOperationalCost: number;
  updatedAt: string;
}

export interface Revenue {
  id?: string;
  clientId?: string;
  serviceId?: string;
  category: string;
  amount: number;
  paymentMethod: string;
  receivedAt: string;
  createdAt: string;
}

export interface Product {
  id?: string;
  name: string;
  category: string;
  manufacturer?: string;
  unit: string;
  unitCost: number;
  quantityAvailable: number;
  minimumStock: number;
  supplier?: string;
  updatedAt: string;
}

export interface StockMovement {
  id?: string;
  productId: string;
  type: 'Entrada' | 'Saída';
  quantity: number;
  relatedServiceId?: string;
  responsibleUser: string;
  createdAt: string;
}

export interface POP {
  id?: string;
  title: string;
  category: string;
  pestType?: PestType;
  environmentType?: EnvironmentType;
  description: string;
  epis: string[];
  recommendedProducts?: string[];
  checklist: string[];
  protocols?: Array<{
    step: string;
    description: string;
  }>;
  riskLevel?: 'Baixo' | 'Médio' | 'Alto';
  updatedAt: string;
}

export interface DashboardMetric {
  id?: string;
  key: string;
  value: number;
  period: string;
  timestamp: string;
}

export interface HistoricalInsight {
  id?: string;
  type: string;
  pattern: string;
  confidence: number;
  dataPoints: number;
}
