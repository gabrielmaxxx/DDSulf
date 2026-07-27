/**
 * PestFlow KPI & Performance Measurement Service
 * Computes, versions, and aggregates key business indicators for sanitization compliance.
 */

import { OperationalKPI } from '../types';

class KPIService {
  private kpis: OperationalKPI[] = [];

  constructor() {
    this.seedBaselineKPIs();
  }

  private seedBaselineKPIs() {
    this.kpis = [
      {
        key: 'margin_total',
        name: 'Margem de Lucro Geral',
        value: 74.2,
        previousValue: 71.5,
        changePercent: 3.77,
        unit: 'percent',
        category: 'financial',
        description: 'Eficiência de faturamento líquido descontando insumos e horas-técnicas rurais.'
      },
      {
        key: 'ticket_medio',
        name: 'Ticket Médio de Ordem Sanitária',
        value: 1450,
        previousValue: 1390,
        changePercent: 4.31,
        unit: 'currency',
        category: 'financial',
        description: 'Faturamento médio computado por boletim químico de POP homologado.'
      },
      {
        key: 'technical_efficiency',
        name: 'Eficiência Horária dos Técnicos',
        value: 88.4,
        previousValue: 85.1,
        changePercent: 3.87,
        unit: 'percent',
        category: 'operational',
        description: 'Percentual de turnos gastos em aplicação química versus deslocamento rural.'
      },
      {
        key: 'inadimplencia',
        name: 'Taxa de Inadimplência Contratual',
        value: 1.8,
        previousValue: 2.4,
        changePercent: -25.0,
        unit: 'percent',
        category: 'financial',
        description: 'Atrasos de pagamento recorrentes de franquias rurais acima de 30 dias.'
      },
      {
        key: 'customer_retention',
        name: 'Retenção Anual de Contratos POP',
        value: 94.6,
        previousValue: 92.2,
        changePercent: 2.6,
        unit: 'percent',
        category: 'customer',
        description: 'Percentual de renovações de certificados sanitários sem intercorrências judiciais.'
      }
    ];
  }

  public getKPIs(category?: 'financial' | 'operational' | 'customer'): OperationalKPI[] {
    if (category) {
      return this.kpis.filter(k => k.category === category);
    }
    return [...this.kpis];
  }

  public getKPIDetails(key: string): OperationalKPI | undefined {
    return this.kpis.find(k => k.key === key);
  }

  public updateKPI(key: string, newValue: number): OperationalKPI | null {
    const kpi = this.kpis.find(k => k.key === key);
    if (!kpi) return null;

    kpi.previousValue = kpi.value;
    kpi.value = parseFloat(newValue.toFixed(2));
    
    if (kpi.previousValue !== 0) {
      kpi.changePercent = parseFloat((((kpi.value - kpi.previousValue) / kpi.previousValue) * 100).toFixed(2));
    } else {
      kpi.changePercent = 0;
    }

    return kpi;
  }
}

export const kpiService = new KPIService();
export default kpiService;
