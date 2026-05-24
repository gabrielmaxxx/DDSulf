/**
 * Hook to manage user communication routing settings and filters
 */

import { useState, useEffect, useCallback } from 'react';
import UserPreferencesService from '../preferences/preferencesService';
import { UserPreferences } from '../types';

export function useCommunicationPreferences() {
  const service = UserPreferencesService.getInstance();
  const [preferences, setPreferences] = useState<UserPreferences>(service.getPreferences());

  useEffect(() => {
    const unsub = service.subscribe((prefs) => {
      setPreferences(prefs);
    });
    return unsub;
  }, []);

  const updatePreferences = useCallback(async (newPrefs: Partial<UserPreferences>) => {
    return await service.updatePreferences(newPrefs);
  }, []);

  const checkShouldDeliver = useCallback((category: any, severity: any) => {
    return service.shouldDeliver(category, severity);
  }, []);

  return {
    preferences,
    updatePreferences,
    checkShouldDeliver
  };
}

export default useCommunicationPreferences;
