import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { resolveCityFromAddress, haversineKm, getCityCoordinates } from '@/utils/geo';

export interface FinancialMovement {
  id: string;
  date: string;          // Data (YYYY-MM-DD)
  description: string;   // Descrição da movimentação
  category: string;      // Grupo Principal (RECEITAS | CUSTOS DIRETOS | DESPESAS OPERACIONAIS | etc.)
  subcategory: string;   // Subcategoria (Dedetização, Produtos Químicos, Salários, etc.)
  value: number;         // Valor financeiro (positivo para entrada, negativo para saída)
  paymentMethod: string; // Forma de pagamento (Pix, Cartão de Crédito, Boleto, Dinheiro, etc.)
  costCenter: string;    // Centro de custo (Geral, Equipe Alfa, Veículo 01, etc.)
  refType?: string;      // Metadata: 'team' | 'vehicle' | 'product' | etc.
  refName?: string;      // Metadata display name
  isPaid?: boolean;
  dueDate?: string;
  clientId?: string;     // Linked Client ID
  serviceId?: string;    // Linked Service/OS Event ID
  quoteId?: string;      // Linked Quote/Budget ID
  documentUrl?: string;  // Linked Invoice/Direct Document File Base64 or path
  documentName?: string; // Linked Invoice filename
}

export interface FinancialCostConfig {
  fixedCosts: {
    vehicleRental: number;
    salaries: number;
    rent: number;
    fuel: number;
    insurance: number;
    other: number;
  };
  variableCosts: {
    productsPerService: number;
    laborPerHour: number;
    equipmentDepreciation: number;
  };
  operational: {
    servicesPerMonth: number;
    avgServiceDurationHours: number;
    minimumMarginPercent: number;
  };
  revenueHistory: Array<{
    id: string;
    date: string;
    clientName: string;
    serviceType: string;
    pestType: string;
    finalPrice: number;
    estimatedCost: number;
    margin: number;
  }>;
  costHistory?: Array<{
    id: string;
    date: string;
    type: string;
    value: number;
    quoteRef: string;
  }>;
  movements?: FinancialMovement[];           // Plano de Contas / Movimentações
}

export interface InventoryProduct {
  id: string;
  name: string;
  category: string; // 'inseticida' | 'raticida' | 'fungicida' | 'outros'
  unit: string;     // 'ml' | 'g' | 'kg' | 'L' | 'unidade'
  quantity: number;
  minQuantity: number;
  idealQuantity?: number;
  costPerUnit: number;
  supplier: string;
  lastUpdated?: string;
  // DDSulf Smart parameters
  chemicalGroup?: string;     // Grupo Químico
  activeIngredient?: string;  // Princípio Ativo
  productGroup?: string;      // Grupo de Produto
  lot?: string;               // Lote de fabricação
  expiryDate?: string;        // Data de validade
}

export interface InventoryMovement {
  id: string;
  date: string;
  productId: string;
  type: 'entrada' | 'saida';
  quantity: number;
  reason: string;
  quoteId?: string;
  lot?: string;
  expiryDate?: string;
}

export interface InventoryState {
  products: InventoryProduct[];
  movements: InventoryMovement[];
}

export interface POPRequiredProduct {
  productId: string;
  productName: string;
  quantityPer100m2: number;
  unit: string;
}

export interface POPProcedure {
  id: string;
  name: string;
  pestType: string;
  serviceType: string;
  requiredProducts: POPRequiredProduct[];
  estimatedTimeHoursPer100m2: number;
  fileUrl?: string;
  fileName?: string;
  instructions: string;
  createdAt: string;
}

export interface POPsState {
  procedures: POPProcedure[];
}

export interface QuoteClient {
  name: string;
  address: string;
  phone?: string;
}

export interface QuoteService {
  pestType: string;
  serviceType: string;
  areaM2: number;
  distanceKm: number;
}

export interface QuoteCosts {
  products: number;
  labor: number;
  transport: number;
  overhead: number;
  total: number;
}

export interface QuotePricing {
  suggestedPrice: number;
  finalPrice: number;
  marginPercent: number;
  marginPercentOriginal?: number;
}

export interface QuoteProductUsed {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
}

export interface DREBreakdown {
  fixedCostShare: number;
  variableCost: number;
  totalCost: number;
  netMargin: number;
  netMarginPercent: number;
  transportSavings?: number;
}

export interface Quote {
  id: string;
  createdAt: string;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'executado' | 'retorno';
  client: QuoteClient;
  service: QuoteService;
  costs: QuoteCosts;
  pricing: QuotePricing;
  productsUsed: QuoteProductUsed[];
  inventoryDeducted: boolean;
  confirmedAt?: string;           // ISO timestamp da confirmação do serviço
  isRetorno?: boolean;            // true se for retorno gratuito
  parentQuoteId?: string;         // ID do orçamento original vinculado ao retorno
  returnCost?: number;            // custo estimado do retorno (deslocamento + MO)
  confirmedBy?: string;           // nome/identificador de quem confirmou
  scheduledDate?: string;   // YYYY-MM-DD — data combinada com o cliente
  scheduledTime?: string;   // HH:MM — horário combinado com o cliente
  scheduledTechnician?: string; // nome do técnico designado
  serviceNotes?: string;          // observações do técnico no ato da confirmação
  hasReturn?: boolean;            // true se possui retorno associado/ativo
  dreBreakdown?: DREBreakdown;
}

export interface QuotesState {
  list: Quote[];
}

export interface Client {
  id: string;
  name: string;
  cnpjCpf: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  value: number;
  recurrentValue: number;
  status: 'ativo' | 'vencido' | 'cancelado';
  startDate: string;
  endDate: string;
  recurrencyMonths: number;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'tecnico' | 'vendedor' | 'admin' | 'gerente' | 'supervisor' | 'comercial' | 'administrativo';
  phone?: string;
  email?: string;
  active: boolean;
  specialties?: string[];
  color?: string;
}

export const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 'emp-01', name: 'Carlos Eduardo', role: 'tecnico', phone: '(24) 99811-2020', active: true, specialties: ['Dedetização', 'Desratização'] },
  { id: 'emp-02', name: 'Roberto Mendes', role: 'tecnico', phone: '(24) 99822-3030', active: true, specialties: ['Descupinização', 'Sanitização'] },
  { id: 'emp-03', name: 'Gabriel Silva', role: 'tecnico', phone: '(24) 99833-4040', active: true, specialties: ['Dedetização', 'Controle Integrado'] },
  { id: 'emp-04', name: 'Marcos Souza', role: 'vendedor', phone: '(24) 99844-5050', active: true, specialties: ['Comercial', 'Inspeção'] },
  { id: 'emp-05', name: 'Admin Demo', role: 'admin', phone: '(24) 99855-6060', active: true, specialties: ['Gestão', 'SecOps'] },
];

export interface AgendaEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  clientId?: string;
  clientName: string;
  type: 'servico' | 'visita' | 'retorno' | 'recorrencia' | 'renovacao_contrato' | 'outro';
  quoteId?: string;
  employeeId?: string;
  technicianName?: string;
  notes?: string;
  status: 'confirmado' | 'pendente' | 'realizado';
}

export interface PurchaseRequisition {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  idealStock: number;
  quantityToBuy: number;
  status: 'Pendente' | 'Solicitado' | 'Comprado' | 'Recebido';
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  companyName: string;
  cnpj: string;
  headquartersAddress: string;
  city: string;
  state: string;
  phone: string;
  maxReturnRatePercent?: number;
  ipcaReferencePercent?: number; // default 4.6
  operationalGoals: {
    targetServicesPerMonth: number;
    minimumMarginPercent: number;
    costPerKm: number;
    variableExpensesPercent?: number;
    minMarginPercent?: number;
    targetMarginPercent?: number;
    costPerHour?: number;
    equipmentAmortization?: number;
  };
}

export interface AgendaRoute {
  id: string;
  date: string; // YYYY-MM-DD
  cityKey: string;
  employeeId?: string;
  stopEventIds: string[];
  totalDistanceKm: number;
  totalTransportCost: number;
  costPerStop: Record<string, number>;
}

export interface CompanyAccount {
  name: string;
  displayName: string;
  password: string;
  financial: FinancialCostConfig;
  inventory: InventoryState;
  pops: POPsState;
  quotes: QuotesState;
  settings: SystemSettings;
  clients: Client[];
  contracts: Contract[];
  agenda: AgendaEvent[];
  purchases: PurchaseRequisition[];
  routes?: AgendaRoute[];
}

export interface SystemState {
  financial: FinancialCostConfig;
  inventory: InventoryState;
  pops: POPsState;
  quotes: QuotesState;
  settings: SystemSettings;
  clients: Client[];
  contracts: Contract[];
  agenda: AgendaEvent[];
  purchases: PurchaseRequisition[];
  employees: Employee[];
  routes: AgendaRoute[];
  
  companies: Record<string, CompanyAccount>;
  currentCompany: string | null;
}

export interface IntelligenceAlert {
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  action?: string;
}

export interface IntelligenceReport {
  realCostPerService: number;
  breakEvenServicesPerMonth: number;
  projectedMonthlyProfit: number;
  avgMarginLast30Days: number;
  avgMarginLast90Days: number;
  marginTrend: 'subindo' | 'estável' | 'caindo';
  mostProfitablePestType: string;
  leastProfitablePestType: string;
  estimatedStockDaysRemaining: Record<string, number>;
  totalStockValue: number;
  criticalProducts: string[];
  alerts: IntelligenceAlert[];
}

export interface SystemActions {
  updateFinancialCosts: (costs: Partial<{
    fixedCosts: Partial<FinancialCostConfig['fixedCosts']>;
    variableCosts: Partial<FinancialCostConfig['variableCosts']>;
    operational: Partial<FinancialCostConfig['operational']>;
  }>) => void;
  
  addFinancialMovement: (movement: Omit<FinancialMovement, 'id'>) => void;
  updateFinancialMovement: (id: string, data: Partial<FinancialMovement>) => void;
  removeFinancialMovement: (id: string) => void;
  
  addQuote: (quote: Quote) => void;
  updateQuoteStatus: (id: string, status: Quote['status']) => void;
  scheduleApprovedQuote: (
    quoteId: string,
    scheduledDate: string,
    scheduledTime: string,
    technician: string,
    employeeId?: string
  ) => void;
  confirmServiceExecuted: (
    id: string,
    confirmedBy?: string,
    serviceNotes?: string
  ) => void;
  markAsRetorno: (
    originalQuoteId: string,
    returnCostEstimate: number,
    confirmedBy?: string,
    notes?: string
  ) => void;
  
  addInventoryProduct: (product: InventoryProduct) => void;
  updateInventoryProduct: (id: string, data: Partial<InventoryProduct>) => void;
  removeInventoryProduct: (id: string) => void;
  addInventoryMovement: (movement: InventoryMovement) => void;
  
  addPOP: (procedure: POPProcedure) => void;
  updatePOP: (id: string, data: Partial<POPProcedure>) => void;
  removePOP: (id: string) => void;
  
  // ERP INTEGRATION SYSTEM ACTIONS
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  removeClient: (id: string) => void;

  addContract: (contract: Contract) => void;
  updateContract: (id: string, data: Partial<Contract>) => void;
  removeContract: (id: string) => void;
  checkContractRenewals: () => void;

  addAgendaEvent: (event: AgendaEvent) => void;
  updateAgendaEvent: (id: string, data: Partial<AgendaEvent>) => void;
  removeAgendaEvent: (id: string) => void;
  recalculateRoutesForDate: (date: string) => void;

  addPurchaseRequisition: (req: PurchaseRequisition) => void;
  updatePurchaseStatus: (id: string, status: PurchaseRequisition['status']) => void;
  removePurchaseRequisition: (id: string) => void;
  
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  toggleEmployeeStatus: (id: string) => void;
  removeEmployee: (id: string) => void;
  
  updateSettings: (settings: Partial<SystemSettings>) => void;
  
  getDashboardKPIs: () => {
    totalRevenue: number;
    avgMargin: number;
    totalServices: number;
    ticketValue: number;
    lowStockCount: number;
    lowStockProducts: InventoryProduct[];
  };

  getIntelligenceReport: () => IntelligenceReport;

  registerCompany: (displayName: string, password: string) => { success: boolean; error?: string };
  loginCompany: (displayName: string, password: string) => { success: boolean; error?: string };
  logoutCompany: () => void;
  resetSystemData: () => void;
}

