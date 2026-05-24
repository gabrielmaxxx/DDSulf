/**
 * DDSulf Tracing Service
 * Profiles execution timelines, isolates performance blocks, and tracks transaction IDs across boundaries.
 */

import { ActivityTrace, OperationalDomain } from '../types';

class TracingService {
  private activeSpans = new Map<string, ActivityTrace>();
  private completedTraces: ActivityTrace[] = [];

  constructor() {
    this.seedBaselineTraces();
  }

  private seedBaselineTraces() {
    const defaultDate = new Date();
    this.completedTraces = [
      {
        traceId: 'tr_01',
        spanId: 'sp_01',
        name: 'Amortizar Saldadora de Pesticidas',
        startedAt: new Date(defaultDate.getTime() - 60000).toISOString(),
        durationMs: 42,
        domain: OperationalDomain.CRM_WORKFLOW,
        status: 'success',
        parameters: { inputsTotal: 5 }
      },
      {
        traceId: 'tr_02',
        spanId: 'sp_02',
        name: 'Conciliar Tabelas de Estoque Offline',
        startedAt: new Date(defaultDate.getTime() - 120000).toISOString(),
        durationMs: 140,
        domain: OperationalDomain.OFFLINE_RECONCILIATION,
        status: 'success',
        parameters: { syncConflictsDetected: 0 }
      },
      {
        traceId: 'tr_03',
        spanId: 'sp_03',
        name: 'Computar Recomendações de Pesticidas Baseadas em Clima',
        startedAt: new Date(defaultDate.getTime() - 180000).toISOString(),
        durationMs: 650,
        domain: OperationalDomain.AI_RECOMMENDATION,
        status: 'success',
        parameters: { explanationConfidence: 94.2 }
      }
    ];
  }

  /**
   * Starts a tracing sequence, generating span parameters
   */
  public startTrace(name: string, domain: OperationalDomain, parameters?: Record<string, any>): string {
    const traceId = `tr_${Math.random().toString(36).substr(2, 9)}`;
    const spanId = `sp_${Math.random().toString(36).substr(2, 9)}`;

    const freshSpan: ActivityTrace = {
      traceId,
      spanId,
      name,
      startedAt: new Date().toISOString(),
      domain,
      status: 'running',
      parameters
    };

    this.activeSpans.set(spanId, freshSpan);
    return spanId;
  }

  /**
   * Completes a tracing span, recording execution latencies in local history
   */
  public endTrace(spanId: string, status: 'success' | 'failed' = 'success'): ActivityTrace | null {
    const span = this.activeSpans.get(spanId);
    if (!span) return null;

    const endStamp = new Date();
    span.durationMs = endStamp.getTime() - new Date(span.startedAt).getTime();
    span.status = status;

    this.activeSpans.delete(spanId);
    
    // limit internal timeline array
    if (this.completedTraces.length > 200) {
      this.completedTraces.shift();
    }
    
    this.completedTraces.push(span);
    return span;
  }

  public getTraces(): ActivityTrace[] {
    return [...this.completedTraces];
  }

  public getActiveSpansCount(): number {
    return this.activeSpans.size;
  }
}

export const tracingService = new TracingService();
export default tracingService;
