/**
 * Custom React Hook: useTheme
 * Manages premium visual themes (nordic_light / obsidian_dark) and updates DOM variables.
 */

import { useState, useEffect } from 'react';
import { ThemeMode } from '../types';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>('nordic_light');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const body = window.document.body;
    
    // Clear existing themes
    body.classList.remove('nordic_light', 'obsidian_dark', 'industrial_slate');
    body.classList.add(theme);

    if (theme === 'obsidian_dark') {
      body.style.backgroundColor = '#09090b';
      body.style.color = '#f3f4f6';
    } else {
      body.style.backgroundColor = '#fafaf9';
      body.style.color = '#111827';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'nordic_light' ? 'obsidian_dark' : 'nordic_light');
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'obsidian_dark'
  };
}

export default useTheme;
