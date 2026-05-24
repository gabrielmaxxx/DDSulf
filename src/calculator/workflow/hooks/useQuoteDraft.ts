import { useState, useEffect, useCallback } from 'react';
import { WorkflowDraft } from '../types';
import { draftService } from '../services/draftService';

export function useQuoteDraft() {
  const [draftList, setDraftList] = useState<WorkflowDraft[]>([]);

  const refreshDrafts = useCallback(() => {
    setDraftList(draftService.getRecoveryList());
  }, []);

  useEffect(() => {
    refreshDrafts();
  }, [refreshDrafts]);

  const deleteDraft = useCallback((id: string) => {
    draftService.removeRecovery(id);
    refreshDrafts();
  }, [refreshDrafts]);

  const hasUnsyncedDrafts = useCallback(() => {
    return draftService.getLatestLocalDraft() !== null;
  }, []);

  return {
    draftList,
    refreshDrafts,
    deleteDraft,
    hasUnsyncedDrafts
  };
}
