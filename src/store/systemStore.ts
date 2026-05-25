import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

export interface InventoryProduct {
  id: string;
  name: string;
  category: string; // 'inseticida' | 'raticida' | 'fungicida' | 'outros'
  unit: string;     // 'ml' | 'g' | 'kg' | 'L' | 'unidade'
  quantity: number;
  minQuantity: number;
  costPerUnit: number;
  supplier: string;
  lastUpdated: string;
}

export interface InventoryMovement {
  id: string;
  date: string;
  productId: string;
  type: 'entrada' | 'saida';
  quantity: number;
  reason: string;
  quoteId?: string;
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
}

export interface QuoteProductUsed {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
}

export interface Quote {
  id: string;
  createdAt: string;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'executado';
  client: QuoteClient;
  service: QuoteService;
  costs: QuoteCosts;
  pricing: QuotePricing;
  productsUsed: QuoteProductUsed[];
  inventoryDeducted: boolean;
}

export interface QuotesState {
  list: Quote[];
}

export interface SystemSettings {
  companyName: string;
  cnpj: string;
  headquartersAddress: string;
  city: string;
  state: string;
  phone: string;
  operationalGoals: {
    targetServicesPerMonth: number;
    minimumMarginPercent: number;
    costPerKm: number;
  };
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
}

export interface SystemState {
  financial: FinancialCostConfig;
  inventory: InventoryState;
  pops: POPsState;
  quotes: QuotesState;
  settings: SystemSettings;
  
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
  
  addQuote: (quote: Quote) => void;
  updateQuoteStatus: (id: string, status: Quote['status']) => void;
  
  addInventoryProduct: (product: InventoryProduct) => void;
  updateInventoryProduct: (id: string, data: Partial<InventoryProduct>) => void;
  removeInventoryProduct: (id: string) => void;
  addInventoryMovement: (movement: InventoryMovement) => void;
  
  addPOP: (procedure: POPProcedure) => void;
  updatePOP: (id: string, data: Partial<POPProcedure>) => void;
  removePOP: (id: string) => void;
  
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
}