const DEFAULT_MOVEMENTS: FinancialMovement[] = [
  // RECEITAS - Maio 2026
  { id: "m-rev-01", date: "2026-05-10", description: "Serviço de Dedetização Comercial - Grupo Pão Duro", category: "RECEITAS", subcategory: "Dedetização", value: 3500.00, paymentMethod: "Boleto", costCenter: "Equipe Alfa", isPaid: true },
  { id: "m-rev-02", date: "2026-05-12", description: "Contrato Mensal - Shopping das Flores", category: "RECEITAS", subcategory: "Contratos Mensais", value: 4200.00, paymentMethod: "Pix", costCenter: "Equipe Beta", isPaid: true },
  { id: "m-rev-03", date: "2026-05-15", description: "Serviço de Desratização - Condomínio Green Park", category: "RECEITAS", subcategory: "Desratização", value: 2800.00, paymentMethod: "Pix", costCenter: "Equipe Alfa", isPaid: true },
  { id: "m-rev-04", date: "2026-05-18", description: "Sanitização de Ambientes - Clínica MedSim", category: "RECEITAS", subcategory: "Sanitização", value: 1500.00, paymentMethod: "Cartão de Crédito", costCenter: "Equipe Alfa", isPaid: true },
  { id: "m-rev-05", date: "2026-05-20", description: "Serviço de Descupinização - Residência Dr. Marcos", category: "RECEITAS", subcategory: "Descupinização", value: 5300.00, paymentMethod: "Transferência", costCenter: "Equipe Beta", isPaid: true },
  { id: "m-rev-06", date: "2026-05-22", description: "Contrato Anual - Indústria Metalnorte", category: "RECEITAS", subcategory: "Contratos Anuais", value: 12500.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: true },
  
  // CUSTOS DIRETOS
  { id: "m-cost-01", date: "2026-05-02", description: "Compra de Insumo BIFENTOL 200SC - Distribuidora Rogama", category: "CUSTOS DIRETOS", subcategory: "Produtos Químicos", value: -4500.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: true },
  { id: "m-cost-02", date: "2026-05-04", description: "Compra de Iscas Ratol Bloco - Rogama", category: "CUSTOS DIRETOS", subcategory: "Iscas", value: -2100.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: true },
  { id: "m-cost-03", date: "2026-05-05", description: "Seringas OPTIGARD LT WG - Gel Baraticida", category: "CUSTOS DIRETOS", subcategory: "Gel Baraticida", value: -1650.00, paymentMethod: "Pix", costCenter: "Geral", isPaid: true },
  { id: "m-cost-04", date: "2026-05-08", description: "Novos Pulverizadores Costais Guarany", category: "CUSTOS DIRETOS", subcategory: "Equipamentos", value: -2400.00, paymentMethod: "Cartão de Crédito", costCenter: "Geral", isPaid: true },
  { id: "m-cost-05", date: "2026-05-11", description: "Máscaras de Filtros Químicos e Luvas Nitrílicas (EPIs)", category: "CUSTOS DIRETOS", subcategory: "EPIs", value: -980.00, paymentMethod: "Pix", costCenter: "Geral", isPaid: true },
  { id: "m-cost-06", date: "2026-05-14", description: "Uniformes Personalizados DDSulf com Logo", category: "CUSTOS DIRETOS", subcategory: "Uniformes", value: -850.00, paymentMethod: "Pix", costCenter: "Geral", isPaid: true },
  
  // DESPESAS OPERACIONAIS
  { id: "m-ope-01", date: "2026-05-05", description: "Folha de pagamento - Técnicos e Auxiliares", category: "DESPESAS OPERACIONAIS", subcategory: "Salários", value: -18000.00, paymentMethod: "Transferência", costCenter: "Equipe Alfa", isPaid: true },
  { id: "m-ope-02", date: "2026-05-07", description: "Guia FGTS - Competência Abril", category: "DESPESAS OPERACIONAIS", subcategory: "Encargos", value: -1440.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: true },
  { id: "m-ope-03", date: "2026-05-07", description: "Guia INSS - Competência Abril", category: "DESPESAS OPERACIONAIS", subcategory: "Encargos", value: -4200.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: true },
  { id: "m-ope-04", date: "2026-05-05", description: "Pró-labore Sócios DDSulf", category: "DESPESAS OPERACIONAIS", subcategory: "Pró-labore", value: -9000.00, paymentMethod: "Transferência", costCenter: "Geral", isPaid: true },
  { id: "m-ope-05", date: "2026-05-15", description: "Combustível Frota - Abastecimento Semanal Posto Shell", category: "DESPESAS OPERACIONAIS", subcategory: "Combustível", value: -4300.00, paymentMethod: "Pix", costCenter: "Veículo 01", isPaid: true },
  { id: "m-ope-06", date: "2026-05-18", description: "Pedágios - Viagem Atendimento Campo", category: "DESPESAS OPERACIONAIS", subcategory: "Pedágios", value: -320.00, paymentMethod: "Sem Parar", costCenter: "Veículo 02", isPaid: true },
  { id: "m-ope-07", date: "2026-05-10", description: "Pneus novos e Alinhamento de Veículo Pajero", category: "DESPESAS OPERACIONAIS", subcategory: "Manutenção de Veículos", value: -1450.00, paymentMethod: "Cartão de Crédito", costCenter: "Veículo 01", isPaid: true },
  { id: "m-ope-08", date: "2026-05-12", description: "Anúncios Google Ads - Campanhas de Marketing Digital", category: "DESPESAS OPERACIONAIS", subcategory: "Marketing", value: -2800.00, paymentMethod: "Cartão de Crédito", costCenter: "Geral", isPaid: true },
  { id: "m-ope-09", date: "2026-05-13", description: "Fatura Telefone Fixo e Chips Equipe Móvel", category: "DESPESAS OPERACIONAIS", subcategory: "Telefonia", value: -380.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: true },
  { id: "m-ope-10", date: "2026-05-15", description: "Internet Banda Larga Fibra Copel", category: "DESPESAS OPERACIONAIS", subcategory: "Internet", value: -150.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: true },

  // DESPESAS ADMINISTRATIVAS
  { id: "m-adm-01", date: "2026-05-10", description: "Aluguel da Sede Comercial - Imobiliária Sul", category: "DESPESAS ADMINISTRATIVAS", subcategory: "Aluguel", value: -3500.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: true },
  { id: "m-adm-02", date: "2026-05-14", description: "Fatura Copel - Consumo de Energia Elétrica", category: "DESPESAS ADMINISTRATIVAS", subcategory: "Energia", value: -780.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: true },
  { id: "m-adm-03", date: "2026-05-14", description: "Tarifa de Saneamento - Água Sabesp", category: "DESPESAS ADMINISTRATIVAS", subcategory: "Água", value: -120.00, paymentMethod: "Pix", costCenter: "Geral", isPaid: true },
  { id: "m-adm-04", date: "2026-05-08", description: "Papel Hectográfico, Envelopes e Material Administrativo", category: "DESPESAS ADMINISTRATIVAS", subcategory: "Material de Escritório", value: -220.00, paymentMethod: "Pix", costCenter: "Geral", isPaid: true },
  { id: "m-adm-05", date: "2026-05-01", description: "Mensalidade do ERP de Gestão e Emissor de Notas", category: "DESPESAS ADMINISTRATIVAS", subcategory: "Sistemas", value: -450.00, paymentMethod: "Pix", costCenter: "Geral", isPaid: true },
  { id: "m-adm-06", date: "2026-05-05", description: "Honorários Contabilidade Mensal", category: "DESPESAS ADMINISTRATIVAS", subcategory: "Contabilidade", value: -980.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: true },

  // DESPESAS FINANCEIRAS
  { id: "m-fin-01", date: "2026-05-20", description: "Parcela Banco Itaú - Financiamento de Capital de Giro", category: "DESPESAS FINANCEIRAS", subcategory: "Empréstimos", value: -3800.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: true },
  { id: "m-fin-02", date: "2026-05-20", description: "Juros sobre Atraso de Fornecedores", category: "DESPESAS FINANCEIRAS", subcategory: "Juros", value: -150.00, paymentMethod: "Pix", costCenter: "Geral", isPaid: true },
  { id: "m-fin-03", date: "2026-05-30", description: "Tarifas de Manutenção de Conta CNPJ", category: "DESPESAS FINANCEIRAS", subcategory: "Tarifas Bancárias", value: -89.00, paymentMethod: "Débito Automático", costCenter: "Geral", isPaid: true },
  
  // IMPOSTOS
  { id: "m-tax-01", date: "2026-05-20", description: "DAS Simples Nacional - Competência Abril", category: "IMPOSTOS", subcategory: "Simples Nacional", value: -4800.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: true },
  { id: "m-tax-02", date: "2026-05-22", description: "Alvará de Funcionamento Municipal", category: "IMPOSTOS", subcategory: "Taxas Municipais", value: -280.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: true },

  // OVERDUE / ALERTS ENTRIES
  { id: "m-alert-overdue-1", date: "2026-05-20", description: "Fatura Google Ads pendente", category: "DESPESAS OPERACIONAIS", subcategory: "Marketing", value: -1200.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: false, dueDate: "2026-05-25" },
  { id: "m-alert-overdue-2", date: "2026-05-18", description: "Parcela Financiamento Banco do Brasil", category: "DESPESAS FINANCEIRAS", subcategory: "Empréstimos", value: -4600.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: false, dueDate: "2026-05-22" },
  { id: "m-alert-contract-1", date: "2026-06-05", description: "Renovação Contrato Anual Hospital Geral", category: "RECEITAS", subcategory: "Contratos Anuais", value: 8500.00, paymentMethod: "Boleto", costCenter: "Geral", isPaid: false, dueDate: "2026-06-15" }
];

const defaultMonth = new Date().toISOString().slice(0, 7);
const expDate10Days = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);

const DEFAULT_QUOTES: Quote[] = [
  {
    id: "q-exec-01",
    createdAt: `${defaultMonth}-05`,
    status: "executado",
    confirmedAt: `${defaultMonth}-05T14:30:00Z`,
    confirmedBy: "Carlos Eduardo",
    scheduledTechnician: "Carlos Eduardo",
    client: {
      name: "Grupo Pão Duro",
      address: "Av. Paulista, 100 - São Paulo - SP",
      phone: "(11) 98765-4321"
    },
    service: {
      pestType: "Dedetização",
      serviceType: "Dedetização Geral",
      areaM2: 150,
      distanceKm: 12
    },
    costs: { products: 120, labor: 180, transport: 60, overhead: 40, total: 400 },
    pricing: { suggestedPrice: 650, marginPercent: 38.46, finalPrice: 650 },
    productsUsed: [
      { productId: "prod-01", productName: "BIFENTOL 200SC", quantity: 150, unit: "ml" }
    ],
    inventoryDeducted: true,
    hasReturn: true
  },
  {
    id: "q-exec-02",
    createdAt: `${defaultMonth}-10`,
    status: "executado",
    confirmedAt: `${defaultMonth}-10T16:00:00Z`,
    confirmedBy: "Mariana Souza",
    scheduledTechnician: "Mariana Souza",
    client: {
      name: "Condomínio Green Park",
      address: "Al. das Palmeiras, 192 - Volta Redonda - RJ",
      phone: "(24) 3340-9900"
    },
    service: {
      pestType: "Desratização",
      serviceType: "Desratização Completa",
      areaM2: 300,
      distanceKm: 8
    },
    costs: { products: 180, labor: 220, transport: 50, overhead: 50, total: 500 },
    pricing: { suggestedPrice: 950, marginPercent: 47.37, finalPrice: 950 },
    productsUsed: [
      { productId: "prod-02", productName: "Ratol Bloco Isquicida", quantity: 200, unit: "g" }
    ],
    inventoryDeducted: true,
    hasReturn: false
  },
  {
    id: "q-exec-03",
    createdAt: `${defaultMonth}-15`,
    status: "executado",
    confirmedAt: `${defaultMonth}-15T11:00:00Z`,
    confirmedBy: "Carlos Eduardo",
    scheduledTechnician: "Carlos Eduardo",
    client: {
      name: "Shopping das Flores",
      address: "Rua das Flores, 450 - Curitiba - PR",
      phone: "(41) 3222-1111"
    },
    service: {
      pestType: "Descupinização",
      serviceType: "Tratamento de Barreira Química",
      areaM2: 500,
      distanceKm: 25
    },
    costs: { products: 450, labor: 500, transport: 120, overhead: 100, total: 1170 },
    pricing: { suggestedPrice: 2200, marginPercent: 46.81, finalPrice: 2200 },
    productsUsed: [
      { productId: "prod-04", productName: "Termidor 25 CE", quantity: 1500, unit: "ml" }
    ],
    inventoryDeducted: true,
    hasReturn: false
  },
  {
    id: "q-ret-01",
    createdAt: `${defaultMonth}-18`,
    status: "retorno",
    isRetorno: true,
    parentQuoteId: "q-exec-01",
    returnCost: 180,
    confirmedBy: "Mariana Souza",
    scheduledTechnician: "Mariana Souza",
    client: {
      name: "Grupo Pão Duro",
      address: "Av. Paulista, 100 - São Paulo - SP",
      phone: "(11) 98765-4321"
    },
    service: {
      pestType: "Dedetização (Retorno)",
      serviceType: "Retorno Técnico de Garantia",
      areaM2: 150,
      distanceKm: 12
    },
    costs: { products: 60, labor: 90, transport: 30, overhead: 0, total: 180 },
    pricing: { suggestedPrice: 0, marginPercent: 0, finalPrice: 0 },
    productsUsed: [
      { productId: "prod-01", productName: "BIFENTOL 200SC", quantity: 50, unit: "ml" }
    ],
    inventoryDeducted: true,
    serviceNotes: "Reforço de barreira em caixas de gordura do refeitório."
  }
];

