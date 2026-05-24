/**
 * DDSulf Fault Resilience, circuit-breakers and Graceful Degradation Engine
 */

import { CircuitBreakerStatus, HardeningOperationalState } from '../types';

class ResilienceBreakerRegistry {
  private statusMap = new Map<string, CircuitBreakerStatus>();
  private globalState: HardeningOperationalState = {
    adaptiveBatterySavingActive: false,
    blockUnauthenticatedRealtimeListeners: true,
    forcedMemoryGarbagePurgeIntervalSeconds: 30,
    fallbackActive: false
  };

  /**
   * Evaluates if a critical service can be triggered (e.g. Gemini, external credit, etc.)
   */
  public attemptAccess(serviceKey: string, cooldownMs: number = 8000): boolean {
    let breaker = this.statusMap.get(serviceKey);
    
    if (!breaker) {
      this.statusMap.set(serviceKey, {
        serviceKey,
        state: 'closed',
        failureCount: 0,
        cooldownPeriodMs: cooldownMs
      });
      return true; // Safe
    }

    if (breaker.state === 'open') {
      if (breaker.lastFailureTime && Date.now() - breaker.lastFailureTime > breaker.cooldownPeriodMs) {
        // Cooldown passed, test system in half-open status
        breaker.state = 'half_open';
        return true;
      }
      return false; // Trip blocked, service currently down
    }

    return true; // closed or half_open
  }

  /**
   * Registers a service failure
   */
  public reportFailure(serviceKey: string, limit: number = 4): void {
    let breaker = this.statusMap.get(serviceKey);
    if (!breaker) return;

    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();

    if (breaker.failureCount >= limit) {
      breaker.state = 'open';
      this.globalState.fallbackActive = true;
      console.error(`[DDSulf Hardening CircuitBreaker] Raised TRIP state on ${serviceKey}! Requests are blocked for fallback protection.`);
    }
  }

  /**
   * Resets status after a successful call
   */
  public reportSuccess(serviceKey: string): void {
    let breaker = this.statusMap.get(serviceKey);
    if (breaker) {
      breaker.state = 'closed';
      breaker.failureCount = 0;
      breaker.lastFailureTime = undefined;
    }
  }

  public getCircuitStatus(serviceKey: string): CircuitBreakerStatus['state'] {
    return this.statusMap.get(serviceKey)?.state || 'closed';
  }

  /**
   * Controls adaptive downscaling mode for low-end devices or critical performance states
   */
  public toggleBatterySavingMode(active: boolean): void {
    this.globalState.adaptiveBatterySavingActive = active;
  }

  public getResilienceState(): HardeningOperationalState {
    return { ...this.globalState };
  }
}

export const resilienceBreaker = new ResilienceBreakerRegistry();
export default resilienceBreaker;
