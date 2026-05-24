/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { OrganizationalReadiness } from '../types';

const STORAGE_KEY = 'ddsulf_adoption_maturity';

export class TransformationIntelligenceService {
  private readiness: OrganizationalReadiness | null = null;

  constructor() {
    this.initializeReadiness();
  }

  private initializeReadiness() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.readiness = JSON.parse(saved);
      } else {
        this.readiness = {
          resistanceFactorPercent: 28,
          staffTrainedRatio: 45,
          offlineSyncTestingPassed: true,
          overallHealthScore: 78
        };
        this.persist();
      }
    } catch {
      // offline friendly
    }
  }

  private persist() {
    try {
      if (this.readiness) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.readiness));
      }
    } catch (e) {
      console.warn('Maturity state save error:', e);
    }
  }

  public getReadiness(): OrganizationalReadiness {
    if (!this.readiness) {
      this.initializeReadiness();
    }
    return this.readiness!;
  }

  public updateResistance(variation: number) {
    if (this.readiness) {
      this.readiness.resistanceFactorPercent = Math.min(100, Math.max(0, this.readiness.resistanceFactorPercent + variation));
      this.recomputeOverallScore();
      this.persist();
    }
  }

  public updateStaffTrained(trainedRatio: number) {
    if (this.readiness) {
      this.readiness.staffTrainedRatio = Math.min(100, Math.max(0, trainedRatio));
      this.recomputeOverallScore();
      this.persist();
    }
  }

  private recomputeOverallScore() {
    if (this.readiness) {
      const resistancePenalty = (100 - this.readiness.resistanceFactorPercent) * 0.4;
      const trainingWeight = this.readiness.staffTrainedRatio * 0.4;
      const offlineBonus = this.readiness.offlineSyncTestingPassed ? 20 : 0;
      this.readiness.overallHealthScore = Math.round(resistancePenalty + trainingWeight + offlineBonus);
    }
  }
}

export const transformationIntelligenceService = new TransformationIntelligenceService();
export default transformationIntelligenceService;