const INITIAL_STATE: SystemState = {
  financial: {
    fixedCosts: {
      vehicleRental: 3500,
      salaries: 18000,
      rent: 3500,
      fuel: 4300,
      insurance: 1200,
      other: 1500,
    },
    variableCosts: {
      productsPerService: 15,
      laborPerHour: 25,
      equipmentDepreciation: 5,
    },
    operational: {
      servicesPerMonth: 120,
      avgServiceDurationHours: 3,
      minimumMarginPercent: 35,
    },
    revenueHistory: [],
    costHistory: [],
    movements: DEFAULT_MOVEMENTS,
  },
  inventory: {
    products: [
      {
        id: "prod-01",
        name: "BIFENTOL 200SC",
        category: "inseticida",
        unit: "ml",
        quantity: 2500,
        minQuantity: 1000,
        costPerUnit: 1.80,
        supplier: "Distribuidora Rogama",
        chemicalGroup: "Piretroide",
        activeIngredient: "Bifentrina 20,0%",
        productGroup: "Concentrado Emulsionável"
      },
      {
        id: "prod-02",
        name: "Ratol Bloco Isquicida",
        category: "raticida",
        unit: "g",
        quantity: 800,
        minQuantity: 1200,
        costPerUnit: 0.12,
        supplier: "Rogama Insumos Ltda",
        chemicalGroup: "Cumarínico anticoagulante",
        activeIngredient: "Brodifacoum 0,005%",
        productGroup: "Isca Extrudada em Bloco"
      },
      {
        id: "prod-03",
        name: "Gel Optigard LT WG",
        category: "inseticida",
        unit: "unidade",
        quantity: 20,
        minQuantity: 15,
        costPerUnit: 48.00,
        supplier: "Syngenta Proteção",
        chemicalGroup: "Neonicotinoide",
        activeIngredient: "Tiametoxam 0,10%",
        productGroup: "Gel pronto uso"
      },
      {
        id: "prod-04",
        name: "Termidor 25 CE",
        category: "inseticida",
        unit: "L",
        quantity: 12,
        minQuantity: 10,
        costPerUnit: 185.00,
        supplier: "BASF Agro",
        chemicalGroup: "Pirazol",
        activeIngredient: "Fipronil 2,5%",
        productGroup: "Inibidor de GABA"
      }
    ],
    movements: []
  },
  pops: {
    procedures: [
      {
        id: "pop-01",
        name: "Desinsetização Premium contra Baratas",
        pestType: "baratas",
        serviceType: "dedetizacao",
        requiredProducts: [
          { productId: "prod-03", productName: "Gel Optigard LT WG", quantityPer100m2: 2, unit: "unidade" },
          { productId: "prod-01", productName: "BIFENTOL 200SC", quantityPer100m2: 50, unit: "ml" }
        ],
        estimatedTimeHoursPer100m2: 1.5,
        instructions: "Calçar luvas de nitrila, óculos de segurança contra respingos e respirador semifacial com filtro de carvão ativado. Aplicar gel baraticida em frestas e fendas de cozinhas e despensas. Pulverizar solução de Bifentol nas superfícies de rodapés e caixas de gordura.",
        createdAt: "2026-05-01"
      },
      {
        id: "pop-02",
        name: "Desratização Completa com Iscagem Perimetral",
        pestType: "ratos",
        serviceType: "desratizacao",
        requiredProducts: [
          { productId: "prod-02", productName: "Ratol Bloco Isquicida", quantityPer100m2: 100, unit: "g" }
        ],
        estimatedTimeHoursPer100m2: 1.2,
        instructions: "Fazer triagem visual de tocas e fontes de alimento. Posicionar blocos de Ratol paracatando caixas iscadoras lacradas. Mapear pontos e fixá-los com arame em ambientes fechados.",
        createdAt: "2026-05-02"
      },
      {
        id: "pop-03",
        name: "Tratamento de Barreira Química contra Cupim de Solo",
        pestType: "cupins",
        serviceType: "descupinizacao",
        requiredProducts: [
          { productId: "prod-04", productName: "Termidor 25 CE", quantityPer100m2: 1.5, unit: "L" }
        ],
        estimatedTimeHoursPer100m2: 2.5,
        instructions: "Furar solo a cada 30cm no perímetro atacado. Injetar calda preparada de Termidor. Calçar EPI completo, incluindo macacão tyvek e máscara facial.",
        createdAt: "2026-05-03"
      }
    ]
  },
  quotes: {
    list: DEFAULT_QUOTES
  },
  clients: [
    { id: "c-01", name: "Grupo Pão Duro", cnpjCpf: "12.345.678/0001-90", address: "Av. Paulista, 100 - São Paulo - SP", phone: "(11) 98765-4321", email: "contato@paoduro.com.br", createdAt: "2026-05-10" },
    { id: "c-02", name: "Shopping das Flores", cnpjCpf: "98.765.432/0001-10", address: "Rua das Flores, 450 - Curitiba - PR", phone: "(41) 3222-1111", email: "adm@shoppingflores.com.br", createdAt: "2026-05-12" },
    { id: "c-03", name: "Condomínio Green Park", cnpjCpf: "55.444.333/0001-22", address: "Al. das Palmeiras, 192 - Volta Redonda - RJ", phone: "(24) 3340-9900", email: "portaria@greenpark.com.br", createdAt: "2026-05-15" },
    { id: "c-04", name: "Clínica MedSim", cnpjCpf: "11.222.333/0001-44", address: "Rua da Saúde, 80 - Volta Redonda - RJ", phone: "(24) 3348-1234", email: "faturamento@medsim.com.br", createdAt: "2026-05-18" },
    { id: "c-05", name: "Residência Dr. Marcos", cnpjCpf: "222.333.444-55", address: "Rua das Laranjeiras, 15 - Volta Redonda - RJ", phone: "(24) 99988-7766", email: "marcos@gmail.com", createdAt: "2026-05-20" },
    { id: "c-06", name: "Indústria Metalnorte", cnpjCpf: "77.888.999/0001-11", address: "Rodovia BR-393, Km 5 - Barra Mansa - RJ", phone: "(24) 3320-4000", email: "suprimentos@metalnorte.com.br", createdAt: "2026-05-22" }
  ],
  contracts: [
    { id: "contr-01", clientId: "c-02", clientName: "Shopping das Flores", title: "Contrato de CIP (Controle Inteligente)", value: 50400.00, recurrentValue: 4200.00, status: "ativo", startDate: "2026-01-10", endDate: "2027-01-10", recurrencyMonths: 1, createdAt: "2026-01-10" },
    { id: "contr-02", clientId: "c-06", clientName: "Indústria Metalnorte", title: "Contrato Anual Controle de Pragas", value: 12500.00, recurrentValue: 12500.00, status: "ativo", startDate: "2026-05-22", endDate: "2027-05-22", recurrencyMonths: 12, createdAt: "2026-05-22" },
    { id: "contr-03", clientId: "c-03", clientName: "Condomínio Green Park", title: "Plano Anual de Controle de Roedores", value: 33600.00, recurrentValue: 2800.00, status: "vencido", startDate: "2025-05-01", endDate: "2026-05-01", recurrencyMonths: 1, createdAt: "2025-05-01" },
    { id: "contr-04", clientId: "c-04", clientName: "Clínica MedSim", title: "Contrato Mensal de Sanitização", value: 18000.00, recurrentValue: 1500.00, status: "ativo", startDate: "2025-08-01", endDate: expDate10Days, recurrencyMonths: 1, createdAt: "2025-08-01" }
  ],
  agenda: [
    { id: "ev-01", title: "Ordem de Serviço #m-rev-01 - Dedetização", date: "2026-05-10", clientId: "c-01", clientName: "Grupo Pão Duro", type: "servico", quoteId: "q-rev-01", notes: "Dedetização inicial concluída com sucesso.", status: "realizado" },
    { id: "ev-02", title: "Ordem de Serviço #m-rev-03 - Desratização", date: "2026-05-15", clientId: "c-03", clientName: "Condomínio Green Park", type: "servico", quoteId: "q-rev-03", notes: "Instalação de blocos para ratos concluída.", status: "realizado" },
    { id: "ev-03", title: "Visita Trimestral de Monitoramento", date: "2026-06-05", clientId: "c-02", clientName: "Shopping das Flores", type: "visita", notes: "Monitorar nível de iscas consumidas nas caixas.", status: "pendente" },
    { id: "ev-04", title: "Controle de Baratas e Sanitização", date: "2026-06-12", clientId: "c-04", clientName: "Clínica MedSim", type: "servico", notes: "Aplicação conjunta de gel de frestas e pulverização bifentol.", status: "pendente" }
  ],
  purchases: [
    { id: "purch-01", productId: "prod-02", productName: "Ratol Bloco Isquicida", currentStock: 800, minStock: 1200, idealStock: 3000, quantityToBuy: 2200, status: "Pendente", createdAt: "2026-05-28", updatedAt: "2026-05-28" },
    { id: "purch-02", productId: "prod-01", productName: "BIFENTOL 200SC", currentStock: 2500, minStock: 1000, idealStock: 5000, quantityToBuy: 2500, status: "Recebido", createdAt: "2026-05-02", updatedAt: "2026-05-05" }
  ],
  employees: DEFAULT_EMPLOYEES,
  routes: [],
  settings: {
    companyName: 'DDSulf Dedetizadora',
    cnpj: '00.000.000/0001-00',
    headquartersAddress: 'Rua 33, 120 - Vila Santa Cecília, Volta Redonda - RJ',
    city: 'Volta Redonda',
    state: 'RJ',
    phone: '(24) 3344-5566',
    maxReturnRatePercent: 8,
    ipcaReferencePercent: 4.6,
    operationalGoals: {
      targetServicesPerMonth: 120,
      minimumMarginPercent: 35,
      costPerKm: 0,
      variableExpensesPercent: 15,
      minMarginPercent: 20,
      targetMarginPercent: 35,
      costPerHour: 0,
      equipmentAmortization: 0
    }
  },
  companies: {},
  currentCompany: null
};

const updateCompanyData = (state: any, updates: Partial<SystemState>) => {
  const nextFinancial = updates.financial !== undefined ? updates.financial : state.financial;
  const nextInventory = updates.inventory !== undefined ? updates.inventory : state.inventory;
  const nextPops = updates.pops !== undefined ? updates.pops : state.pops;
  const nextQuotes = updates.quotes !== undefined ? updates.quotes : state.quotes;
  const nextSettings = updates.settings !== undefined ? updates.settings : state.settings;
  const nextClients = updates.clients !== undefined ? updates.clients : state.clients;
  const nextContracts = updates.contracts !== undefined ? updates.contracts : state.contracts;
  const nextAgenda = updates.agenda !== undefined ? updates.agenda : state.agenda;
  const nextPurchases = updates.purchases !== undefined ? updates.purchases : state.purchases;
  const nextRoutes = updates.routes !== undefined ? updates.routes : (state.routes || []);

  const nextState: any = {
    ...updates,
    clients: nextClients,
    contracts: nextContracts,
    agenda: nextAgenda,
    purchases: nextPurchases,
    routes: nextRoutes,
  };

  if (state.currentCompany && state.companies && state.companies[state.currentCompany]) {
    nextState.companies = {
      ...state.companies,
      [state.currentCompany]: {
        ...state.companies[state.currentCompany],
        financial: nextFinancial,
        inventory: nextInventory,
        pops: nextPops,
        quotes: nextQuotes,
        settings: nextSettings,
        clients: nextClients,
        contracts: nextContracts,
        agenda: nextAgenda,
        purchases: nextPurchases,
        routes: nextRoutes,
      }
    };
  }

  return nextState;
};

export function computeRoutesForDate(date: string, state: SystemState): AgendaRoute[] {
  if (!date) return [];
  const dateEvents = (state.agenda || []).filter(e => {
    if (e.date !== date) return false;
    const st = (e.status || '').toLowerCase();
    return st !== 'cancelado' && st !== 'cancelled';
  });

  const getEventAddress = (ev: AgendaEvent): string => {
    if (ev.quoteId) {
      const quote = (state.quotes?.list || []).find(q => q.id === ev.quoteId);
      if (quote?.client?.address) return quote.client.address;
    }
    if (ev.clientId) {
      const client = (state.clients || []).find(c => c.id === ev.clientId);
      if (client?.address) return client.address;
    }
    return ev.notes || ev.title || '';
  };

  const groupedByCity: Record<string, AgendaEvent[]> = {};
  for (const ev of dateEvents) {
    const addr = getEventAddress(ev);
    const cityKey = resolveCityFromAddress(addr);
    if (cityKey) {
      if (!groupedByCity[cityKey]) groupedByCity[cityKey] = [];
      groupedByCity[cityKey].push(ev);
    }
  }

  const hqAddr = state.settings?.headquartersAddress || state.settings?.city || 'volta redonda';
  const hqCoords: [number, number] = getCityCoordinates(hqAddr) || [-22.5231, -44.1041];
  const costPerKm = state.settings?.operationalGoals?.costPerKm || 2.40;

  const newRoutes: AgendaRoute[] = [];

  for (const [cityKey, stops] of Object.entries(groupedByCity)) {
    if (stops.length < 2) continue;

    const stopEventIds = stops.map(s => s.id);
    const stopCoordsList: [number, number][] = stops.map(ev => {
      const addr = getEventAddress(ev);
      return getCityCoordinates(addr) || getCityCoordinates(cityKey) || [-22.5442, -44.1800];
    });

    let totalDistanceKm = haversineKm(hqCoords, stopCoordsList[0]);
    for (let i = 0; i < stopCoordsList.length - 1; i++) {
      const seg = haversineKm(stopCoordsList[i], stopCoordsList[i + 1]);
      totalDistanceKm += seg === 0 ? 2.0 : seg;
    }
    totalDistanceKm += haversineKm(stopCoordsList[stopCoordsList.length - 1], hqCoords);
    totalDistanceKm = Math.round(totalDistanceKm * 100) / 100;

    const totalTransportCost = Math.round(totalDistanceKm * costPerKm * 100) / 100;
    const costPerStopVal = Math.round((totalTransportCost / stops.length) * 100) / 100;

    const costPerStop: Record<string, number> = {};
    stopEventIds.forEach(id => {
      costPerStop[id] = costPerStopVal;
    });

    const commonEmpId = stops.every(s => s.employeeId && s.employeeId === stops[0].employeeId)
      ? stops[0].employeeId
      : undefined;

    newRoutes.push({
      id: `route-${date}-${cityKey.replace(/\s+/g, '_')}`,
      date,
      cityKey,
      employeeId: commonEmpId,
      stopEventIds,
      totalDistanceKm,
      totalTransportCost,
      costPerStop
    });
  }

  return newRoutes;
}

