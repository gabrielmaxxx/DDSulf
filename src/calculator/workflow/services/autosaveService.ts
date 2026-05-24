import { QuoteWorkflowState } from '../types';
import { draftService } from './draftService';

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const autosaveService = {
  /**
   * Debounces state changes. Prevents multiple heavy storage operations.
   */
  triggerAutosave(state: QuoteWorkflowState, onSaved?: (time: string) => void): void {
    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    saveTimer = setTimeout(() => {
      draftService.saveLatestLocalDraft(state);
      const now = new Date().toLocaleTimeString();
      if (onSaved) {
        onSaved(now);
      }
    }, 1500); // 1.5 seconds typing debounce
  },

  /**
   * Immediately commits critical changes.
   */
  forceSave(state: QuoteWorkflowState): string {
    if (saveTimer) {
      clearTimeout(saveTimer);
    }
    draftService.saveLatestLocalDraft(state);
    return new Date().toLocaleTimeString();
  }
};
