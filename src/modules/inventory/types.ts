export const CATEGORY_LABELS: Record<string, string> = {
  inseticida: 'Inseticida',
  raticida: 'Raticida',
  formicida: 'Formicida',
  gel_baraticida: 'Gel Baraticida',
  iscas: 'Iscas',
  equipamentos: 'Equipamentos',
  epi: 'EPI',
  consumiveis: 'Consumíveis',
  outros: 'Outros'
};

export const CATEGORIES_LIST = [
  { value: 'inseticida', label: 'Inseticidas' },
  { value: 'raticida', label: 'Raticidas' },
  { value: 'formicida', label: 'Formicidas' },
  { value: 'gel_baraticida', label: 'Gel Baraticida' },
  { value: 'iscas', label: 'Iscas' },
  { value: 'equipamentos', label: 'Equipamentos' },
  { value: 'epi', label: 'EPIs' },
  { value: 'consumiveis', label: 'Consumíveis' },
  { value: 'outros', label: 'Outros' }
];

export const UNITS_LIST = ['ml', 'g', 'kg', 'L', 'unidade'];

export interface UploadParsedItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  category: string;
  supplier: string;
  confirmed: boolean;
  productGroup: string;
  chemicalGroup: string;
  activeIngredient: string;
  isOfficialMatch: boolean;
  officialProductName?: string;
  suggestedAction?: string;
  similarityWarning?: string;
  mergeWithProductId?: string;
  budgetClass?: 'found' | 'equivalent' | 'unregistered';
  equivalentName?: string;
  lot?: string;
  expiryDate?: string;
}

export type InventoryTabType =
  | 'dashboard'
  | 'upload_entry'
  | 'movements_log'
  | 'purchase_requisitions'
  | 'supplier_import';

export type FichaSubTabType =
  | 'resumo'
  | 'movimentacoes'
  | 'consumo'
  | 'documentos'
  | 'compras'
  | 'localizacao';
