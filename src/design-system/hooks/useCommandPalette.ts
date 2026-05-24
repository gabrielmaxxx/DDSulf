/**
 * Custom React Hook: useCommandPalette
 * Listens for keyboard triggers (Cmd+K / Ctrl+K) to toggle a quick action terminal.
 */

import { useState, useEffect } from 'react';
import { CommandShortcut } from '../types';

export function useCommandPalette(initialShortcuts: CommandShortcut[] = []) {
  const [isOpen, setIsOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState<CommandShortcut[]>(initialShortcuts);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const registerShortcut = (shortcut: CommandShortcut) => {
    setShortcuts(prev => [...prev, shortcut]);
  };

  return {
    isOpen,
    setIsOpen,
    togglePalette: () => setIsOpen(prev => !prev),
    shortcuts,
    registerShortcut
  };
}

export default useCommandPalette;
