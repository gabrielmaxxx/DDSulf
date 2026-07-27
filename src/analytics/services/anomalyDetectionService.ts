/**
 * PestFlow Realtime Anomaly & Outlier Detection Engine
 * Scans metrics streams for technical variations, hazardous weather peaks, or margin drops and outputs critical states.
 */

import { decisionEngineService } from './decisionEngineService';
import { kpiService } from './kpiService';

export interface OperationalAnomaly {
  anomalyId: string;
  metricKey: string;
  source: string;
  recordedValue: number;
  expectedLimit: number;
  severity: 'low' | 'medium' | 'critical';
  detectionTime: string;
  remedyAction: string;
}

class AnomalyDetectionService {
  private activeAnomalies: OperationalAnomaly[] = [];

  constructor() {
    this.seedAnomalies();
  }

  private seedAnomalies() {
    this.activeAnomalies = [
      {
        anomalyId: 'an_01',
        metricKey: 'chemical_dilution_ratio',
        source: 'Misturador Automatizado Erechim HQ',
        recordedValue: 12.8, // percent of concentrate fipronil
        expectedLimit: 10.0, // acceptable limit
        severity: 'critical',
        detectionTime: new Date(Date.now() - 30 * 60000).toISOString(),
        remedyAction: 'Regular válvula de irrigação rural para introduzir 2.5 litros de diluente aquoso neutralizador.'
      },
      {
        anomalyId: 'an_02',
        metricKey: 'commute_hours_ratio',
        source: 'Silos Passo Fundo Rota 03',
        recordedValue: 3.4, // hours in transit for 1 hr application
        expectedLimit: 2.0,
        severity: 'medium',
        detectionTime: new Date(Date.now() - 120 * 60000).toISOString(),
        remedyAction: 'Agrupar OS com o condomínio de armazenamento agrícola vizinho para equilibrar descolamento.'
      }
    ];
  }

  public getActiveAnomalies(): OperationalAnomaly[] {
    return [...this.activeAnomalies];
  }

  /**
   * Scans existing KPIs and triggers decision recommendations if values fall outside standard tolerances
   */
  public runAutomatedScan(): OperationalAnomaly[] {
    const marginKpi = kpiService.getKPIDetails('margin_total');
    if (marginKpi && marginKpi.value < 65) {
      const exists = this.activeAnomalies.find(a => a.metricKey === 'margin_total');
      if (!exists) {
        const anomaly: OperationalAnomaly = {
          anomalyId: `an_${Math.random().toString(36).substr(2, 9)}`,
          metricKey: 'margin_total',
          source: 'Finanças Consolidadas PestFlow',
          recordedValue: marginKpi.value,
          expectedLimit: 65,
          severity: 'critical',
          detectionTime: new Date().toISOString(),
          remedyAction: 'Disparar reajuste tarifário agro de emergência no painel de calibrador de margens.'
        };
        this.activeAnomalies.unshift(anomaly);

        // Feed decision engine
        decisionEngineService.triggerInsight(
          'profitability',
          'Margem de Lucro Abaixo do SLA Mínimo',
          `Sua margem atual de ${marginKpi.value}% quebrou a barreira aceitável de 65% na regional Erechim.`,
          anomaly.remedyAction,
          92
        );
      }
    }
    return [...this.activeAnomalies];
  }

  /**
   * Forces/Injects custom technical outliers into the auditor loop
   */
  public injectTechnicalOutlier(
    metricKey: string,
    source: string,
    recordedValue: number,
    expectedLimit: number,
    severity: 'low' | 'medium' | 'critical',
    remedyAction: string
  ): OperationalAnomaly {
    const anomaly: OperationalAnomaly = {
      anomalyId: `an_${Math.random().toString(36).substr(2, 9)}`,
      metricKey,
      source,
      recordedValue,
      expectedLimit,
      severity,
      detectionTime: new Date().toISOString(),
      remedyAction
    };

    this.activeAnomalies.unshift(anomaly);

    // Feed decision engine
    decisionEngineService.triggerInsight(
      'anomaly',
      `Anomalia: Desvio detectado em ${metricKey}`,
      `Aferido valor anormal de ${recordedValue} (Limite esperado: ${expectedLimit}) em ${source}.`,
      remedyAction,
      severity === 'critical' ? 95 : severity === 'medium' ? 70 : 40
    );

    return anomaly;
  }
}

export const anomalyDetectionService = new AnomalyDetectionService();
export default anomalyDetectionService;
