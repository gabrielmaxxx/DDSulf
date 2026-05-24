import { eventBus } from '../events/eventBus';

export interface FinancialMetric {
  id: string;
  category: string;
  amount: number;
  description: string;
  timestamp: string;
  type: 'expense' | 'revenue';
}

export interface ConsolidatedBalances {
  totalRevenues: number;
  totalExpenses: number;
  netProfit: number;
  grossMarginPercent: number;
}

export class LiveFinancialEngine {
  private static instance: LiveFinancialEngine;
  private transactions: FinancialMetric[] = [
    { id: 'tx_default_1', category: 'quimicos', amount: 350.50, description: 'Lote Fipronil Pro', timestamp: new Date().toISOString(), type: 'expense' },
    { id: 'tx_default_2', category: 'combustivel', amount: 120.00, description: 'Deslocamento Técnico Rápido', timestamp: new Date().toISOString(), type: 'expense' },
    { id: 'tx_default_3', category: 'vendas', amount: 1550.00, description: 'Serviço Condomínio Solar', timestamp: new Date().toISOString(), type: 'revenue' },
    { id: 'tx_default_4', category: 'vendas', amount: 4200.00, description: 'Contrato Indústria Têxtil', timestamp: new Date().toISOString(), type: 'revenue' },
  ];

  public static getInstance(): LiveFinancialEngine {
    if (!LiveFinancialEngine.instance) {
      LiveFinancialEngine.instance = new LiveFinancialEngine();
    }
    return LiveFinancialEngine.instance;
  }

  /**
   * Register a fresh transaction live in our ledger and announce updates
   */
  public addMetric(metric: Omit<FinancialMetric, 'id' | 'timestamp'>): FinancialMetric {
    const fresh: FinancialMetric = {
      ...metric,
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.transactions.push(fresh);

    // Announce the change
    eventBus.publish('financial:cost_updated', {
      metric: fresh,
      balances: this.getBalances(),
    });

    return fresh;
  }

  /**
   * Returns aggregated total financial values
   */
  public getBalances(): ConsolidatedBalances {
    let totalRevenues = 0;
    let totalExpenses = 0;

    this.transactions.forEach((tx) => {
      if (tx.type === 'revenue') {
        totalRevenues += tx.amount;
      } else {
        totalExpenses += tx.amount;
      }
    });

    const netProfit = totalRevenues - totalExpenses;
    const grossMarginPercent = totalRevenues > 0 ? (netProfit / totalRevenues) * 100 : 100;

    return {
      totalRevenues: Math.round(totalRevenues * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      grossMarginPercent: Math.round(grossMarginPercent * 10) / 10,
    };
  }

  public getTransactions(): FinancialMetric[] {
    return [...this.transactions];
  }
}

export const liveFinancialEngine = LiveFinancialEngine.getInstance();
