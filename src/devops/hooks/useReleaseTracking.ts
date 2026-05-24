/**
 * Hook: useReleaseTracking
 */

import { useState, useEffect } from 'react';
import { releaseService } from '../services/releaseService';
import { ReleaseLog } from '../types';

export function useReleaseTracking() {
  const [releases, setReleases] = useState<ReleaseLog[]>([]);

  useEffect(() => {
    setReleases(releaseService.getReleases());
  }, []);

  const pushRelease = (rel: ReleaseLog) => {
    releaseService.registerRelease(rel);
    setReleases(releaseService.getReleases());
  };

  return {
    releases,
    pushRelease,
    getPromptTemplate: (key: string) => releaseService.getPromptTemplate(key),
    savePromptTemplate: (key: string, ver: string, prompt: string, author: string) => 
      releaseService.savePromptTemplate(key, ver, prompt, author)
  };
}