const INITIAL_STATE: SystemState = {
  financial: {
    fixedCosts: {
      vehicleRental: 3500,
      salaries: 12000,
      rent: 2500,
      fuel: 1800,
      insurance: 600,
      other: 1000,
    },
    variableCosts: {
      productsPerService: 45,
      laborPerHour: 25,
      equipmentDepreciation: 500,
    },
    operational: {
      servicesPerMonth: 120,
      avgServiceDurationHours: 3,
      minimumMarginPercent: 35,
    },
    revenueHistory: [],
  },
  inventory: {
    products: [
      {
        id: 'prod-1',
        name: 'Fendona 60 SC (Inseticida)',
        category: 'inseticida',
        unit: 'ml',
        quantity: 5000,
        minQuantity: 1000,
        costPerUnit: 0.18,
        supplier: 'BASF',
        lastUpdated: '2026-05-24T15:00:00Z',
      },
      {
        id: 'prod-2',
        name: 'K-Othrine WG 250 (Inseticida)',
        category: 'inseticida',
        unit: 'g',
        quantity: 1200,
        minQuantity: 300,
        costPerUnit: 1.25,
        supplier: 'Bayer',
        lastUpdated: '2026-05-24T15:00:00Z',
      },
      {
        id: 'prod-3',
        name: 'Rodilon Bloco (Raticida)',
        category: 'raticida',
        unit: 'g',
        quantity: 8000,
        minQuantity: 2000,
        costPerUnit: 0.05,
        supplier: 'Bayer',
        lastUpdated: '2026-05-24T15:00:00Z',
      },
      {
        id: 'prod-4',
        name: 'Termidor 25 CE (Inseticida p/ Cupim)',
        category: 'inseticida',
        unit: 'ml',
        quantity: 3000,
        minQuantity: 800,
        costPerUnit: 0.35,
        supplier: 'BASF',
        lastUpdated: '2026-05-24T15:00:00Z',
      }
    ],
    movements: []
  },
  pops: {
    procedures: [
      {
        id: 'pop-1',
        name: 'Desinsetização de Baratas (Blattella germanica)',
        pestType: 'baratas',
        serviceType: 'dedetizacao',
        requiredProducts: [
          { productId: 'prod-1', productName: 'Fendona 60 SC (Inseticida)', quantityPer100m2: 50, unit: 'ml' }
        ],
        estimatedTimeHoursPer100m2: 1.5,
        instructions: 'Realizar pulverização em frestas, ralos e superfícies de pouso. Usar EPI completo: máscara com filtro de carvão, luvas nitrílicas, macacão impermeável. Evitar aplicação direta em alimentos e utensílios.',
        createdAt: '2026-05-24T12:00:00Z'
      },
      {
        id: 'pop-2',
        name: 'Desratização com Rodilon Bloco',
        pestType: 'ratos',
        serviceType: 'desratizacao',
        requiredProducts: [
          { productId: 'prod-3', productName: 'Rodilon Bloco (Raticida)', quantityPer100m2: 100, unit: 'g' }
        ],
        estimatedTimeHoursPer100m2: 1,
        instructions: 'Alocar blocos parafinados dentro de porta-iscas lacrados. Identificar os pontos e preencher a ficha de monitoramento. Evitar áreas acessíveis a animais domésticos.',
        createdAt: '2026-05-24T12:00:00Z'
      },
      {
        id: 'pop-3',
        name: 'Descupinização de Solo (Barreira Química)',
        pestType: 'cupins',
        serviceType: 'descupinizacao',
        requiredProducts: [
          { productId: 'prod-4', productName: 'Termidor 25 CE (Inseticida p/ Cupim)', quantityPer100m2: 200, unit: 'ml' }
        ],
        estimatedTimeHoursPer100m2: 3,
        instructions: 'Injetar calda cupinicida no perímetro da construção em furos com distância de 30cm entre si. Profundidade mínima de 40cm. Utilizar bomba de alta pressão e certificar a ausência de tubulações hidráulicas ou elétricas.',
        createdAt: '2026-05-24T12:00:00Z'
      }
    ]
  },
  quotes: {
    list: []
  },
  settings: {
    companyName: 'DDSulf Dedetizadora',
    cnpj: '00.000.000/0001-00',
    headquartersAddress: 'Rua 33, 120 - Vila Santa Cecília, Volta Redonda - RJ',
    city: 'Volta Redonda',
    state: 'RJ',
    phone: '(24) 3344-5566',
    operationalGoals: {
      targetServicesPerMonth: 120,
      minimumMarginPercent: 35,
      costPerKm: 2.50
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

  const nextState: any = {
    ...updates,
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
      }
    };
  }

  return nextState;
};

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

      addQuote: (quote) => set((state) => {
        // Prepare updated quote
        let finalQuote = { ...quote };
        let updatedProducts = [...state.inventory.products];
        let updatedMovements = [...state.inventory.movements];
        let updatedRevenueHistory = [...state.financial.revenueHistory];

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
            revenueHistory: updatedRevenueHistory
          }
        });
      }),

      updateQuoteStatus: (id, status) => set((state) => {
        let updatedProducts = [...state.inventory.products];
        let updatedMovements = [...state.inventory.movements];
        let updatedRevenueHistory = [...state.financial.revenueHistory];
        
        const nextQuotes = state.quotes.list.map((q) => {
          if (q.id === id) {
            let updatedQuote = { ...q, status };
            
            // Deduct inventory if transitioning to approved or executed and has not been deducted yet
            const isTargetStatus = status === 'aprovado' || status === 'executado';
            if (isTargetStatus && !updatedQuote.inventoryDeducted) {
              updatedQuote.productsUsed.forEach(used => {
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
                    reason: `Baixa automática - Orçamento #${updatedQuote.id} (${updatedQuote.client.name})`,
                    quoteId: updatedQuote.id
                  });
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
            revenueHistory: updatedRevenueHistory
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
          },
          inventory: { products: [], movements: [] },
          pops: { procedures: [] },
          quotes: { list: [] },
          settings: {
            companyName: displayName,
            cnpj: '',
            headquartersAddress: '',
            city: '',
            state: '',
            phone: '',
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
      name: 'ddsulf_system_v1',
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
            };
            state.companies = { [defaultKey]: defaultCompany };
            state.currentCompany = defaultKey;
          }
        }
      }
    }
  )
);
