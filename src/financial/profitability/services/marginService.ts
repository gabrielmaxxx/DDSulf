import { db, auth } from '@/services/firebase';
import { collection, doc, setDoc, getDocs, writeBatch, serverTimestamp, addDoc } from 'firebase/firestore';
import { MarginIntelligenceConfig, ProfitabilitySimulationScenario } from '../types';
import { tenantStorage } from '@/utils/storage';

export enum ProfitabilityOperationType {
  CONFIG_LOAD = 'config_load',
  CONFIG_SAVE = 'config_save',
  SIMULATION_SAVE = 'simulation_save',
  SIMULATION_LOAD = 'simulation_load'
}

/**
 * Handles transactional error tracking for financial audits
 */
function logMarginServiceError(error: unknown, opType: ProfitabilityOperationType, subPath: string): never {
  const meta = {
    error: error instanceof Error ? error.message : String(error),
    operation: opType,
    subPath,
    authUid: auth?.currentUser?.uid || 'anonymous_field_user'
  };
  console.error('[Margin Engine Exception]:', JSON.stringify(meta));
  throw new Error(`Execution error: ${meta.error}`);
}

export const marginService = {
  /**
   * Loads the current active Margin Intelligence thresholds or defaults
   */
  async loadMarginConfiguration(): Promise<MarginIntelligenceConfig | null> {
    const path = 'financial_margin_configs';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        const cached = tenantStorage.getItem('margin_config');
        return cached ? JSON.parse(cached) : null;
      }
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
    } catch (err) {
      if (err instanceof Error && (err.message.includes('offline') || err.message.includes('permission'))) {
        const cached = tenantStorage.getItem('margin_config');
        return cached ? JSON.parse(cached) : null;
      }
      logMarginServiceError(err, ProfitabilityOperationType.CONFIG_LOAD, path);
    }
  },

  /**
   * Commits an updated configuration for margin floors and additions
   */
  async saveMarginConfiguration(config: MarginIntelligenceConfig): Promise<void> {
    const path = 'financial_margin_configs';
    try {
      tenantStorage.setItem('margin_config', JSON.stringify(config));
      await setDoc(doc(db, path, config.id), {
        ...config,
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      });
    } catch (err) {
      if (err instanceof Error && (err.message.includes('offline') || err.message.includes('permission'))) {
        console.warn('Working offline: Margin config buffered locally.');
        return;
      }
      logMarginServiceError(err, ProfitabilityOperationType.CONFIG_SAVE, `${path}/${config.id}`);
    }
  },

  /**
   * Backs up recent scenario simulations
   */
  async saveSimulationScenarios(scenarios: ProfitabilitySimulationScenario[]): Promise<void> {
    const path = 'financial_margin_simulations';
    try {
      tenantStorage.setItem('margin_simulations', JSON.stringify(scenarios));

      const batch = writeBatch(db);
      scenarios.forEach(sc => {
        const docRef = doc(collection(db, path), sc.id);
        batch.set(docRef, {
          ...sc,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    } catch (err) {
      if (err instanceof Error && (err.message.includes('offline') || err.message.includes('permission'))) {
        console.warn('Saves simulation draft locally.');
        return;
      }
      logMarginServiceError(err, ProfitabilityOperationType.SIMULATION_SAVE, path);
    }
  },

  /**
   * Recovers scenario simulations record
   */
  async loadSimulationScenarios(): Promise<ProfitabilitySimulationScenario[]> {
    const path = 'financial_margin_simulations';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        const cached = tenantStorage.getItem('margin_simulations');
        return cached ? JSON.parse(cached) : [];
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    } catch (err) {
      const cached = tenantStorage.getItem('margin_simulations');
      return cached ? JSON.parse(cached) : [];
    }
  }
};
