/**
 * Non-blocking React state hook syncing client settings / layouts asynchronously via IndexedDB or fallback
 */

import { useState, useEffect } from 'react';
import { DDSulfIndexedDB, STORES } from '../persistence/indexedDb';

export function usePersistentState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSavedSetting = async () => {
      try {
        const item = await DDSulfIndexedDB.get<{ id: string; val: T }>(STORES.SETTINGS, key);
        if (item && item.val !== undefined) {
          setValue(item.val);
        } else {
          // Store default immediately
          await DDSulfIndexedDB.put(STORES.SETTINGS, { id: key, val: defaultValue });
        }
      } catch (err) {
        console.warn(`[Persistent State] Failed to load key: ${key}`, err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadSavedSetting();
  }, [key, defaultValue]);

  const updateValue = async (newValue: T | ((prev: T) => T)) => {
    try {
      const resolved = newValue instanceof Function ? newValue(value) : newValue;
      setValue(resolved);
      await DDSulfIndexedDB.put(STORES.SETTINGS, { id: key, val: resolved });
    } catch (err) {
      console.error(`[Persistent State] Update failure for: ${key}`, err);
    }
  };

  return [value, updateValue, isLoaded] as const;
}

export default usePersistentState;
