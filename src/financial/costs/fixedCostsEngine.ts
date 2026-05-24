import { FixedCostItem, CostAllocationSettings } from '../types';

export const DEFAULT_FIXED_COSTS: FixedCostItem[] = [
  {
    id: 'fc_1',
    name: 'Aluguel do Galpão Operacional',
    category: 'Aluguel',
    monthlyAmount: 3500.0,
    allocationFactor: 0.90, // 90% associated strictly with chemical prep/vehicle yard
    description: 'Sede e garagem dos veículos de pulverização',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fc_2',
    name: 'Salários Administrativos',
    category: 'Salários',
    monthlyAmount: 7200.0,
    allocationFactor: 0.65, // 65% represents customer service and direct operational routing
    description: 'Equipe de vendas, agendamento de rotas e faturamento',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fc_3',
    name: 'Software DDSulf ERP + IA',
    category: 'Sistemas',
    monthlyAmount: 480.0,
    allocationFactor: 1.0, // 100% operational
    description: 'Sistema de roteirização rápida, ordens de serviço e laudo técnico',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fc_4',
    name: 'Internet Fibra Óptica Dedicada',
    category: 'Internet',
    monthlyAmount: 220.0,
    allocationFactor: 0.50,
    description: 'Link dedicado para a equipe de monitoramento',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fc_5',
    name: 'Energia Elétrica Trifásica',
    category: 'Energia',
    monthlyAmount: 850.0,
    allocationFactor: 0.80, // High consumption due to battery loaders and autoclaves
    description: 'Recarga de pulverizadores elétricos e manutenção física',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fc_6',
    name: 'Seguros e Impostos Gerais',
    category: 'Administrativo',
    monthlyAmount: 1100.0,
    allocationFactor: 0.40,
    description: 'Retenções fiscais obrigatórias e seguro patrimonial fixo',
    updatedAt: new Date().toISOString()
  }
];

export const DEFAULT_ALLOCATION_SETTINGS: CostAllocationSettings = {
  id: 'current_allocation',
  allocationMethod: 'TIME_BASED',
  totalMonthlyFixedOverhead: 13350.0, // sum of (monthlyAmount * allocationFactor)
  monthlyAverageServices: 80, // standard baseline of 80 executions per month
  indirectCostPerServiceBase: 166.80, // 13350 / 80
  activeTechniciansCount: 3,
  workingHoursPerMonth: 660, // 3 technicians * 220 hours
  updatedAt: new Date().toISOString()
};

/**
 * Totals up actual operational-allocated monthly fixed overhead
 */
export function calculateTotalAllocatedOverhead(items: FixedCostItem[]): number {
  return items.reduce((acc, curr) => acc + (curr.monthlyAmount * curr.allocationFactor), 0);
}
