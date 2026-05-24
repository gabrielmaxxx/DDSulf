/**
 * React state hook managing ongoing autosave draft forms recovery
 */

import { useState, useEffect } from 'react';
import { DraftsService } from '../drafts';
import { OfflineDraft } from '../types';

export function useDraftRecovery() {
  const [drafts, setDrafts] = useState<OfflineDraft[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDrafts = async () => {
    setLoading(true);
    try {
      const all = await DraftsService.listAll();
      setDrafts(all);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const saveDraft = async <T>(id: string, stepKey: string, payload: T) => {
    await DraftsService.save(id, stepKey, payload);
    await loadDrafts();
  };

  const clearDraft = async (id: string) => {
    await DraftsService.clear(id);
    await loadDrafts();
  };

  return {
    drafts,
    loading,
    saveDraft,
    clearDraft,
    reload: loadDrafts
  };
}

export default useDraftRecovery;
