import { PestType, EnvironmentType, InfestationLevel, OperationalComplexity, Recurrence, UrgencyLevel } from '@/types/database';

export interface ProductCostItem {
  id: string;
  name: string;
  dosagePerM2: number; // in ml or g per m2
  unitCost: number; // cost per ml or g
  unitLabel: 'ml' | 'g';
  amountUsed: number;
  totalCost: number;
}

export interface OperationalCostItem {
  name: string;
  amount: number;
  category: 'direct_labor' | 'displacement' | 'chemicals' | 'equipments' | 'indirect_overhead';
}

export interface PricingInputs {
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
  selectedProducts: ProductCostItem[];
  customMargin?: number; // slider to simulate different scenarios
}

export interface PricingBreakdown {
  directLaborCost: number;
  displacementCost: number;
  chemicalsCost: number;
  indirectOverheadCost: number;
  equipmentsCost: number;
  totalOperationalCost: number;
  suggestedPrice: number;
  actualMarginPercent: number;
  profitAmount: number;
  estimatedTimeHours: number;
  breakEvenPrice: number;
}

export interface PricingSimulation {
  id: string;
  scenarioName: string;
  inputs: PricingInputs;
  breakdown: PricingBreakdown;
  timestamp: string;
}

export interface PricingAlert {
  type: 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actionRequired?: string;
}
