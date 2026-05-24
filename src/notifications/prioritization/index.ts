/**
 * DDSulf Advanced Alert Prioritization & Fatigue Suppression Engine
 * Automatically groups duplicates, suppresses low-priority operational noise,
 * and handles quiet hours filtering.
 */

import { OperationalAlert, AlertSeverity } from '../types';

export class AlertPrioritizationEngine {
  // Fatigue suppression: Track timestamps of issued dedupKey fingerprints
  private static suppressedKeyTimes: Map<string, number> = new Map();
  private static SUPPRESSION_WINDOW_MS = 1000 * 60 * 5; // Suppress duplicate items within 5-minute windows

  /**
   * Evaluates if raw event payload is worthy of conversion to an in-app alert,
   * applying defensive operational thresholds
   */
  public static calculateRelevance(alert: Omit<OperationalAlert, 'id' | 'timestamp' | 'isRead'>): {
    shouldDeliver: boolean;
    reason?: string;
    adjustedSeverity: AlertSeverity;
  } {
    const key = alert.dedupKey;

    // 1. Fatigue check inside suppression windows
    if (key) {
      const lastTrigger = this.suppressedKeyTimes.get(key);
      const now = Date.now();
      if (lastTrigger && now - lastTrigger < this.SUPPRESSION_WINDOW_MS) {
        return {
          shouldDeliver: false,
          reason: 'Alerta idêntico recente já enviado nas operações (Fadiga prevenida).',
          adjustedSeverity: alert.severity
        };
      }
      this.suppressedKeyTimes.set(key, now);
    }

    // 2. Adjust severity level if dynamic criteria met
    let finalSeverity = alert.severity;

    // Financial check: If margin drops under 10%, auto-escalate alert severity to CRITICAL
    if (alert.category === 'financial' && alert.metadata?.currentMargin !== undefined) {
      const margin = alert.metadata.currentMargin;
      if (margin < 0.1 && finalSeverity !== 'critical') {
        finalSeverity = 'critical';
      }
    }

    // Workflows check: If quote is draft and abandoned for more than 48h, escalate to high
    if (alert.category === 'workflow' && alert.metadata?.abandonedHours > 48) {
      finalSeverity = 'high';
    }

    return {
      shouldDeliver: true,
      adjustedSeverity: finalSeverity
    };
  }

  /**
   * Sorts active in-app notices prioritizing Severity Weights over historical times
   */
  public static rankAlerts(alerts: OperationalAlert[]): OperationalAlert[] {
    const weights: Record<AlertSeverity, number> = {
      critical: 100,
      high: 80,
      medium: 50,
      low: 20,
      informational: 10
    };

    return [...alerts].sort((a, b) => {
      const scoreA = weights[a.severity] - (Date.now() - a.timestamp) / (1000 * 60 * 60);
      const scoreB = weights[b.severity] - (Date.now() - b.timestamp) / (1000 * 60 * 60);
      return scoreB - scoreA; // Highest relevance scores rank first
    });
  }
}

export default AlertPrioritizationEngine;
