/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReliabilityMetric } from '../types';
import { qaOrchestrationService } from './qaOrchestrationService';
import { resilienceValidationService } from './resilienceValidationService';

const SCORE_HISTORY_KEY = 'ddsulf_reliability_index_history';

export class ReliabilityAnalyticsService {
  private scoreHistory: number[] = [99.8, 99.85, 99.82, 99.9, 99.92];

  constructor() {
    this.restoreHistory();
  }

  private restoreHistory() {
    try {
      const saved = localStorage.getItem(SCORE_HISTORY_KEY);
      if (saved) {
        this.scoreHistory = JSON.parse(saved);
      } else {
        this.persist();
      }
    } catch {
      // safe fallback
    }
  }

  private persist() {
    try {
      localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(this.scoreHistory));
    } catch (e) {
      console.warn('Reliability history failed:', e);
    }
  }

  public getReliabilityIndex(): number {
    // Computes dynamic score inspired by Uber/Stripe SRE indicators
    const report = qaOrchestrationService.getLatestReport();
    const passedRatio = report.totalTests > 0 ? report.passedCount / report.totalTests : 1;
    
    const degradation = resilienceValidationService.getGracefulDegradationScore();
    const mttr = resilienceValidationService.getMTTR();

    // MTTR impact
    const mttrPenalty = Math.max(0, (mttr - 300) / 100); // minor penalty above 300ms

    const baseIndex = (passedRatio * 60) + (degradation * 0.35) - mttrPenalty;
    const finalIndex = Math.min(100, Math.max(10, baseIndex + 5)); // shift scale slightly to typical range

    return parseFloat(finalIndex.toFixed(2));
  }

  public getScoreHistory(): number[] {
    return this.scoreHistory;
  }

  public addToHistory(newScore: number) {
    if (this.scoreHistory.length >= 10) {
      this.scoreHistory.shift();
    }
    this.scoreHistory.push(newScore);
    this.persist();
  }

  public getLiveMetrics(): ReliabilityMetric[] {
    const isOffline = localStorage.getItem('ddsulf_chaos_network_offline') === 'true';
    const hasLatency = localStorage.getItem('ddsulf_chaos_latency') === 'true';

    return [
      {
        id: 'met_01_uptime',
        name: 'SLA Uptime Mensal',
        value: isOffline ? 99.25 : 99.99,
        target: 99.95,
        unit: '%',
        status: isOffline ? 'warning' : 'optimal',
        timestamp: Date.now()
      },
      {
        id: 'met_02_latency',
        name: 'Latência do Barramento (P50)',
        value: hasLatency ? 3512 : 24,
        target: 250,
        unit: 'ms',
        status: hasLatency ? 'critical' : 'optimal',
        timestamp: Date.now()
      },
      {
        id: 'met_03_mttr',
        name: 'Média de Tempo de Recuperação (MTTR)',
        value: resilienceValidationService.getMTTR(),
        target: 500,
        unit: 'ms',
        status: 'optimal',
        timestamp: Date.now()
      },
      {
        id: 'met_04_degradation',
        name: 'Grau de Resiliência Ativa',
        value: resilienceValidationService.getGracefulDegradationScore(),
        target: 90,
        unit: '%',
        status: resilienceValidationService.getGracefulDegradationScore() < 90 ? 'warning' : 'optimal',
        timestamp: Date.now()
      }
    ];
  }
}

export const reliabilityAnalyticsService = new ReliabilityAnalyticsService();
export default reliabilityAnalyticsService;
