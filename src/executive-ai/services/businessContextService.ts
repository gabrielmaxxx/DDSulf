/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoardLevelSnapshot } from '../types';

const CONTEXT_STORAGE_KEY = 'ddsulf_executive_context';

export class BusinessContextService {
  private boardSnapshot: BoardLevelSnapshot | null = null;

  constructor() {
    this.initializeDefaultContext();
  }

  private initializeDefaultContext() {
    try {
      const saved = localStorage.getItem(CONTEXT_STORAGE_KEY);
      if (saved) {
        this.boardSnapshot = JSON.parse(saved);
      } else {
        this.boardSnapshot = {
          mrrTotal: 96000.00,
          activeContractsRatio: 92,
          operationalEfficiencyCoefficient: 0.84,
          contingentAssetsReservedBrl: 450000.00,
          monthlySafetyIndexPercent: 98.7
        };
        this.persist();
      }
    } catch {
      // offline silent mode
    }
  }

  private persist() {
    try {
      if (this.boardSnapshot) {
        localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(this.boardSnapshot));
      }
    } catch (e) {
      console.warn('Executive context write failed:', e);
    }
  }

  public getBoardSnapshot(): BoardLevelSnapshot {
    if (!this.boardSnapshot) {
      this.initializeDefaultContext();
    }
    return this.boardSnapshot!;
  }

  public updateSafetyIndex(newIndex: number) {
    if (this.boardSnapshot) {
      this.boardSnapshot.monthlySafetyIndexPercent = Math.min(100, Math.max(0, newIndex));
      this.persist();
    }
  }

  public recordContingentAssetTransfer(amountBrl: number) {
    if (this.boardSnapshot) {
      this.boardSnapshot.contingentAssetsReservedBrl += amountBrl;
      this.persist();
    }
  }
}

export const businessContextService = new BusinessContextService();
export default businessContextService;
