/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { RolloutFeatureGate, RolloutPhase } from '../types';

const STORAGE_KEY = 'ddsulf_adoption_rollout';

export class RolloutOrchestrationService {
  private featureGates: RolloutFeatureGate[] = [];

  constructor() {
    this.initializeDefaultGates();
  }

  private initializeDefaultGates() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.featureGates = JSON.parse(saved);
      } else {
        this.featureGates = [
          {
            id: 'gate_analytics_dashboard',
            featureName: 'Dashboard Avançado de Lucratividade',
            requiredPhase: RolloutPhase.ALPHA_PILOT,
            isEnabled: true,
            adoptedUsersCount: 14,
            criticality: 'medium'
          },
          {
            id: 'gate_pesticide_calculator',
            featureName: 'Calculadora Estequiométrica Avançada',
            requiredPhase: RolloutPhase.ALPHA_PILOT,
            isEnabled: true,
            adoptedUsersCount: 11,
            criticality: 'high'
          },
          {
            id: 'gate_pops_anvisa',
            featureName: 'Laudos Técnicos POPs & Integração Reguladora',
            requiredPhase: RolloutPhase.REGIONAL_BETA,
            isEnabled: false,
            adoptedUsersCount: 0,
            criticality: 'high'
          },
          {
            id: 'gate_executive_copilot',
            featureName: 'Copiloto de Decisões e Previsão de Demanda',
            requiredPhase: RolloutPhase.ENTERPRISE_WIDE,
            isEnabled: false,
            adoptedUsersCount: 0,
            criticality: 'low'
          }
        ];
        this.persist();
      }
    } catch {
      // offline silent
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.featureGates));
    } catch (e) {
      console.warn('Rollout state write failed:', e);
    }
  }

  public getGates(): RolloutFeatureGate[] {
    return this.featureGates;
  }

  public toggleGate(id: string): boolean {
    const item = this.featureGates.find(g => g.id === id);
    if (item) {
      item.isEnabled = !item.isEnabled;
      if (!item.isEnabled) {
        item.adoptedUsersCount = 0;
      } else {
        item.adoptedUsersCount = Math.round(5 + Math.random() * 15);
      }
      this.persist();
      return true;
    }
    return false;
  }

  public incrementGatesAdoption(id: string) {
    const item = this.featureGates.find(g => g.id === id);
    if (item && item.isEnabled) {
      item.adoptedUsersCount += 1;
      this.persist();
    }
  }
}

export const rolloutOrchestrationService = new RolloutOrchestrationService();
export default rolloutOrchestrationService;
