import { create } from 'zustand';
import { loggerMiddleware } from '../middleware/logger';
import { OperationalExpense, RevenueMetric } from '../types';

export interface FinancialState {
  targetMarginPercent: number;
  expenses: OperationalExpense[];
  revenues: RevenueMetric[];
  
  // Computed & Derived stats
  totalOperationalCosts: number;
  totalConfirmedRevenue: number;
  actualGrossMarginPercent: number;
  netProfit: number;

  // Actions
  setTargetMargin: (margin: number) => void;
  addExpense: (expense: Omit<OperationalExpense, 'id' | 'timestamp'>) => void;
  addRevenue: (revenue: Omit<RevenueMetric, 'id' | 'timestamp'>) => void;
  clearFinancials: () => void;
  calculateFinancialTotals: () => void;
}

export const useFinancialStore = create<FinancialState>()(
  loggerMiddleware((set, get) => ({
    targetMarginPercent: 60,
    expenses: [
      { id: 'exp_1', category: 'quimicos', amount: 350.50, description: 'Fipronil Pro lote 23', timestamp: new Date().toISOString() },
      { id: 'exp_2', category: 'combustivel', amount: 120.00, description: 'Deslocamento até Cliente Residencial', timestamp: new Date().toISOString() },
      { id: 'exp_3', category: 'diaria_tecnico', amount: 300.00, description: 'Duas diárias de equipe de controle', timestamp: new Date().toISOString() }
    ],
    revenues: [
      { id: 'rev_1', quoteId: 'q_101', clientName: 'Indústria Têxtil Ltda', finalPrice: 4200.00, marginPercent: 68, profit: 2856.00, timestamp: new Date().toISOString() },
      { id: 'rev_2', quoteId: 'q_102', clientName: 'Condomínio Solar', finalPrice: 1550.00, marginPercent: 62, profit: 961.00, timestamp: new Date().toISOString() }
    ],
    totalOperationalCosts: 770.50,
    totalConfirmedRevenue: 5750.00,
    actualGrossMarginPercent: 66.3,
    netProfit: 3046.50,

    setTargetMargin: (margin) => set({ targetMarginPercent: Math.max(0, Math.min(100, margin)) }),

    addExpense: (expenseData) => {
      const { expenses } = get();
      const newExpense: OperationalExpense = {
        ...expenseData,
        id: `exp_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString()
      };
      set({ expenses: [...expenses, newExpense] });
      get().calculateFinancialTotals();
    },

    addRevenue: (revenueData) => {
      const { revenues } = get();
      const newRevenue: RevenueMetric = {
        ...revenueData,
        id: `rev_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString()
      };
      set({ revenues: [...revenues, newRevenue] });
      get().calculateFinancialTotals();
    },

    clearFinancials: () => set({
      expenses: [],
      revenues: [],
      totalOperationalCosts: 0,
      totalConfirmedRevenue: 0,
      actualGrossMarginPercent: 100,
      netProfit: 0
    }),

    calculateFinancialTotals: () => {
      const { expenses, revenues } = get();
      
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalRevenue = revenues.reduce((sum, r) => sum + r.finalPrice, 0);
      const totalProfit = revenues.reduce((sum, r) => sum + r.profit, 0);
      
      const netProfit = totalRevenue - totalExpenses;
      const actualGrossMarginPercent = totalRevenue > 0
        ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100 * 10) / 10
        : 0;

      set({
        totalOperationalCosts: totalExpenses,
        totalConfirmedRevenue: totalRevenue,
        actualGrossMarginPercent,
        netProfit
      });
    }
  }))
);
