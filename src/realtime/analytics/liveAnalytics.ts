import { eventBus } from '../events/eventBus';

export interface LiveKPIState {
  servicesCompleted: number;
  totalPesticideMLUsed: number;
  revenueGenerated: number;
  averageMarginPercent: number;
  activeHazardsCount: number;
}

export class LiveAnalyticsTracker {
  private static instance: LiveAnalyticsTracker;
  private kpis: LiveKPIState = {
    servicesCompleted: 42,
    totalPesticideMLUsed: 12400,
    revenueGenerated: 5750,
    averageMarginPercent: 65,
    activeHazardsCount: 0,
  };
  private alertLogs: string[] = [];

  public static getInstance(): LiveAnalyticsTracker {
    if (!LiveAnalyticsTracker.instance) {
      LiveAnalyticsTracker.instance = new LiveAnalyticsTracker();
    }
    return LiveAnalyticsTracker.instance;
  }

  /**
   * Initializes listeners to build continuous aggregate variables based on operational flows
   */
  public startTracking(): void {
    eventBus.subscribe('operational:chemical_used', (evt) => {
      this.kpis.totalPesticideMLUsed += (evt.payload.input?.areaSize || 0) * 12; // average dosage estimate
      eventBus.publish('analytics:kpi_pulsed', this.kpis);
    });

    eventBus.subscribe('workflow:completed', (evt) => {
      this.kpis.servicesCompleted += 1;
      this.kpis.revenueGenerated += evt.payload.finalPrice || 0;
      eventBus.publish('analytics:kpi_pulsed', this.kpis);
    });

    eventBus.subscribe('financial:margin_leakage', (evt) => {
      this.kpis.activeHazardsCount += 1;
      this.alertLogs.push(`[${evt.timestamp}] ${evt.payload.message}`);
      eventBus.publish('analytics:kpi_pulsed', this.kpis);
    });
  }

  public getKpis(): LiveKPIState {
    return { ...this.kpis };
  }

  public getAlertLogs(): string[] {
    return [...this.alertLogs];
  }
}

export const liveAnalyticsTracker = LiveAnalyticsTracker.getInstance();
