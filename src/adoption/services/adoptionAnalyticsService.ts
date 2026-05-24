/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { MigrationBatch } from '../types';

const STORAGE_KEY = 'ddsulf_adoption_migration';

export class AdoptionAnalyticsService {
  private batches: MigrationBatch[] = [];

  constructor() {
    this.initializeMigrationBatches();
  }

  private initializeMigrationBatches() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.batches = JSON.parse(saved);
      } else {
        this.batches = [
          {
            id: 'batch_001_v1_inventory',
            sourceSystemName: 'Inventário Geral Legado (Planilhas Pelotas)',
            recordsCount: 142,
            status: 'done',
            integrityHash: 'sha256-f6d3a82...'
          },
          {
            id: 'batch_002_customer_addresses',
            sourceSystemName: 'Contratos e Endereços Regionais (CRM Antigo)',
            recordsCount: 450,
            status: 'processing',
            integrityHash: 'sha256-4c918ee...'
          }
        ];
        this.persist();
      }
    } catch {
      // offline silent mode
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.batches));
    } catch (e) {
      console.warn('Adoption migration persistence failure:', e);
    }
  }

  public getBatches(): MigrationBatch[] {
    return this.batches;
  }

  public importNewBatch(sourceSystemName: string, recordsCount: number): MigrationBatch {
    const newBatch: MigrationBatch = {
      id: `batch_003_custom_${Date.now()}`,
      sourceSystemName,
      recordsCount,
      status: 'pending',
      integrityHash: `sha256-${Math.random().toString(36).substring(4)}`
    };

    this.batches.unshift(newBatch);
    this.persist();

    // simulate progress background
    setTimeout(() => {
      newBatch.status = 'processing';
      this.persist();
    }, 1500);

    setTimeout(() => {
      newBatch.status = 'done';
      this.persist();
    }, 4500);

    return newBatch;
  }
}

export const adoptionAnalyticsService = new AdoptionAnalyticsService();
export default adoptionAnalyticsService;
