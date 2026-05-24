import { BaseFirestoreService } from '../firestore/BaseFirestoreService';
import { FinancialCost, Revenue } from '@/types/database';
import { logOperationalEvent, logFinancialTx } from '@/firebase/analytics';

/**
 * Enterprise service wrapping Financial Costs inputs and aggregates
 */
export class CostsService extends BaseFirestoreService<FinancialCost> {
  constructor() {
    super('financial_costs');
  }

  /**
   * Safe financial transaction registration logging
   */
  async registerCost(cost: Omit<FinancialCost, 'id' | 'createdAt'>): Promise<FinancialCost> {
    logOperationalEvent('financial_cost_register_requested', { category: cost.category, amount: cost.amount });
    
    const inputPayload = {
      ...cost,
      createdAt: new Date().toISOString()
    };

    const newCost = await this.create(inputPayload as any);
    logFinancialTx('expense', cost.amount, cost.category);
    logOperationalEvent('financial_cost_registered', { id: newCost.id });
    
    return newCost as FinancialCost;
  }

  /**
   * Aggregate total active costs partitioned by target Category
   */
  async getAggregatedCostsPartition(startDateISO?: string): Promise<Record<string, number>> {
    const filters: any[] = [];
    if (startDateISO) {
      filters.push({ field: 'createdAt', operator: '>=', value: startDateISO });
    }

    const costItems = await this.list({ filters });
    const totals: Record<string, number> = {
      Fixo: 0,
      Variável: 0,
      Operacional: 0
    };

    costItems.forEach(item => {
      const cat = item.category || 'Operacional';
      if (totals[cat] !== undefined) {
        totals[cat] += item.amount;
      } else {
        totals[cat] = item.amount;
      }
    });

    return totals;
  }
}

/**
 * Enterprise service wrapping Receivables and billing aggregates
 */
export class RevenuesService extends BaseFirestoreService<Revenue> {
  constructor() {
    super('revenues');
  }

  /**
   * Symmetrically save incoming billing revenue slips
   */
  async registerRevenue(revenue: Omit<Revenue, 'id' | 'createdAt'>): Promise<Revenue> {
    logOperationalEvent('financial_revenue_register_requested', { amount: revenue.amount });
    
    const payload = {
      ...revenue,
      createdAt: new Date().toISOString()
    };

    const newRev = await this.create(payload as any);
    logFinancialTx('receipt', revenue.amount, revenue.category);
    logOperationalEvent('financial_revenue_registered', { id: newRev.id });
    
    return newRev as Revenue;
  }

  /**
   * Sum total aggregate receipts
   */
  async getTotalRevenue(startDateISO?: string): Promise<number> {
    const filters: any[] = [];
    if (startDateISO) {
      filters.push({ field: 'receivedAt', operator: '>=', value: startDateISO });
    }

    const revenues = await this.list({ filters });
    return revenues.reduce((acc, rev) => acc + rev.amount, 0);
  }
}

export const costsService = new CostsService();
export const revenuesService = new RevenuesService();
export default { costsService, revenuesService };