export const useSystemStore = create<SystemState & SystemActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      updateFinancialCosts: (costs) => set((state) => {
        const nextFixed = costs.fixedCosts ? { ...state.financial.fixedCosts, ...costs.fixedCosts } : state.financial.fixedCosts;
        const nextVariable = costs.variableCosts ? { ...state.financial.variableCosts, ...costs.variableCosts } : state.financial.variableCosts;
        const nextOperational = costs.operational ? { ...state.financial.operational, ...costs.operational } : state.financial.operational;

        return updateCompanyData(state, {
          financial: {
            ...state.financial,
            fixedCosts: nextFixed,
            variableCosts: nextVariable,
            operational: nextOperational,
          }
        });
      }),

      addFinancialMovement: (movement) => set((state) => {
        const nanoid = () => Math.random().toString(36).substring(2, 11);
        const newMov: FinancialMovement = {
          ...movement,
          id: `m-${nanoid()}`
        };
        const updatedMovements = [newMov, ...(state.financial.movements || [])];
        return updateCompanyData(state, {
          financial: {
            ...state.financial,
            movements: updatedMovements
          }
        });
      }),

      updateFinancialMovement: (id, data) => set((state) => {
        const updatedMovements = (state.financial.movements || []).map(m => 
          m.id === id ? { ...m, ...data } : m
        );
        return updateCompanyData(state, {
          financial: {
            ...state.financial,
            movements: updatedMovements
          }
        });
      }),

      removeFinancialMovement: (id) => set((state) => {
        const updatedMovements = (state.financial.movements || []).filter(m => m.id !== id);
        return updateCompanyData(state, {
          financial: {
            ...state.financial,
            movements: updatedMovements
          }
        });
      }),

      addQuote: (quote) => set((state) => {
        // Prepare updated quote
        let finalQuote = { ...quote };
        let updatedProducts = [...state.inventory.products];
        let updatedMovements = [...state.inventory.movements];
        let updatedRevenueHistory = [...state.financial.revenueHistory];
        let updatedFinancialMovements = [...(state.financial.movements || [])];

        // Deduct inventory if status is approved/executed and not yet deducted
        if ((finalQuote.status === 'aprovado' || finalQuote.status === 'executado') && !finalQuote.inventoryDeducted) {
          finalQuote.productsUsed.forEach(used => {
            const prodIdx = updatedProducts.findIndex(p => p.id === used.productId);
            if (prodIdx > -1) {
              const prod = updatedProducts[prodIdx];
              updatedProducts[prodIdx] = {
                ...prod,
                quantity: Math.max(0, prod.quantity - used.quantity),
                lastUpdated: new Date().toISOString()
              };

              updatedMovements.push({
                id: `mov-${Math.random().toString(36).substring(2, 11)}`,
                date: new Date().toISOString(),
                productId: used.productId,
                type: 'saida',
                quantity: used.quantity,
                reason: `Baixa automática - Orçamento #${finalQuote.id} (${finalQuote.client.name})`,
                quoteId: finalQuote.id
              });
            }
          });
          finalQuote.inventoryDeducted = true;

          // Add to revenue history
          const exists = updatedRevenueHistory.some(item => item.id === finalQuote.id);
          if (!exists) {
            updatedRevenueHistory.push({
              id: finalQuote.id,
              date: finalQuote.createdAt,
              clientName: finalQuote.client.name,
              serviceType: finalQuote.service.serviceType,
              pestType: finalQuote.service.pestType,
              finalPrice: finalQuote.pricing.finalPrice,
              estimatedCost: finalQuote.costs.total,
              margin: finalQuote.pricing.marginPercent
            });
          }
        }

        // Generate projected revenue in financial movements (FLUXO 1)
        if (finalQuote.status !== 'rascunho') {
          const dateStr = finalQuote.createdAt.includes('T') ? finalQuote.createdAt.split('T')[0] : finalQuote.createdAt;
          const dueDateStr = new Date();
          dueDateStr.setDate(dueDateStr.getDate() + 15);
          const formattedDueDate = dueDateStr.toISOString().split('T')[0];

          updatedFinancialMovements.push({
            id: `proj-${finalQuote.id}`,
            date: dateStr,
            dueDate: formattedDueDate,
            description: `Previsão de Receita (Orçado) - Orçamento #${finalQuote.id}`,
            category: 'RECEITAS',
            subcategory: 'Orçamentos',
            value: finalQuote.pricing.finalPrice,
            paymentMethod: 'Boleto',
            costCenter: 'Geral',
            isPaid: finalQuote.status === 'executado',
          });
        }

        return updateCompanyData(state, {
          quotes: {
            list: [finalQuote, ...state.quotes.list]
          },
          inventory: {
            ...state.inventory,
            products: updatedProducts,
            movements: updatedMovements
          },
          financial: {
            ...state.financial,
            revenueHistory: updatedRevenueHistory,
            movements: updatedFinancialMovements
          }
        });
      }),

      updateQuoteStatus: (id, status) => set((state) => {
        let updatedProducts = [...state.inventory.products];
        let updatedMovements = [...state.inventory.movements];
        let updatedRevenueHistory = [...state.financial.revenueHistory];
        let updatedFinancialMovements = [...(state.financial.movements || [])];
        let updatedPurchases = [...(state.purchases || [])];
        let updatedClients = [...(state.clients || [])];
        let updatedAgenda = [...(state.agenda || [])];
        let updatedContracts = [...(state.contracts || [])];
        
        const nextQuotes = state.quotes.list.map((q) => {
          if (q.id === id) {
            let updatedQuote = { ...q, status };
            
            // Rollback ao recusar orçamento que já teve estoque deduzido
            if (status === 'recusado' && q.inventoryDeducted) {
              q.productsUsed.forEach(used => {
                const prodIdx = updatedProducts.findIndex(p => p.id === used.productId);
                if (prodIdx > -1) {
                  updatedProducts[prodIdx] = {
                    ...updatedProducts[prodIdx],
                    quantity: updatedProducts[prodIdx].quantity + used.quantity,
                    lastUpdated: new Date().toISOString()
                  };
                  updatedMovements.push({
                    id: `mov-${Math.random().toString(36).substring(2, 11)}`,
                    date: new Date().toISOString().split('T')[0],
                    productId: used.productId,
                    type: 'entrada',
                    quantity: used.quantity,
                    reason: `Estorno - Orçamento #${q.id} recusado`,
                    quoteId: q.id
                  });
                }
              });
              updatedQuote = { ...updatedQuote, inventoryDeducted: false };
              // Remove projeção financeira
              const projIdx = updatedFinancialMovements.findIndex(m => m.id === `proj-${q.id}`);
              if (projIdx > -1) updatedFinancialMovements.splice(projIdx, 1);
              // Remove do histórico de receita
              updatedRevenueHistory = updatedRevenueHistory.filter(r => r.id !== q.id);
            }
            
            // Deduct inventory if transitioning to approved or executed and has not been deducted yet
            const isTargetStatus = status === 'aprovado' || status === 'executado';
            if (isTargetStatus && !updatedQuote.inventoryDeducted) {
              updatedQuote.productsUsed.forEach(used => {
                const prodIdx = updatedProducts.findIndex(p => p.id === used.productId);
                if (prodIdx > -1) {
                  const prod = updatedProducts[prodIdx];
                  const nextQty = Math.max(0, prod.quantity - used.quantity);
                  updatedProducts[prodIdx] = {
                    ...prod,
                    quantity: nextQty,
                    lastUpdated: new Date().toISOString()
                  };

                  updatedMovements.push({
                    id: `mov-${Math.random().toString(36).substring(2, 11)}`,
                    date: new Date().toISOString().split('T')[0],
                    productId: used.productId,
                    type: 'saida',
                    quantity: used.quantity,
                    reason: `Baixa automática - Orçamento #${updatedQuote.id} (${updatedQuote.client.name})`,
                    quoteId: updatedQuote.id
                  });

                  // Trigger low stock check
                  const idealQty = prod.minQuantity * 2.5;
                  if (nextQty <= prod.minQuantity) {
                    const alreadyRequested = updatedPurchases.some(
                      req => req.productId === prod.id && req.status === 'Pendente'
                    );
                    if (!alreadyRequested) {
                      updatedPurchases.unshift({
                        id: `purch-${Math.random().toString(36).substring(2, 11)}`,
                        productId: prod.id,
                        productName: prod.name,
                        currentStock: nextQty,
                        minStock: prod.minQuantity,
                        idealStock: idealQty,
                        quantityToBuy: idealQty - nextQty,
                        status: 'Pendente',
                        createdAt: new Date().toISOString().split('T')[0],
                        updatedAt: new Date().toISOString()
                      });
                    }
                  }
                }
              });
              updatedQuote.inventoryDeducted = true;
            }

            // Sync with financial revenue history if status is approved/executed
            if (isTargetStatus) {
              const exists = updatedRevenueHistory.some(item => item.id === updatedQuote.id);
              if (!exists) {
                updatedRevenueHistory.push({
                  id: updatedQuote.id,
                  date: updatedQuote.createdAt,
                  clientName: updatedQuote.client.name,
                  serviceType: updatedQuote.service.serviceType,
                  pestType: updatedQuote.service.pestType,
                  finalPrice: updatedQuote.pricing.finalPrice,
                  estimatedCost: updatedQuote.costs.total,
                  margin: updatedQuote.pricing.marginPercent
                });
              }

              // Update/Create financial projection movement
              const projIdx = updatedFinancialMovements.findIndex(m => m.id === `proj-${updatedQuote.id}`);
              if (projIdx > -1) {
                updatedFinancialMovements[projIdx] = {
                  ...updatedFinancialMovements[projIdx],
                  description: `Receita Confirmada (Aprovado) - Orçamento #${updatedQuote.id}`,
                  isPaid: status === 'executado'
                };
              } else {
                updatedFinancialMovements.push({
                  id: `proj-${updatedQuote.id}`,
                  date: updatedQuote.createdAt.split('T')[0],
                  dueDate: new Date().toISOString().split('T')[0],
                  description: `Receita Confirmada (Aprovado) - Orçamento #${updatedQuote.id}`,
                  category: 'RECEITAS',
                  subcategory: 'Orçamentos',
                  value: updatedQuote.pricing.finalPrice,
                  paymentMethod: 'Boleto',
                  costCenter: 'Geral',
                  isPaid: status === 'executado',
                });
              }

              // Auto-create client (Fluxo 2)
              const clientExists = updatedClients.some(
                c => c.name.toLowerCase() === updatedQuote.client.name.toLowerCase()
              );
              let clientId = `c-${Math.random().toString(36).substring(2, 11)}`;
              if (!clientExists) {
                updatedClients.unshift({
                  id: clientId,
                  name: updatedQuote.client.name,
                  cnpjCpf: '⚠️ NÃO INFORMADO',
                  address: updatedQuote.client.address,
                  phone: updatedQuote.client.phone || '⚠️ NÃO INFORMADO',
                  email: '⚠️ NÃO INFORMADO',
                  createdAt: new Date().toISOString().split('T')[0]
                });
              } else {
                clientId = updatedClients.find(c => c.name.toLowerCase() === updatedQuote.client.name.toLowerCase())?.id || clientId;
              }

              // Create OS in Agenda Event
              const eventExists = updatedAgenda.some(e => e.quoteId === updatedQuote.id);
              if (!eventExists && updatedQuote.scheduledDate) {
                // Só cria evento se tiver data agendada
                updatedAgenda.unshift({
                  id: `ev-${Math.random().toString(36).substring(2, 11)}`,
                  title: `OS - ${updatedQuote.service.serviceType} (${updatedQuote.client.name})`,
                  date: updatedQuote.scheduledDate,
                  time: updatedQuote.scheduledTime,
                  clientId,
                  clientName: updatedQuote.client.name,
                  type: 'servico',
                  quoteId: updatedQuote.id,
                  notes: `Técnico: ${updatedQuote.scheduledTechnician || 'A definir'} | ${updatedQuote.client.address}`,
                  status: 'pendente'
                });
              }
              // Se não tem scheduledDate, o quote fica aprovado mas sem evento na agenda.
              // O evento só é criado quando o gestor chama scheduleApprovedQuote().

              // Check and auto-create contract if recurrent (Fluxo 8 & 9)
              const contractExists = updatedContracts.some(c => c.clientId === clientId);
              if (!contractExists) {
                const pTypeContract = updatedQuote.service.pestType.toLowerCase();
                let contractRecurrencyMonths = 6;
                if (pTypeContract.includes('rato') || pTypeContract.includes('roedor')) contractRecurrencyMonths = 3;
                else if (pTypeContract.includes('cupim') || pTypeContract.includes('madeira')) contractRecurrencyMonths = 12;
                else if (pTypeContract.includes('barata')) contractRecurrencyMonths = 6;

                updatedContracts.unshift({
                  id: `contr-${Math.random().toString(36).substring(2, 11)}`,
                  clientId,
                  clientName: updatedQuote.client.name,
                  title: `Contrato Controle de Pragas - ${updatedQuote.service.pestType.toUpperCase()}`,
                  value: updatedQuote.pricing.finalPrice * (12 / contractRecurrencyMonths),
                  recurrentValue: updatedQuote.pricing.finalPrice,
                  status: 'ativo',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                  recurrencyMonths: contractRecurrencyMonths,
                  createdAt: new Date().toISOString().split('T')[0]
                });
              }
            }

            if (status === 'executado') {
              updatedQuote.dreBreakdown = calcularDREPorOS(updatedQuote, state);
            }

            return updatedQuote;
          }
          return q;
        });

        return updateCompanyData(state, {
          quotes: {
            list: nextQuotes
          },
          inventory: {
            ...state.inventory,
            products: updatedProducts,
            movements: updatedMovements
          },
          financial: {
            ...state.financial,
            revenueHistory: updatedRevenueHistory,
            movements: updatedFinancialMovements
          },
          purchases: updatedPurchases,
          clients: updatedClients,
          agenda: updatedAgenda,
          contracts: updatedContracts
        });
      }),

      scheduleApprovedQuote: (quoteId, scheduledDate, scheduledTime, technician, employeeId) =>
        set((state) => {
          const quote = state.quotes.list.find(q => q.id === quoteId);
          if (!quote) return state;

          const empId = employeeId || state.employees?.find(e => e.name.toLowerCase() === technician.toLowerCase())?.id;

          const updatedQuote = {
            ...quote,
            scheduledDate,
            scheduledTime,
            scheduledTechnician: technician
          };

          // Remover evento antigo com data errada se existir
          const cleanAgenda = state.agenda.filter(e => e.quoteId !== quoteId);

          const newEvent: AgendaEvent = {
            id: `ev-${Math.random().toString(36).substring(2, 11)}`,
            title: `OS - ${quote.service.serviceType} (${quote.client.name})`,
            date: scheduledDate,
            time: scheduledTime,
            clientId: state.clients.find(c =>
              c.name.toLowerCase() === quote.client.name.toLowerCase()
            )?.id || '',
            clientName: quote.client.name,
            type: 'servico',
            quoteId: quoteId,
            employeeId: empId,
            notes: `Técnico: ${technician} | ${quote.client.address}`,
            status: 'pendente'
          };

          const newAgenda = [newEvent, ...cleanAgenda];
          const nextState = { ...state, agenda: newAgenda };
          const newRoutes = computeRoutesForDate(scheduledDate, nextState);
          const otherRoutes = (state.routes || []).filter(r => r.date !== scheduledDate);

          return updateCompanyData(state, {
            quotes: {
              ...state.quotes,
              list: state.quotes.list.map(q => q.id === quoteId ? updatedQuote : q)
            },
            agenda: newAgenda,
            routes: [...otherRoutes, ...newRoutes]
          });
        }),

      confirmServiceExecuted: (id, confirmedBy, serviceNotes) => set((state) => {
        let updatedProducts = [...state.inventory.products];
        let updatedMovements = [...state.inventory.movements];
        let updatedRevenueHistory = [...state.financial.revenueHistory];
        let updatedFinancialMovements = [...(state.financial.movements || [])];
        let updatedPurchases = [...(state.purchases || [])];
        let updatedClients = [...(state.clients || [])];
        let updatedAgenda = [...(state.agenda || [])];
        let updatedContracts = [...(state.contracts || [])];
        
        let found = false;
        let matchedQuote: Quote | null = null;

        const nextQuotes = state.quotes.list.map((q) => {
          if (q.id === id) {
            if (q.status === 'enviado' || q.status === 'aprovado') {
              found = true;
              let updatedQuote = { 
                ...q, 
                status: 'executado' as const,
                confirmedAt: new Date().toISOString(),
                inventoryDeducted: q.inventoryDeducted,
                confirmedBy: confirmedBy || q.confirmedBy,
                serviceNotes: serviceNotes || q.serviceNotes
              };

              updatedQuote.dreBreakdown = calcularDREPorOS(updatedQuote, state);

              matchedQuote = updatedQuote;

              // Deduct stock if not yet deducted
              if (!updatedQuote.inventoryDeducted) {
                updatedQuote.productsUsed.forEach(used => {
                  const prodIdx = updatedProducts.findIndex(p => p.id === used.productId);
                  if (prodIdx > -1) {
                    const prod = updatedProducts[prodIdx];
                    const nextQty = Math.max(0, prod.quantity - used.quantity);
                    updatedProducts[prodIdx] = {
                      ...prod,
                      quantity: nextQty,
                      lastUpdated: new Date().toISOString()
                    };

                    updatedMovements.push({
                      id: `mov-${Math.random().toString(36).substring(2, 11)}`,
                      date: new Date().toISOString().split('T')[0],
                      productId: used.productId,
                      type: 'saida',
                      quantity: used.quantity,
                      reason: `Baixa automática - Orçamento #${updatedQuote.id} (${updatedQuote.client.name})`,
                      quoteId: updatedQuote.id
                    });

                    // Trigger low stock check
                    const idealQty = prod.minQuantity * 2.5;
                    if (nextQty <= prod.minQuantity) {
                      const alreadyRequested = updatedPurchases.some(
                        req => req.productId === prod.id && req.status === 'Pendente'
                      );
                      if (!alreadyRequested) {
                        updatedPurchases.unshift({
                          id: `purch-${Math.random().toString(36).substring(2, 11)}`,
                          productId: prod.id,
                          productName: prod.name,
                          currentStock: nextQty,
                          minStock: prod.minQuantity,
                          idealStock: idealQty,
                          quantityToBuy: idealQty - nextQty,
                          status: 'Pendente',
                          createdAt: new Date().toISOString().split('T')[0],
                          updatedAt: new Date().toISOString()
                        });
                      }
                    }
                  }
                });
                updatedQuote.inventoryDeducted = true;
              }

              // Add to revenue history
              const exists = updatedRevenueHistory.some(item => item.id === updatedQuote.id);
              if (!exists) {
                updatedRevenueHistory.push({
                  id: updatedQuote.id,
                  date: updatedQuote.confirmedAt || updatedQuote.createdAt,
                  clientName: updatedQuote.client.name,
                  serviceType: updatedQuote.service.serviceType,
                  pestType: updatedQuote.service.pestType,
                  finalPrice: updatedQuote.pricing.finalPrice,
                  estimatedCost: updatedQuote.costs.total,
                  margin: updatedQuote.pricing.marginPercent
                });
              }

              return updatedQuote;
            }
          }
          return q;
        });

        if (!found || !matchedQuote) return state;

        const dateStr = new Date().toISOString().split('T')[0];

        // 1. Convert/Create financial cash flow movement to 'Receita Confirmada' (isPaid: true)
        const projIdx = updatedFinancialMovements.findIndex(m => m.id === `proj-${id}`);
        if (projIdx > -1) {
          updatedFinancialMovements[projIdx] = {
            ...updatedFinancialMovements[projIdx],
            description: `Receita Confirmada - OS #${id} (${(matchedQuote as Quote).client.name})`,
            isPaid: true,
            date: dateStr
          };
        } else {
          updatedFinancialMovements.push({
            id: `proj-${id}`,
            date: dateStr,
            dueDate: dateStr,
            description: `Receita Confirmada - OS #${id} (${(matchedQuote as Quote).client.name})`,
            category: 'RECEITAS',
            subcategory: 'Orçamentos',
            value: (matchedQuote as Quote).pricing.finalPrice,
            paymentMethod: 'Pix',
            costCenter: 'Geral',
            isPaid: true,
          });
        }

        // 2. Auto-create client if not exists
        const clientExists = updatedClients.some(
          c => c.name.toLowerCase() === (matchedQuote as Quote).client.name.toLowerCase()
        );
        let currentClientId = `c-${Math.random().toString(36).substring(2, 11)}`;
        if (!clientExists) {
          updatedClients.unshift({
            id: currentClientId,
            name: (matchedQuote as Quote).client.name,
            cnpjCpf: '⚠️ NÃO INFORMADO',
            address: (matchedQuote as Quote).client.address,
            phone: (matchedQuote as Quote).client.phone || '⚠️ NÃO INFORMADO',
            email: '⚠️ NÃO INFORMADO',
            createdAt: dateStr
          });
        } else {
          currentClientId = updatedClients.find(c => c.name.toLowerCase() === (matchedQuote as Quote).client.name.toLowerCase())?.id || currentClientId;
        }

        const contractExists = updatedContracts.some(c => c.clientId === currentClientId);
        if (!contractExists) {
          const mq = matchedQuote as Quote;
          const pType = mq.service.pestType.toLowerCase();
          let recurrencyMonths = 6;
          if (pType.includes('rato') || pType.includes('roedor')) recurrencyMonths = 3;
          else if (pType.includes('cupim') || pType.includes('madeira')) recurrencyMonths = 12;
          else if (pType.includes('barata')) recurrencyMonths = 6;

          updatedContracts.unshift({
            id: `contr-${Math.random().toString(36).substring(2, 11)}`,
            clientId: currentClientId,
            clientName: mq.client.name,
            title: `Contrato Controle de Pragas - ${mq.service.pestType.toUpperCase()}`,
            value: mq.pricing.finalPrice * (12 / recurrencyMonths),
            recurrentValue: mq.pricing.finalPrice,
            status: 'ativo',
            startDate: dateStr,
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            recurrencyMonths,
            createdAt: dateStr
          });
        }

        // 3. Update the execution status in AgendaEvent
        updatedAgenda = updatedAgenda.map(item => 
          item.quoteId === id ? { ...item, status: 'realizado' } : item
        );

        // 4. Calculate Warranty and Recurrence based on pestType (Fluxo 7)
        // Definições:
        // - "ratos" (Roedores): Retorno 15 dias, Recorrência 90 dias
        // - "baratas" (Baratas): Garantia 90 dias, Recorrência 180 dias
        // - "cupins" (Cupins): Garantia 365 dias, Recorrência 365 dias
        // - outros: Garantia 90 dias, Recorrência 180 dias
        let warrantyDays = 90;
        let recurrenceDays = 180;
        const pType = (matchedQuote as Quote).service.pestType.toLowerCase();
        
        if (pType.includes('rato') || pType.includes('roedor')) {
          warrantyDays = 15;
          recurrenceDays = 90;
        } else if (pType.includes('cupim') || pType.includes('madeira')) {
          warrantyDays = 365;
          recurrenceDays = 365;
        } else if (pType.includes('barata')) {
          warrantyDays = 90;
          recurrenceDays = 180;
        }

        const addDays = (days: number): string => {
          const d = new Date();
          d.setDate(d.getDate() + days);
          return d.toISOString().split('T')[0];
        };

        const warrantyDate = addDays(warrantyDays);
        const recurrenceDate = addDays(recurrenceDays);

        // Auto-create return check event
        updatedAgenda.unshift({
          id: `ev-ret-${Math.random().toString(36).substring(2, 11)}`,
          title: `Retorno Garantia - OS #${id} (${(matchedQuote as Quote).client.name})`,
          date: warrantyDate,
          clientId: currentClientId,
          clientName: (matchedQuote as Quote).client.name,
          type: 'retorno',
          notes: `Inspeção automática de retorno de garantia (${warrantyDays} dias) para controle de ${(matchedQuote as Quote).service.pestType}.`,
          status: 'pendente'
        });

        // Auto-create service recurrence event
        updatedAgenda.unshift({
          id: `ev-rec-${Math.random().toString(36).substring(2, 11)}`,
          title: `Renovação de Serviço (Recorrência) - OS #${id} (${(matchedQuote as Quote).client.name})`,
          date: recurrenceDate,
          clientId: currentClientId,
          clientName: (matchedQuote as Quote).client.name,
          type: 'recorrencia',
          notes: `Renovação de serviço agendada devido a limite de recorrência de ${recurrenceDays} dias para ${(matchedQuote as Quote).service.pestType}.`,
          status: 'pendente'
        });

        try {
          toast.success(`Serviço #${id} confirmado como executado com sucesso!`);
        } catch (e) {
          console.warn(e);
        }

        return updateCompanyData(state, {
          quotes: {
            list: nextQuotes
          },
          inventory: {
            ...state.inventory,
            products: updatedProducts,
            movements: updatedMovements
          },
          financial: {
            ...state.financial,
            revenueHistory: updatedRevenueHistory,
            movements: updatedFinancialMovements
          },
          purchases: updatedPurchases,
          clients: updatedClients,
          agenda: updatedAgenda,
          contracts: updatedContracts
        });
      }),

      markAsRetorno: (originalQuoteId, returnCostEstimate, confirmedBy, notes) => set((state) => {
        const originalQuoteIdx = state.quotes.list.findIndex(q => q.id === originalQuoteId);
        if (originalQuoteIdx === -1) return state;
        const originalQuote = state.quotes.list[originalQuoteIdx];

        const nanoid = () => Math.random().toString(36).substring(2, 11);
        const retId = `ret-${nanoid()}`;

        const retQuote: Quote = {
          ...originalQuote,
          id: retId,
          createdAt: new Date().toISOString(),
          status: 'retorno',
          isRetorno: true,
          parentQuoteId: originalQuoteId,
          pricing: {
            ...originalQuote.pricing,
            finalPrice: 0
          },
          returnCost: returnCostEstimate,
          inventoryDeducted: false,
          confirmedBy,
          serviceNotes: notes
        };

        const originalCostTotal = Number(originalQuote.costs?.total) || 0;
        const novoCustoTotal = originalCostTotal + returnCostEstimate;
        const finalPrice = Number(originalQuote.pricing?.finalPrice) || 0;
        const newMarginPercent = finalPrice > 0 ? ((finalPrice - novoCustoTotal) / finalPrice) * 100 : 0;
        const marginPercentOriginal = originalQuote.pricing.marginPercentOriginal !== undefined 
          ? originalQuote.pricing.marginPercentOriginal 
          : originalQuote.pricing.marginPercent;

        let updatedOriginalQuote: Quote = {
          ...originalQuote,
          hasReturn: true,
          costs: {
            ...(originalQuote.costs || { products: 0, labor: 0, transport: 0, overhead: 0, total: 0 }),
            total: novoCustoTotal
          },
          pricing: {
            ...originalQuote.pricing,
            marginPercent: newMarginPercent,
            marginPercentOriginal: marginPercentOriginal
          }
        };

        if (updatedOriginalQuote.dreBreakdown) {
          updatedOriginalQuote.dreBreakdown = calcularDREPorOS(updatedOriginalQuote, state);
        }

        const updatedQuotesList = state.quotes.list.map(q => {
          if (q.id === originalQuoteId) {
            return updatedOriginalQuote;
          }
          return q;
        });
        updatedQuotesList.unshift(retQuote);

        const updatedCostHistory = [...(state.financial.costHistory || [])];
        updatedCostHistory.push({
          id: retId,
          date: new Date().toISOString(),
          type: 'retorno_gratuito',
          value: returnCostEstimate,
          quoteRef: originalQuoteId
        });

        const updatedFinancialMovements = [...(state.financial.movements || [])];
        updatedFinancialMovements.push({
          id: `retorno-custo-${retId}`,
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date().toISOString().split('T')[0],
          description: `Custo Retorno em Garantia - OS #${originalQuoteId} (${originalQuote.client.name})`,
          category: 'CUSTOS DIRETOS',
          subcategory: 'Retornos em Garantia',
          value: returnCostEstimate,
          paymentMethod: 'Interno',
          costCenter: 'Operacional',
          isPaid: true,
        });

        try {
          toast.success(`Retorno gratuito #${retId} registrado com sucesso!`);
        } catch (e) {
          console.warn(e);
        }

        return updateCompanyData(state, {
          quotes: {
            list: updatedQuotesList
          },
          financial: {
            ...state.financial,
            costHistory: updatedCostHistory,
            movements: updatedFinancialMovements
          }
        });
      }),

      addInventoryProduct: (product) => set((state) => updateCompanyData(state, {
        inventory: {
          ...state.inventory,
          products: [...state.inventory.products, product]
        }
      })),

      updateInventoryProduct: (id, data) => set((state) => updateCompanyData(state, {
        inventory: {
          ...state.inventory,
          products: state.inventory.products.map(p => p.id === id ? { ...p, ...data, lastUpdated: new Date().toISOString() } : p)
        }
      })),

      removeInventoryProduct: (id) => set((state) => updateCompanyData(state, {
        inventory: {
          ...state.inventory,
          products: state.inventory.products.filter(p => p.id !== id)
        }
      })),

      addInventoryMovement: (movement) => set((state) => updateCompanyData(state, {
        inventory: {
          ...state.inventory,
          movements: [movement, ...state.inventory.movements]
        }
      })),

      addPOP: (procedure) => set((state) => updateCompanyData(state, {
        pops: {
          procedures: [...state.pops.procedures, procedure]
        }
      })),

      updatePOP: (id, data) => set((state) => updateCompanyData(state, {
        pops: {
          procedures: state.pops.procedures.map(p => p.id === id ? { ...p, ...data } : p)
        }
      })),

      removePOP: (id) => set((state) => updateCompanyData(state, {
        pops: {
          procedures: state.pops.procedures.filter(p => p.id !== id)
        }
      })),

      // ERP INTEGRATION ACTION IMPLEMENTATIONS
      addClient: (client) => set((state) => {
        const id = client.id || `c-${Math.random().toString(36).substring(2, 11)}`;
        const exists = (state.clients || []).some(c => c.id === id || c.name.toLowerCase() === client.name.toLowerCase());
        if (exists) return state;
        return updateCompanyData(state, {
          clients: [{ ...client, id }, ...(state.clients || [])]
        });
      }),
      updateClient: (id, data) => set((state) => updateCompanyData(state, {
        clients: (state.clients || []).map(c => c.id === id ? { ...c, ...data } : c)
      })),
      removeClient: (id) => set((state) => updateCompanyData(state, {
        clients: (state.clients || []).filter(c => c.id !== id)
      })),

      addContract: (contract) => set((state) => {
        const id = contract.id || `contr-${Math.random().toString(36).substring(2, 11)}`;
        const exists = (state.contracts || []).some(c => c.id === id);
        if (exists) return state;
        const newContract = { ...contract, id };
        const updatedContracts = [newContract, ...(state.contracts || [])];

        const currentAgenda = state.agenda || [];
        const nowMs = new Date().getTime();
        let nextAgenda = currentAgenda;

        if (newContract.endDate) {
          const endDateMs = new Date(newContract.endDate + 'T00:00:00').getTime();
          const diffDays = Math.ceil((endDateMs - nowMs) / (1000 * 60 * 60 * 24));
          if (diffDays <= 30) {
            const deterministicId = `renewal-${newContract.id}`;
            const evExists = currentAgenda.some(
              e => e.id === deterministicId || 
                   (e.type === 'renovacao_contrato' && e.clientId === newContract.clientId && (e.id === deterministicId || e.notes?.includes(newContract.id)))
            );
            if (!evExists) {
              nextAgenda = [{
                id: deterministicId,
                title: `Renovar contrato — ${newContract.clientName}`,
                date: newContract.endDate,
                time: '09:00',
                clientId: newContract.clientId,
                clientName: newContract.clientName,
                type: 'renovacao_contrato',
                status: 'pendente',
                notes: `Alerta Comercial: Contrato "${newContract.title}" (ID: ${newContract.id}) vence em ${newContract.endDate}. Entre em contato com o cliente para renovação.`
              }, ...currentAgenda];
            }
          }
        }

        return updateCompanyData(state, {
          contracts: updatedContracts,
          agenda: nextAgenda
        });
      }),

      updateContract: (id, data) => set((state) => {
        const updatedContracts = (state.contracts || []).map(c => c.id === id ? { ...c, ...data } : c);
        const updatedContract = updatedContracts.find(c => c.id === id);

        let nextAgenda = state.agenda || [];
        if (updatedContract && updatedContract.endDate) {
          const nowMs = new Date().getTime();
          const endDateMs = new Date(updatedContract.endDate + 'T00:00:00').getTime();
          const diffDays = Math.ceil((endDateMs - nowMs) / (1000 * 60 * 60 * 24));
          if (diffDays <= 30) {
            const deterministicId = `renewal-${updatedContract.id}`;
            const evExists = nextAgenda.some(
              e => e.id === deterministicId || 
                   (e.type === 'renovacao_contrato' && e.clientId === updatedContract.clientId && (e.id === deterministicId || e.notes?.includes(updatedContract.id)))
            );
            if (!evExists) {
              nextAgenda = [{
                id: deterministicId,
                title: `Renovar contrato — ${updatedContract.clientName}`,
                date: updatedContract.endDate,
                time: '09:00',
                clientId: updatedContract.clientId,
                clientName: updatedContract.clientName,
                type: 'renovacao_contrato',
                status: 'pendente',
                notes: `Alerta Comercial: Contrato "${updatedContract.title}" (ID: ${updatedContract.id}) vence em ${updatedContract.endDate}. Entre em contato com o cliente para renovação.`
              }, ...nextAgenda];
            }
          }
        }

        return updateCompanyData(state, {
          contracts: updatedContracts,
          agenda: nextAgenda
        });
      }),

      removeContract: (id) => set((state) => updateCompanyData(state, {
        contracts: (state.contracts || []).filter(c => c.id !== id)
      })),

      checkContractRenewals: () => set((state) => {
        const contracts = state.contracts || [];
        const currentAgenda = state.agenda || [];
        const nowMs = new Date().getTime();
        
        const newEventsToAdd: AgendaEvent[] = [];

        for (const contract of contracts) {
          if (!contract.endDate) continue;

          const endDateMs = new Date(contract.endDate + 'T00:00:00').getTime();
          const diffDays = Math.ceil((endDateMs - nowMs) / (1000 * 60 * 60 * 24));

          if (diffDays <= 30) {
            const deterministicId = `renewal-${contract.id}`;
            
            const exists = currentAgenda.some(
              e => e.id === deterministicId || 
                   (e.type === 'renovacao_contrato' && e.clientId === contract.clientId && (e.id === deterministicId || e.notes?.includes(contract.id)))
            );

            if (!exists) {
              newEventsToAdd.push({
                id: deterministicId,
                title: `Renovar contrato — ${contract.clientName}`,
                date: contract.endDate,
                time: '09:00',
                clientId: contract.clientId,
                clientName: contract.clientName,
                type: 'renovacao_contrato',
                status: 'pendente',
                notes: `Alerta Comercial: Contrato "${contract.title}" (ID: ${contract.id}) vence em ${contract.endDate}. Entre em contato com o cliente para renovação.`
              });
            }
          }
        }

        if (newEventsToAdd.length === 0) return state;

        return updateCompanyData(state, {
          agenda: [...newEventsToAdd, ...currentAgenda]
        });
      }),

      addAgendaEvent: (event) => set((state) => {
        const id = event.id || `ev-${Math.random().toString(36).substring(2, 11)}`;
        const exists = (state.agenda || []).some(e => e.id === id);
        if (exists) return state;
        const newAgenda = [{ ...event, id }, ...(state.agenda || [])];
        const nextState = { ...state, agenda: newAgenda };
        const newRoutes = computeRoutesForDate(event.date, nextState);
        const otherRoutes = (state.routes || []).filter(r => r.date !== event.date);
        return updateCompanyData(state, {
          agenda: newAgenda,
          routes: [...otherRoutes, ...newRoutes]
        });
      }),
      updateAgendaEvent: (id, data) => set((state) => {
        const targetEv = (state.agenda || []).find(e => e.id === id);
        const newAgenda = (state.agenda || []).map(e => e.id === id ? { ...e, ...data } : e);
        const nextState = { ...state, agenda: newAgenda };

        const datesToRecalc = new Set<string>();
        if (targetEv?.date) datesToRecalc.add(targetEv.date);
        if (data.date) datesToRecalc.add(data.date);

        let updatedRoutes = state.routes || [];
        for (const d of datesToRecalc) {
          const newR = computeRoutesForDate(d, nextState);
          updatedRoutes = [...updatedRoutes.filter(r => r.date !== d), ...newR];
        }

        return updateCompanyData(state, {
          agenda: newAgenda,
          routes: updatedRoutes
        });
      }),
      removeAgendaEvent: (id) => set((state) => {
        const targetEv = (state.agenda || []).find(e => e.id === id);
        const newAgenda = (state.agenda || []).filter(e => e.id !== id);
        const nextState = { ...state, agenda: newAgenda };

        let updatedRoutes = state.routes || [];
        if (targetEv?.date) {
          const newR = computeRoutesForDate(targetEv.date, nextState);
          updatedRoutes = [...updatedRoutes.filter(r => r.date !== targetEv.date), ...newR];
        }

        return updateCompanyData(state, {
          agenda: newAgenda,
          routes: updatedRoutes
        });
      }),
      recalculateRoutesForDate: (date: string) => set((state) => {
        const newRoutesForDate = computeRoutesForDate(date, state);
        const otherDateRoutes = (state.routes || []).filter(r => r.date !== date);
        return updateCompanyData(state, {
          routes: [...otherDateRoutes, ...newRoutesForDate]
        });
      }),

      addPurchaseRequisition: (req) => set((state) => {
        const id = req.id || `purch-${Math.random().toString(36).substring(2, 11)}`;
        const exists = (state.purchases || []).some(p => p.id === id);
        if (exists) return state;
        return updateCompanyData(state, {
          purchases: [{ ...req, id }, ...(state.purchases || [])]
        });
      }),
      updatePurchaseStatus: (id, status) => set((state) => {
        let isReceiving = false;
        let pReq: any = null;
        const updatedPurchases = (state.purchases || []).map(p => {
          if (p.id === id) {
            isReceiving = status === 'Recebido' && p.status !== 'Recebido';
            pReq = p;
            return { ...p, status, updatedAt: new Date().toISOString() };
          }
          return p;
        });

        let updatedProducts = [...state.inventory.products];
        let updatedMovements = [...state.inventory.movements];

        if (isReceiving && pReq) {
          const prodIdx = updatedProducts.findIndex(p => p.id === pReq.productId);
          if (prodIdx > -1) {
            const prod = updatedProducts[prodIdx];
            updatedProducts[prodIdx] = {
              ...prod,
              quantity: prod.quantity + pReq.quantityToBuy,
              lastUpdated: new Date().toISOString()
            };

            updatedMovements.push({
              id: `mov-${Math.random().toString(36).substring(2, 11)}`,
              date: new Date().toISOString().split('T')[0],
              productId: pReq.productId,
              type: 'entrada',
              quantity: pReq.quantityToBuy,
              reason: `Entrada automática - Solicitação Recebida #${pReq.id}`
            });
          }
        }

        return updateCompanyData(state, {
          purchases: updatedPurchases,
          inventory: {
            ...state.inventory,
            products: updatedProducts,
            movements: updatedMovements
          }
        });
      }),
      removePurchaseRequisition: (id) => set((state) => updateCompanyData(state, {
        purchases: (state.purchases || []).filter(p => p.id !== id)
      })),

      addEmployee: (employeeData) => set((state) => {
        const id = `emp-${Math.random().toString(36).substring(2, 9)}`;
        const newEmp: Employee = { ...employeeData, id };
        return updateCompanyData(state, {
          employees: [...(state.employees || DEFAULT_EMPLOYEES), newEmp]
        });
      }),

      updateEmployee: (id, data) => set((state) => updateCompanyData(state, {
        employees: (state.employees || DEFAULT_EMPLOYEES).map(e => e.id === id ? { ...e, ...data } : e)
      })),

      toggleEmployeeStatus: (id) => set((state) => updateCompanyData(state, {
        employees: (state.employees || DEFAULT_EMPLOYEES).map(e => e.id === id ? { ...e, active: !e.active } : e)
      })),

      removeEmployee: (id) => set((state) => updateCompanyData(state, {
        employees: (state.employees || DEFAULT_EMPLOYEES).filter(e => e.id !== id)
      })),

      updateSettings: (settings) => set((state) => {
        const nextSettings = {
          ...state.settings,
          ...settings,
          operationalGoals: {
            ...state.settings.operationalGoals,
            ...(settings.operationalGoals || {})
          }
        };

        // Also sync minimalMarginPercent with financial operational config for unified settings
        let nextFinancial = { ...state.financial };
        if (settings.operationalGoals?.minimumMarginPercent !== undefined) {
          nextFinancial.operational = {
            ...nextFinancial.operational,
            minimumMarginPercent: settings.operationalGoals.minimumMarginPercent
          };
        }
        if (settings.operationalGoals?.targetServicesPerMonth !== undefined) {
          nextFinancial.operational = {
            ...nextFinancial.operational,
            servicesPerMonth: settings.operationalGoals.targetServicesPerMonth
          };
        }
        if (settings.operationalGoals?.costPerHour !== undefined) {
          nextFinancial.variableCosts = {
            ...nextFinancial.variableCosts,
            laborPerHour: settings.operationalGoals.costPerHour
          };
        }


        return updateCompanyData(state, {
          settings: nextSettings,
          financial: nextFinancial
        });
      }),

      registerCompany: (displayName, password) => {
        const nameKey = displayName.trim().toLowerCase();
        if (!nameKey) return { success: false, error: 'O nome da empresa não pode ser vazio.' };
        if (password.length < 3) return { success: false, error: 'A senha deve conter no mínimo 3 caracteres.' };

        const currentCompanies = get().companies || {};
        if (currentCompanies[nameKey]) {
          return { success: false, error: 'Este nome de empresa já está cadastrado.' };
        }

        const emptyCompanyState = {
          financial: {
            fixedCosts: { vehicleRental: 0, salaries: 0, rent: 0, fuel: 0, insurance: 0, other: 0 },
            variableCosts: { productsPerService: 0, laborPerHour: 0, equipmentDepreciation: 0 },
            operational: { servicesPerMonth: 0, avgServiceDurationHours: 0, minimumMarginPercent: 35 },
            revenueHistory: [],
            costHistory: [],
          },
          inventory: { products: [], movements: [] },
          pops: { procedures: [] },
          quotes: { list: [] },
          clients: [],
          contracts: [],
          agenda: [],
          purchases: [],
          settings: {
            companyName: displayName,
            cnpj: '',
            headquartersAddress: '',
            city: '',
            state: '',
            phone: '',
            maxReturnRatePercent: 8,
            operationalGoals: { targetServicesPerMonth: 0, minimumMarginPercent: 35, costPerKm: 0 },
          }
        };

        const newCompany: CompanyAccount = {
          name: nameKey,
          displayName,
          password,
          ...emptyCompanyState
        };

        set((state) => ({
          companies: {
            ...(state.companies || {}),
            [nameKey]: newCompany
          },
          currentCompany: nameKey,
          // instantly load this company's empty state as the active state
          ...emptyCompanyState
        }));

        return { success: true };
      },

      loginCompany: (displayName, password) => {
        const nameKey = displayName.trim().toLowerCase();
        const currentCompanies = get().companies || {};
        const account = currentCompanies[nameKey];

        if (!account) {
          return { success: false, error: 'Empresa não encontrada.' };
        }

        if (account.password !== password) {
          return { success: false, error: 'Senha incorreta para esta empresa.' };
        }

        // load this company's saved state into active state
        set({
          currentCompany: nameKey,
          financial: account.financial,
          inventory: account.inventory,
          pops: account.pops,
          quotes: account.quotes,
          settings: account.settings,
        });

        return { success: true };
      },

      logoutCompany: () => {
        set({
          currentCompany: null,
          // reset active state to generic values or empty
          financial: INITIAL_STATE.financial,
          inventory: INITIAL_STATE.inventory,
          pops: INITIAL_STATE.pops,
          quotes: INITIAL_STATE.quotes,
          settings: INITIAL_STATE.settings,
        });
      },

      resetSystemData: () => set((state) => {
        const clearedFinancial = {
          ...state.financial,
          fixedCosts: {
            vehicleRental: 0,
            salaries: 0,
            rent: 0,
            fuel: 0,
            insurance: 0,
            other: 0,
          },
          variableCosts: {
            productsPerService: 0,
            laborPerHour: 0,
            equipmentDepreciation: 0,
          },
          revenueHistory: [],
          costHistory: [],
          movements: [],
        };
        const clearedInventory = {
          ...state.inventory,
          products: [],
          movements: [],
        };
        const clearedPops = {
          ...state.pops,
          procedures: [],
        };
        const clearedQuotes = {
          ...state.quotes,
          list: [],
        };
        const clearedSettings = {
          ...state.settings,
          operationalGoals: {
            ...state.settings.operationalGoals,
            costPerKm: 0,
            costPerHour: 0,
            equipmentAmortization: 0,
          }
        };

        const updates = {
          financial: clearedFinancial,
          inventory: clearedInventory,
          pops: clearedPops,
          quotes: clearedQuotes,
          settings: clearedSettings,
        };

        return updateCompanyData(state, updates);
      }),

      getDashboardKPIs: () => {
        const state = get();
        const approvedQuotes = state.quotes.list.filter(
          q => q.status === 'aprovado' || q.status === 'executado'
        );

        const totalRevenue = approvedQuotes.reduce((acc, q) => acc + q.pricing.finalPrice, 0);
        const totalMarginSum = approvedQuotes.reduce((acc, q) => acc + q.pricing.marginPercent, 0);
        const avgMargin = approvedQuotes.length > 0 ? totalMarginSum / approvedQuotes.length : 0;

        const totalServices = approvedQuotes.length;
        const ticketValue = totalServices > 0 ? totalRevenue / totalServices : 0;

        const lowStockProducts = state.inventory.products.filter(
          p => p.quantity <= p.minQuantity
        );

        return {
          totalRevenue,
          avgMargin,
          totalServices,
          ticketValue,
          lowStockCount: lowStockProducts.length,
          lowStockProducts
        };
      },

      getIntelligenceReport: () => {
        const state = get();
        const { financial, inventory, quotes, pops, settings } = state;

        // 1. FINANCE CALCULATIONS
        const totalFixedCosts = Object.values(financial.fixedCosts).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
        const targetServices = financial.operational.servicesPerMonth || settings?.operationalGoals?.targetServicesPerMonth || 120;
        const fixedPerService = targetServices > 0 ? totalFixedCosts / targetServices : 0;
        
        // Use average variable cost from quotes, defaulting to productsPerService
        const nonDraftQuotes = quotes.list.filter(q => q.status !== 'rascunho');
        const avgVariableCost = nonDraftQuotes.length > 0 
          ? (nonDraftQuotes.reduce((sum, q) => sum + (q.costs.total - q.costs.overhead), 0) / nonDraftQuotes.length)
          : (financial.variableCosts.productsPerService || 45);

        const realCostPerService = fixedPerService + avgVariableCost;

        // Break-even
        const avgTicketPrice = nonDraftQuotes.length > 0
          ? (nonDraftQuotes.reduce((sum, q) => sum + q.pricing.finalPrice, 0) / nonDraftQuotes.length)
          : 1200;

        const contributionMargin = avgTicketPrice - avgVariableCost;
        const breakEvenServicesPerMonth = contributionMargin > 0 ? Math.ceil(totalFixedCosts / contributionMargin) : 0;

        // Projected Monthly Profit of this month
        const currentMonthStr = new Date().toISOString().slice(0, 7);
        const monthQuotesNonDraft = nonDraftQuotes.filter(q => q.createdAt.startsWith(currentMonthStr));
        const monthRevenue = monthQuotesNonDraft.reduce((sum, q) => sum + q.pricing.finalPrice, 0);
        const monthTotalCosts = monthQuotesNonDraft.reduce((sum, q) => sum + q.costs.total, 0);
        const projectedMonthlyProfit = monthRevenue - monthTotalCosts - totalFixedCosts;

        // 2. OPERATIONAL CALCULATIONS
        const now = new Date();
        const time30DaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
        const time90DaysAgo = now.getTime() - 90 * 24 * 60 * 60 * 1000;

        const quotesLast30 = nonDraftQuotes.filter(q => new Date(q.createdAt).getTime() >= time30DaysAgo);
        const quotesLast90 = nonDraftQuotes.filter(q => new Date(q.createdAt).getTime() >= time90DaysAgo);

        const avgMarginLast30Days = quotesLast30.length > 0
          ? quotesLast30.reduce((sum, q) => sum + q.pricing.marginPercent, 0) / quotesLast30.length
          : 0;

        const avgMarginLast90Days = quotesLast90.length > 0
          ? quotesLast90.reduce((sum, q) => sum + q.pricing.marginPercent, 0) / quotesLast90.length
          : 0;

        let marginTrend: 'subindo' | 'estável' | 'caindo' = 'estável';
        if (avgMarginLast30Days > 0 && avgMarginLast90Days > 0) {
          const diff = avgMarginLast30Days - avgMarginLast90Days;
          if (diff > 0.5) marginTrend = 'subindo';
          else if (diff < -0.5) marginTrend = 'caindo';
        }

        // Most and least profitable pestType based on average margin
        const pestMargins: Record<string, { totalMargin: number; count: number }> = {};
        nonDraftQuotes.forEach(q => {
          const pest = q.service.pestType || 'Geral';
          if (!pestMargins[pest]) {
            pestMargins[pest] = { totalMargin: 0, count: 0 };
          }
          pestMargins[pest].totalMargin += q.pricing.marginPercent;
          pestMargins[pest].count += 1;
        });

        let mostProfitablePestType = 'Nenhum';
        let leastProfitablePestType = 'Nenhum';
        let maxAvgMargin = -Infinity;
        let minAvgMargin = Infinity;

        Object.entries(pestMargins).forEach(([pest, data]) => {
          const avg = data.totalMargin / data.count;
          if (avg > maxAvgMargin) {
            maxAvgMargin = avg;
            mostProfitablePestType = pest;
          }
          if (avg < minAvgMargin) {
            minAvgMargin = avg;
            leastProfitablePestType = pest;
          }
        });

        if (mostProfitablePestType === 'Nenhum') mostProfitablePestType = 'Geral';
        if (leastProfitablePestType === 'Nenhum') leastProfitablePestType = 'Geral';

        // 3. INVENTORY CALCULATIONS
        const recentSaidas = inventory.movements.filter(m => m.type === 'saida' && new Date(m.date).getTime() >= time30DaysAgo);
        const estimatedStockDaysRemaining: Record<string, number> = {};

        inventory.products.forEach(p => {
          const productSaidas = recentSaidas.filter(m => m.productId === p.id);
          const totalConsumed = productSaidas.reduce((sum, m) => sum + m.quantity, 0);
          const dailyConsumption = totalConsumed / 30;
          if (dailyConsumption > 0) {
            estimatedStockDaysRemaining[p.id] = Math.max(0, parseFloat((p.quantity / dailyConsumption).toFixed(1)));
          } else {
            estimatedStockDaysRemaining[p.id] = 999;
          }
        });

        const totalStockValue = inventory.products.reduce((sum, p) => sum + (p.quantity * (p.costPerUnit || 0)), 0);
        const criticalProducts = inventory.products
          .filter(p => p.quantity <= p.minQuantity)
          .map(p => p.name);

        // 4. AUTOMATIC ALERTS
        const alerts: Array<{ type: 'warning' | 'danger' | 'info'; title: string; message: string; action?: string }> = [];

        const targetLimit = settings?.operationalGoals?.targetServicesPerMonth || financial?.operational?.servicesPerMonth || 120;
        if (breakEvenServicesPerMonth > targetLimit) {
          alerts.push({
            type: 'danger',
            title: 'Meta de Serviços Insuficiente',
            message: `Você precisa de ${breakEvenServicesPerMonth} serviços/mês para atingir o ponto de equilíbrio comercial, superando sua meta de vendas de ${targetLimit} serviços/mês.`,
            action: '/financial'
          });
        }

        const minMargin = financial?.operational?.minimumMarginPercent || settings?.operationalGoals?.minimumMarginPercent || 35;
        if (avgMarginLast30Days > 0 && avgMarginLast30Days < minMargin) {
          alerts.push({
            type: 'warning',
            title: 'Margem de Campo Baixa',
            message: `Sua margem média dos últimos 30 dias (${avgMarginLast30Days.toFixed(1)}%) está abaixo da margem mínima desejada (${minMargin}%).`,
            action: '/calculator'
          });
        }

        inventory.products.forEach(p => {
          if (p.quantity <= p.minQuantity) {
            alerts.push({
              type: 'danger',
              title: 'Estoque Crítico Detectado',
              message: `Insumo "${p.name}" atingiu limite crítico (${p.quantity} ${p.unit} restante). Reabasteça para evitar interrupções de sserviços.`,
              action: '/inventory'
            });
          }
        });

        if (pops.procedures.length === 0) {
          alerts.push({
            type: 'info',
            title: 'Procedimentos Incompletos',
            message: 'Sem POPs cadastrados, a Calculadora não consegue simular o consumo de produtos químicos de forma automática.',
            action: '/pops'
          });
        }

        if (Number(financial?.fixedCosts?.vehicleRental) > 0 && targetServices < 10) {
          const vehicleShare = ((Number(financial.fixedCosts.vehicleRental) / (targetServices || 1)) / (realCostPerService || 1)) * 100;
          alerts.push({
            type: 'warning',
            title: 'Custo de Frota Elevado',
            message: `O custo de locação de veículos representa mais de ${vehicleShare.toFixed(0)}% do custo total por serviço devido ao baixo volume mensal de serviços planejado (${targetServices}).`,
            action: '/financial'
          });
        }

        return {
          realCostPerService,
          breakEvenServicesPerMonth,
          projectedMonthlyProfit,
          avgMarginLast30Days,
          avgMarginLast90Days,
          marginTrend,
          mostProfitablePestType,
          leastProfitablePestType,
          estimatedStockDaysRemaining,
          totalStockValue,
          criticalProducts,
          alerts
        };
      }
    }),
    {
      name: 'ddsulf_system_v2',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const companies = state.companies || {};
          if (Object.keys(companies).length === 0) {
            const defaultKey = 'ddsulf';
            const defaultCompany: CompanyAccount = {
              name: defaultKey,
              displayName: state.settings?.companyName || 'DDSulf Dedetizadora',
              password: 'admin',
              financial: state.financial || INITIAL_STATE.financial,
              inventory: state.inventory || INITIAL_STATE.inventory,
              pops: state.pops || INITIAL_STATE.pops,
              quotes: state.quotes || INITIAL_STATE.quotes,
              settings: state.settings || INITIAL_STATE.settings,
              clients: state.clients || INITIAL_STATE.clients || [],
              contracts: state.contracts || INITIAL_STATE.contracts || [],
              agenda: state.agenda || INITIAL_STATE.agenda || [],
              purchases: state.purchases || INITIAL_STATE.purchases || [],
            };
            state.companies = { [defaultKey]: defaultCompany };
            state.currentCompany = defaultKey;
          }
        }
      }
    }
  )
);

