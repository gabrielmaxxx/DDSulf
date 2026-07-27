/**
 * PestFlow Customer Intelligence & Retention Analytics Service
 * Calculates Lifetime Value (LTV), Annual Contract Value (ACV), Churn Risk, and customer health scorecards.
 */

import { ChurnRiskIndicator } from '../types';

export interface CustomerSegmentStats {
  segment: 'agro_corporate' | 'silo_grain' | 'urban_commercial';
  activeCount: number;
  averageLTV: number;
  retentionRatePercent: number;
}

class CustomerIntelligenceService {
  private churnRisks: ChurnRiskIndicator[] = [];
  private segmentStats: CustomerSegmentStats[] = [];

  constructor() {
    this.seedCustomerData();
  }

  private seedCustomerData() {
    this.churnRisks = [
      {
        customerId: 'c_01',
        customerName: 'Cooperativa Agrícola Erechim Norte',
        riskScore: 78,
        lastActivityDays: 42,
        contractValue: 18500,
        predictedAction: 'Agendar pulverização preventiva e enviar relatório de conformidade assinado pelo RT.'
      },
      {
        customerId: 'c_02',
        customerName: 'Silos Reunidos Passo Fundo S/A',
        riskScore: 32,
        lastActivityDays: 14,
        contractValue: 45000,
        predictedAction: 'Renovação automática do plano semestral de desratização pesada.'
      },
      {
        customerId: 'c_03',
        customerName: 'Moinho Trigo de Santa Maria Limitada',
        riskScore: 89,
        lastActivityDays: 58,
        contractValue: 12400,
        predictedAction: 'Ligar imediatamente para propor auditorias de armadilha de roedores gratuitas.'
      },
      {
        customerId: 'c_04',
        customerName: 'Fazenda Rio Azul Parceria',
        riskScore: 15,
        lastActivityDays: 5,
        contractValue: 28000,
        predictedAction: 'Manter fluxograma de aspersores periódicos com visitas semanais.'
      }
    ];

    this.segmentStats = [
      {
        segment: 'agro_corporate',
        activeCount: 38,
        averageLTV: 74500,
        retentionRatePercent: 96.8
      },
      {
        segment: 'silo_grain',
        activeCount: 19,
        averageLTV: 112000,
        retentionRatePercent: 94.2
      },
      {
        segment: 'urban_commercial',
        activeCount: 145,
        averageLTV: 14200,
        retentionRatePercent: 88.5
      }
    ];
  }

  public getChurnRiskList(): ChurnRiskIndicator[] {
    return [...this.churnRisks];
  }

  public getSegmentStats(): CustomerSegmentStats[] {
    return [...this.segmentStats];
  }

  /**
   * Safe dismisses or reduces churn risk after an active operational touchpoint is logged
   */
  public remediateChurnRisk(customerId: string): boolean {
    const customer = this.churnRisks.find(c => c.customerId === customerId);
    if (!customer) return false;

    customer.riskScore = Math.max(5, customer.riskScore - 45); // highly mitigated
    customer.lastActivityDays = 0; // refreshed
    return true;
  }
}

export const customerIntelligenceService = new CustomerIntelligenceService();
export default customerIntelligenceService;
