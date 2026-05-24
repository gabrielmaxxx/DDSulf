import { VariableCostItem } from '../types';

export const DEFAULT_VARIABLE_COSTS: VariableCostItem[] = [
  {
    id: 'vc_1',
    name: 'Combustível S10 / Flex',
    type: 'Combustível',
    unitCost: 1.45, // R$ per Km
    unitLabel: 'Km',
    frequency: 'Uso',
    description: 'Consumo ponderado de combustível por deslocamento veicular',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vc_2',
    name: 'Amortização de Pneus e Troca de Óleo',
    type: 'Deslocamento',
    unitCost: 0.40, // R$ per Km
    unitLabel: 'Km',
    frequency: 'Uso',
    description: 'Fração de desgaste mecânico calculado por Km rodado',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vc_3',
    name: 'K-Othrine WG 250 (Concentrado)',
    type: 'Produto',
    unitCost: 1.25, // R$ por grama
    unitLabel: 'g',
    frequency: 'Uso',
    description: 'Pesticida de largo espectro para baratas e moscas',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vc_4',
    name: 'Temprid SC (Concentrado)',
    type: 'Produto',
    unitCost: 2.15, // R$ por mL
    unitLabel: 'ml',
    frequency: 'Uso',
    description: 'Inseticida premium para percevejos de cama e pulgas',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vc_5',
    name: 'Gator Gel Baraticida (Seringa)',
    type: 'Produto',
    unitCost: 3.80, // R$ por grama
    unitLabel: 'g',
    frequency: 'Uso',
    description: 'Gel super atrativo de alta aderência para baratas alemãs',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vc_6',
    name: 'Optigard Formiga Gel',
    type: 'Produto',
    unitCost: 3.40, // R$ por grama
    unitLabel: 'g',
    frequency: 'Uso',
    description: 'Gel formicida de efeito dominó para ninhos internos',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vc_7',
    name: 'Fendona 60 SC (Escorpiões)',
    type: 'Produto',
    unitCost: 1.95, // R$ por mL
    unitLabel: 'ml',
    frequency: 'Uso',
    description: 'Concentrado com alto poder de choque para aracnídeos',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vc_8',
    name: 'Rodilon Bloco (Raticida)',
    type: 'Produto',
    unitCost: 0.85, // R$ por grama
    unitLabel: 'g',
    frequency: 'Uso',
    description: 'Bloco extrusado resistente à umidade para roedores',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vc_9',
    name: 'Depreciação de Atomizadores e EPIs',
    type: 'Consumo',
    unitCost: 35.0, // R$ por serviço standard
    unitLabel: 'OS',
    frequency: 'Uso',
    description: 'Amortização física de termonebulizadores, máscaras de carvão ativo e vestimentas',
    updatedAt: new Date().toISOString()
  }
];

/**
 * Filter variable costs by type for simple reference mappings
 */
export function getProductChemicalCosts(items: VariableCostItem[]): VariableCostItem[] {
  return items.filter(i => i.type === 'Produto');
}

export function getLogisticsRateFromCosts(items: VariableCostItem[]): number {
  const fuel = items.find(i => i.type === 'Combustível')?.unitCost || 1.45;
  const maintenance = items.find(i => i.type === 'Deslocamento')?.unitCost || 0.40;
  return Number((fuel + maintenance).toFixed(2));
}

export function getEquipmentWearRateFromCosts(items: VariableCostItem[]): number {
  return items.find(i => i.type === 'Consumo' && i.name.includes('EPIs'))?.unitCost || 35.0;
}