export function calcularDREPorOS(quote: Quote, state: SystemState): DREBreakdown {
  const targetMonth = quote.createdAt ? quote.createdAt.substring(0, 7) : new Date().toISOString().substring(0, 7);
  
  // Find all approved/executed services in that month from the state
  const otherApprovedServices = (state.quotes?.list || []).filter(q => 
    q.id !== quote.id &&
    (q.status === 'aprovado' || q.status === 'executado') && 
    q.createdAt && q.createdAt.substring(0, 7) === targetMonth
  );

  let serviceCount = otherApprovedServices.length;
  // If the quote itself is approved or executed, count it
  if (quote.status === 'aprovado' || quote.status === 'executado') {
    serviceCount += 1;
  }

  // Ensure minimum is 1 to avoid Division by Zero
  if (serviceCount === 0) serviceCount = 1;

  const fc = state.financial?.fixedCosts || {
    vehicleRental: 0,
    salaries: 0,
    rent: 0,
    fuel: 0,
    insurance: 0,
    other: 0,
  };

  const totalFixedCosts = (Number(fc.vehicleRental) || 0) + 
                          (Number(fc.salaries) || 0) + 
                          (Number(fc.rent) || 0) + 
                          (Number(fc.fuel) || 0) + 
                          (Number(fc.insurance) || 0) + 
                          (Number(fc.other) || 0);

  const fixedCostShare = totalFixedCosts / serviceCount;

  // ROUTE DILUTION LOGIC FOR TRANSPORT COST
  const matchingEvent = (state.agenda || []).find(e => e.quoteId === quote.id);
  let effectiveTransportCost = Number(quote.costs?.transport) || 0;
  let transportSavings: number | undefined = undefined;

  if (matchingEvent && state.routes && state.routes.length > 0) {
    const matchingRoute = state.routes.find(r => r.stopEventIds.includes(matchingEvent.id));
    if (matchingRoute && matchingRoute.costPerStop && matchingRoute.costPerStop[matchingEvent.id] !== undefined) {
      const dilutedCost = matchingRoute.costPerStop[matchingEvent.id];
      const originalTransportCost = Number(quote.costs?.transport) || 0;
      effectiveTransportCost = dilutedCost;
      transportSavings = originalTransportCost - dilutedCost;
    }
  }

  const originalTotalVariable = Number(quote.costs?.total) || 0;
  const originalTransport = Number(quote.costs?.transport) || 0;
  const variableCost = originalTotalVariable - originalTransport + effectiveTransportCost;
  const totalCost = fixedCostShare + variableCost;

  const finalPrice = Number(quote.pricing?.finalPrice) || 0;
  const netMargin = finalPrice - totalCost;
  const netMarginPercent = finalPrice > 0 ? (netMargin / finalPrice) * 100 : 0;

  return {
    fixedCostShare,
    variableCost,
    totalCost,
    netMargin,
    netMarginPercent,
    transportSavings
  };
}

