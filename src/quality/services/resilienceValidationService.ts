/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChaosExperiment } from '../types';
import { INITIAL_CHAOS_EXPERIMENTS } from '../utils/testCases';

const CHAOS_EXPERIMENTS_KEY = 'ddsulf_chaos_experiments';

export class ResilienceValidationService {
  private experiments: ChaosExperiment[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.restoreExperiments();
  }

  private restoreExperiments() {
    try {
      const saved = localStorage.getItem(CHAOS_EXPERIMENTS_KEY);
      if (saved) {
        this.experiments = JSON.parse(saved);
      } else {
        this.experiments = [...INITIAL_CHAOS_EXPERIMENTS];
        this.persist();
      }
    } catch {
      this.experiments = [...INITIAL_CHAOS_EXPERIMENTS];
    }
  }

  private persist() {
    try {
      localStorage.setItem(CHAOS_EXPERIMENTS_KEY, JSON.stringify(this.experiments));
    } catch (e) {
      console.warn('Chaos persistence write fail:', e);
    }
    this.notify();
  }

  public subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getExperiments(): ChaosExperiment[] {
    return this.experiments;
  }

  public async triggerExperiment(id: string): Promise<ChaosExperiment | null> {
    const exp = this.experiments.find(e => e.id === id);
    if (!exp) return null;

    exp.status = 'active';
    this.persist();

    // Trigger visual simulation flag in localStorage for app behavior hooks
    localStorage.setItem(`ddsulf_chaos_${exp.injectedFailureType}`, 'true');

    // Simulate duration of direct systemic threat
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Recovery is simulated based on self-healing retry layers
    exp.status = 'completed';
    exp.systemRecoveryTimeMs = Math.floor(Math.random() * 800) + 200; // MTTR usually is low and highly resilient
    this.persist();

    return exp;
  }

  public stopExperiment(id: string) {
    const exp = this.experiments.find(e => e.id === id);
    if (exp) {
      exp.status = 'idle';
      localStorage.removeItem(`ddsulf_chaos_${exp.injectedFailureType}`);
      this.persist();
    }
  }

  public stopAllExperiments() {
    this.experiments.forEach(e => {
      e.status = 'idle';
      localStorage.removeItem(`ddsulf_chaos_${e.injectedFailureType}`);
    });
    this.persist();
  }

  public getMTTR(): number {
    const completed = this.experiments.filter(e => e.status === 'completed' && e.systemRecoveryTimeMs);
    if (completed.length === 0) return 340; // baseline 340ms MTTR
    const sum = completed.reduce((acc, curr) => acc + (curr.systemRecoveryTimeMs || 0), 0);
    return Math.round(sum / completed.length);
  }

  public getGracefulDegradationScore(): number {
    // Graceful degradation refers to keeping app operable during offline drops or latency
    // Baseline is 100%, each active experiment degrades score slightly, but never crashes
    let score = 100;
    const activeCount = this.experiments.filter(e => e.status === 'active').length;
    score -= (activeCount * 8); // extremely resilient, only minor impacts
    return Math.max(score, 75);
  }
}

export const resilienceValidationService = new ResilienceValidationService();
export default resilienceValidationService;
