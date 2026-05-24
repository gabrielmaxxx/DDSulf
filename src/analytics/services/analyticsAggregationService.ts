/**
 * DDSulf Analytics Aggregation & Data Warehousing Broker
 * Synthesizes multi-tenant records, formula costs, and isolates operational databases.
 */

import { ServiceProfitability } from '../types';

class AnalyticsAggregationService {
  private baseProfitabilityByService: ServiceProfitability[] = [];

  constructor() {
    this.seedProfitability();
  }

  private seedProfitability() {
    this.baseProfitabilityByService = [
      {
        serviceId: 'srv_cupim',
        serviceName: 'Termitização Estrutural (Cupins)',
        revenue: 145000,
        costTotal: 34800,
        netProfit: 110200,
        marginPercent: 76.0,
        technicalHours: 240
      },
      {
        serviceId: 'srv_roedor',
        serviceName: 'Desratização de Silos Graneleiros',
        revenue: 210000,
        costTotal: 63000,
        netProfit: 147000,
        marginPercent: 70.0,
        technicalHours: 480
      },
      {
        serviceId: 'srv_barata',
        serviceName: 'Desinsetização em Cadeia de Alimentos',
        revenue: 95000,
        costTotal: 18050,
        netProfit: 76950,
        marginPercent: 81.0,
        technicalHours: 195
      },
      {
        serviceId: 'srv_jardim',
        serviceName: 'Pulverização Agrícola de Hortas',
        revenue: 64000,
        costTotal: 22400,
        netProfit: 41600,
        marginPercent: 65.0,
        technicalHours: 110
      }
    ];
  }

  public getServiceProfitability(): ServiceProfitability[] {
    return [...this.baseProfitabilityByService];
  }

  /**
   * Safe updates a specific service's revenue or costs when a financial ledger changes
   */
  public registerFinancialChange(serviceId: string, deltaRevenue: number, deltaCost: number): ServiceProfitability | null {
    const service = this.baseProfitabilityByService.find(s => s.serviceId === serviceId);
    if (!service) return null;

    service.revenue += deltaRevenue;
    service.costTotal += deltaCost;
    service.netProfit = service.revenue - service.costTotal;
    
    if (service.revenue > 0) {
      service.marginPercent = parseFloat(((service.netProfit / service.revenue) * 100).toFixed(1));
    } else {
      service.marginPercent = 0;
    }

    return service;
  }

  /**
   * Simple calculation of chemical cost efficiency based on active dilution matrices
   */
  public calculateDilutionEfficacy(pesticideDensityKg: number, waterLiters: number, costPerKg: number): {
    combinedVolumeLiters: number;
    costPerLiter: number;
    recommendedSalesPriceMulti: number;
  } {
    const combinedVolume = pesticideDensityKg + waterLiters; // approximation for dilute mixtures
    const totalResourceCost = pesticideDensityKg * costPerKg;
    const costPerLiter = combinedVolume > 0 ? (totalResourceCost / combinedVolume) : 0;
    
    // recommend 5x premium margin pricing standard for DDSulf technical services
    const baseRecommendPrice = costPerLiter * 5;

    return {
      combinedVolumeLiters: combinedVolume,
      costPerLiter: parseFloat(costPerLiter.toFixed(2)),
      recommendedSalesPriceMulti: parseFloat(baseRecommendPrice.toFixed(2))
    };
  }
}

export const analyticsAggregationService = new AnalyticsAggregationService();
export default analyticsAggregationService;