export function selectDREMensal(state: SystemState, optionalMonth?: string) {
  const monthStr = optionalMonth || new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const monthQuotes = (state.quotes?.list || []).filter(q => 
    q.createdAt && q.createdAt.startsWith(monthStr)
  );

  let totalReceita = 0;
  let totalCustoVariavel = 0;
  let totalCustoFixoRateado = 0;

  monthQuotes.forEach(q => {
    if (q.status === 'aprovado' || q.status === 'executado') {
      const breakdown = q.dreBreakdown || calcularDREPorOS(q, state);
      totalReceita += Number(q.pricing?.finalPrice) || 0;
      totalCustoVariavel += Number(breakdown.variableCost) || 0;
      totalCustoFixoRateado += Number(breakdown.fixedCostShare) || 0;
    }
  });

  const margemOperacional = totalReceita - (totalCustoVariavel + totalCustoFixoRateado);
  const margemPercent = totalReceita > 0 ? (margemOperacional / totalReceita) * 100 : 0;

  return {
    totalReceita,
    totalCustoVariavel,
    totalCustoFixoRateado,
    margemOperacional,
    margemPercent
  };
}

export interface ProjecaoCaixa {
  horizonte: number;
  saldoAtual: number;
  entradasPrevistas: number;
  saidasPrevistas: number;
  saldoFinal: number;
  riscoCaixa: boolean;
  timeline: Array<{ mes: string; entradas: number; saidas: number; saldo: number; }>;
}

