import { BaseFirestoreService } from '../firestore/BaseFirestoreService';
import { DashboardMetric } from '@/types/database';
import { logOperationalEvent } from '@/firebase/analytics';

export class DashboardService extends BaseFirestoreService<DashboardMetric> {
  constructor() {
    super('dashboard_metrics');
  }

  /**
   * Retrieves specific pre-calculated operational metrics
   */
  async getMetricValue(key: string, period: string = 'current_month'): Promise<number> {
    try {
      const records = await this.list({
        filters: [
          { field: 'key', operator: '==', value: key },
          { field: 'period', operator: '==', value: period }
        ]
      });

      if (records.length === 0) return 0;
      return records[0].value;
    } catch (e) {
      console.warn(`[DashboardService] Metric retrieval fallback for key ${key}:`, e);
      return 0;
    }
  }

  /**
   * Commits/updates a dynamic operational KPI snapshot without UI friction
   */
  async setMetricValue(key: string, value: number, period: string = 'current_month'): Promise<void> {
    logOperationalEvent('dashboard_metric_update', { key, value, period });
    
    const existing = await this.list({
      filters: [
        { field: 'key', operator: '==', value: key },
        { field: 'period', operator: '==', value: period }
      ]
    });

    const metricPayload: Omit<DashboardMetric, 'id'> = {
      key,
      value,
      period,
      timestamp: new Date().toISOString()
    };

    if (existing.length > 0 && existing[0].id) {
      await this.update(existing[0].id, metricPayload as any);
    } else {
      await this.create(metricPayload as any);
    }
  }

  /**
   * Aggregates live numbers over system elements to recalculate system health index
   */
  async computeLiveAggregates(): Promise<{
    activeQuotesCount: number;
    completedServicesCount: number;
    warningsCount: number;
  }> {
    // Dynamically retrieve collections counts
    const { quotesService } = await import('../calculator/quotes');
    const { productsService } = await import('../inventory/inventory');

    const quotesList = await quotesService.list();
    const alertProductsList = await productsService.getUnderstockAlerts();

    const activeQuotesCount = quotesList.filter(q => q.status === 'Aprovado' || q.status === 'Enviado').length;
    const completedServicesCount = quotesList.filter(q => q.status === 'Executado').length;
    const warningsCount = alertProductsList.length;

    // Cache results synchronously inside dashboard_metrics
    await this.setMetricValue('active_quotes', activeQuotesCount);
    await this.setMetricValue('completed_services', completedServicesCount);
    await this.setMetricValue('understock_items', warningsCount);

    return {
      activeQuotesCount,
      completedServicesCount,
      warningsCount
    };
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
