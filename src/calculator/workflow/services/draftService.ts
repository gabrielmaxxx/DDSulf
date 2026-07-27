import { db } from '@/services/firebase';
import { collection, addDoc, getDocs, doc, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { QuoteWorkflowState, WorkflowDraft } from '../types';

const COMPONENT_STORAGE_KEY = 'pestflow_pricing_workflows_draft';
const RECOVERY_STORAGE_KEY = 'pestflow_draft_recovery_list';

export const draftService = {
  /**
   * Encodes and persists local dirty state draft
   */
  saveLatestLocalDraft(state: QuoteWorkflowState): void {
    try {
      const draft: WorkflowDraft = {
        id: `draft_${state.clientName.replace(/\s+/g, '_')}_${Date.now()}`,
        state,
        timestamp: new Date().toISOString(),
        syncAttempts: 0,
        isSynced: false
      };
      localStorage.setItem(COMPONENT_STORAGE_KEY, JSON.stringify(draft));
      
      // Store into historical recoveries as well to let users search past unfinished sessions
      if (state.clientName.trim().length >= 3) {
        const history: WorkflowDraft[] = this.getRecoveryList();
        const existingIdx = history.findIndex(h => h.state.clientName === state.clientName);
        if (existingIdx >= 0) {
          history[existingIdx] = draft;
        } else {
          history.unshift(draft);
        }
        localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(history.slice(0, 10))); // lock up to 10 recs
      }
    } catch (e) {
      console.warn('Failed to commit local cache draft', e);
    }
  },

  /**
   * Retrieves current active draft
   */
  getLatestLocalDraft(): WorkflowDraft | null {
    try {
      const raw = localStorage.getItem(COMPONENT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Discards the current active step draft
   */
  clearActiveDraft(): void {
    localStorage.removeItem(COMPONENT_STORAGE_KEY);
  },

  /**
   * Recovers list of stored drafts (useful for onboarding/empty state recovery)
   */
  getRecoveryList(): WorkflowDraft[] {
    try {
      const raw = localStorage.getItem(RECOVERY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Removes a draft from recovery list
   */
  removeRecovery(id: string): void {
    try {
      const list = this.getRecoveryList().filter(d => d.id !== id);
      localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(list));
    } catch {}
  },

  /**
   * Pushes draft status changes to remote store when back online
   */
  async syncDraftToFirestore(draft: WorkflowDraft): Promise<void> {
    try {
      await addDoc(collection(db, 'draft_quotes'), {
        ...draft.state,
        synchronizedAt: new Date().toISOString(),
        createdAt: draft.timestamp
      });
    } catch (e) {
      console.warn('[syncDraftToFirestore]: Device currently offline, sync deferred.', e);
      throw e;
    }
  }
};