export function selectProjecaoCaixa(state: SystemState, horizonte: 30 | 60 | 90): ProjecaoCaixa {
  const movements = state.financial?.movements || [];
  const contracts = state.contracts || [];
  const fc = state.financial?.fixedCosts || {
    vehicleRental: 0,
    salaries: 0,
    rent: 0,
    fuel: 0,
    insurance: 0,
    other: 0,
  };

  const totalFixedCosts = (Number(fc.vehicleRental) || 0) + 
                          (Number(fc.salaries) || 0) + 
                          (Number(fc.rent) || 0) + 
                          (Number(fc.fuel) || 0) + 
                          (Number(fc.insurance) || 0) + 
                          (Number(fc.other) || 0);

  // 1. Calculate saldoAtual: sum of all elements that are paid (isPaid === true)
  const saldoAtual = movements
    .filter(m => m.isPaid === true)
    .reduce((sum, m) => sum + (Number(m.value) || 0), 0);

  // Define dates for horizon
  const today = new Date();
  const horizonDate = new Date();
  horizonDate.setDate(today.getDate() + horizonte);

  const todayStr = today.toISOString().slice(0, 10);
  const horizonStr = horizonDate.toISOString().slice(0, 10);

  // Build the months list for the timeline
  const monthsList: string[] = [];
  const numMonths = Math.ceil(horizonte / 30) + 1; // e.g. 30 -> 2 months, 60 -> 3 months, 90 -> 4 months
  for (let i = 0; i < numMonths; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const yearStr = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    monthsList.push(`${yearStr}-${monthStr}`);
  }

  // Pre-calculate inputs by month for the timeline
  // Unpaid movements (isPaid === false) whose dueDate is within the horizon and matches a month in our timeline
  const unpaidMovementsInHorizon = movements.filter(m => 
    m.isPaid === false && 
    m.dueDate && 
    m.dueDate <= horizonStr
  );

  // Contract billing forecasts:
  // For each active contract, find its billing occurrences in the horizon
  const contractRevenuesByMonth: Record<string, number> = {};
  monthsList.forEach(m => {
    contractRevenuesByMonth[m] = 0;
  });

  contracts.forEach(contract => {
    if (contract.status === 'ativo') {
      const startD = new Date(contract.startDate);
      const endD = new Date(contract.endDate);
      const recMonths = contract.recurrencyMonths || 1;
      const val = Number(contract.recurrentValue) || Number(contract.value) || 0;

      if (!isNaN(startD.getTime()) && !isNaN(endD.getTime()) && val > 0) {
        let currentD = new Date(startD);
        // Avoid infinite loop if recMonths is <= 0
        const interval = recMonths > 0 ? recMonths : 1;
        while (currentD <= endD) {
          const currentDStr = currentD.toISOString().slice(0, 10);
          if (currentDStr >= todayStr && currentDStr <= horizonStr) {
            const mStr = currentD.toISOString().slice(0, 7);
            if (contractRevenuesByMonth[mStr] !== undefined) {
              contractRevenuesByMonth[mStr] += val;
            }
          }
          currentD.setMonth(currentD.getMonth() + interval);
        }
      }
    }
  });

  // Now, construct the timeline
  let runningBalance = saldoAtual;
  let totalEntradas = 0;
  let totalSaidas = 0;

  const timeline = monthsList.map(mStr => {
    // Unpaid revenues (isPaid === false, value > 0) due in this month (and inside horizon)
    const movementsEntradas = unpaidMovementsInHorizon
      .filter(m => m.dueDate && m.dueDate.startsWith(mStr) && m.value > 0)
      .reduce((sum, m) => sum + m.value, 0);

    // Unpaid expenses (isPaid === false, value < 0) due in this month (and inside horizon)
    const movementsSaidas = Math.abs(unpaidMovementsInHorizon
      .filter(m => m.dueDate && m.dueDate.startsWith(mStr) && m.value < 0)
      .reduce((sum, m) => sum + m.value, 0));

    const contractEntradas = contractRevenuesByMonth[mStr] || 0;
    
    // Total entries for this month
    const monthEntradas = movementsEntradas + contractEntradas;
    
    // Total exits for this month: fixed costs + unpaid expenses due this month
    const monthSaidas = totalFixedCosts + movementsSaidas;

    const monthSaldo = runningBalance + monthEntradas - monthSaidas;
    runningBalance = monthSaldo;

    totalEntradas += monthEntradas;
    totalSaidas += monthSaidas;

    return {
      mes: mStr,
      entradas: monthEntradas,
      saidas: monthSaidas,
      saldo: monthSaldo
    };
  });

  const saldoFinal = runningBalance;
  // risk of cash is true if final balance is negative, or if we dip negative at any point of the timeline
  const riscoCaixa = saldoFinal < 0 || timeline.some(t => t.saldo < 0);

  return {
    horizonte,
    saldoAtual,
    entradasPrevistas: totalEntradas,
    saidasPrevistas: totalSaidas,
    saldoFinal,
    riscoCaixa,
    timeline
  };
}

