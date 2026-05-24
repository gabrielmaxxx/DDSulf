/**
 * DDSulf System Diagnostics & Health Scoring Service
 * Models real-time operation health indexes and predicts memory degradation thresholds.
 */

import { SystemHealthScore, OperationalDomain } from '../types';

class DiagnosticsService {
  private baseHealthScore = 98;
  private databaseStatus: 'optimal' | 'degraded' | 'critical' = 'optimal';
  private socketState: 'connected' | 'unstable' | 'disconnected' = 'connected';
  private explainabilityIndex = 96.5;

  public getSystemHealth(activeIncidentsCount: number = 0): SystemHealthScore {
    // Dynamic score discount depending on incidents and instability statuses
    let currentScore = this.baseHealthScore;
    if (activeIncidentsCount > 0) currentScore -= activeIncidentsCount * 12;
    if (this.databaseStatus === 'degraded') currentScore -= 10;
    if (this.socketState === 'unstable') currentScore -= 15;

    return {
      databaseHealthStatus: this.databaseStatus,
      realtimeConnectionState: this.socketState,
      aiExplainabilityScore: this.explainabilityIndex,
      overallScore: Math.max(12, currentScore),
      activeIncidentCount: activeIncidentsCount
    };
  }

  public setDatabaseHealth(status: 'optimal' | 'degraded' | 'critical') {
    this.databaseStatus = status;
  }

  public setSocketState(state: 'connected' | 'unstable' | 'disconnected') {
    this.socketState = state;
  }

  public calibrateExplainability(score: number) {
    this.explainabilityIndex = Math.max(0, Math.min(100, score));
  }
}

export const diagnosticsService = new DiagnosticsService();
export default diagnosticsService;