export interface ClienteRentabilidade {
  totalFaturado: number;
  totalCusto: number;
  margemTotal: number;
  margemPercent: number;
  qtdServicos: number;
  qtdRetornos: number;
  taxaRetorno: number;
  ultimoServico: string | null;
  proximoVencimento: string | null;
}

export function selectClienteRentabilidade(clientId: string, state: SystemState): ClienteRentabilidade {
  const client = (state.clients || []).find(c => c.id === clientId);
  if (!client) {
    return {
      totalFaturado: 0,
      totalCusto: 0,
      margemTotal: 0,
      margemPercent: 0,
      qtdServicos: 0,
      qtdRetornos: 0,
      taxaRetorno: 0,
      ultimoServico: null,
      proximoVencimento: null,
    };
  }

  const clientNameLower = client.name.toLowerCase();
  const clientQuotes = (state.quotes?.list || []).filter(q => {
    const qNameLower = q.client?.name?.toLowerCase();
    const qClientId = (q as any).clientId;
    const qClientObjId = (q.client as any)?.id;
    return qNameLower === clientNameLower || qClientId === clientId || qClientObjId === clientId;
  });

  const executedOrApproved = clientQuotes.filter(q => q.status === 'aprovado' || q.status === 'executado');
  const totalFaturado = executedOrApproved.reduce((sum, q) => sum + (Number(q.pricing?.finalPrice) || 0), 0);
  
  // Total cost: sum of raw quote costs that are processed (everything except rascunho / recusado)
  const nonDraftQuotes = clientQuotes.filter(q => q.status !== 'rascunho' && q.status !== 'recusado');
  const totalCusto = nonDraftQuotes.reduce((sum, q) => sum + (Number(q.costs?.total) || 0), 0);

  const margemTotal = totalFaturado - totalCusto;
  const margemPercent = totalFaturado > 0 ? (margemTotal / totalFaturado) * 100 : 0;

  const qtdServicos = clientQuotes.filter(q => q.status === 'executado').length;
  const qtdRetornos = clientQuotes.filter(q => q.status === 'retorno').length;
  const taxaRetorno = qtdServicos > 0 ? (qtdRetornos / qtdServicos) * 100 : 0;

  // Let's find latest service
  const lastServiceQuote = clientQuotes
    .filter(q => q.status === 'executado' || q.status === 'aprovado')
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())[0];
  const ultimoServico = lastServiceQuote 
    ? (lastServiceQuote.confirmedAt ? lastServiceQuote.confirmedAt.slice(0, 10) : lastServiceQuote.createdAt.slice(0, 10)) 
    : null;

  const activeContract = (state.contracts || []).find(c => c.clientId === clientId && c.status === 'ativo');
  const proximoVencimento = activeContract ? activeContract.endDate : null;

  return {
    totalFaturado,
    totalCusto,
    margemTotal,
    margemPercent,
    qtdServicos,
    qtdRetornos,
    taxaRetorno,
    ultimoServico,
    proximoVencimento,
  };
}

export function selectMargemMesAnterior(state: SystemState): number {
  const prevMonthDate = new Date();
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);

  const prevMonthQuotes = (state.quotes?.list || []).filter(q => 
    q.createdAt?.startsWith(prevMonthStr) && q.status !== 'rascunho' && q.status !== 'recusado'
  );

  if (prevMonthQuotes.length === 0) {
    return 0;
  }

  const sumMargin = prevMonthQuotes.reduce((sum, q) => sum + (q.pricing?.marginPercent || 0), 0);
  return sumMargin / prevMonthQuotes.length;
}

export interface ContratoReajuste {
  contractId: string;
  clientName: string;
  currentValue: number;
  suggestedValue: number;
  monthsOld: number;
  adjustment: number; // percentual
}

export function selectContratosParaReajuste(state: SystemState): ContratoReajuste[] {
  const ipcaPercent = state.settings?.ipcaReferencePercent ?? 4.6;
  const today = new Date();
  return (state.contracts || [])
    .filter(c => c.status === 'ativo')
    .map(c => {
      const start = new Date(c.startDate);
      const months = (today.getFullYear() - start.getFullYear()) * 12
        + (today.getMonth() - start.getMonth());
      const yearsOld = months / 12;
      const adjustment = Math.pow(1 + ipcaPercent / 100, yearsOld) - 1;
      const suggestedValue = c.recurrentValue * (1 + adjustment);
      return { contractId: c.id, clientName: c.clientName, currentValue: c.recurrentValue,
        suggestedValue, monthsOld: months, adjustment: adjustment * 100 };
    })
    .filter(r => r.monthsOld >= 11);
}




