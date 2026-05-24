/**
 * React state hook for catching and storing browser PWA install triggers
 */

import { useState, useEffect } from 'react';
import { PWAInstallState } from '../types';

export function usePWAInstall() {
  const [installState, setInstallState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    promptDeferred: null
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect if app already launched in standalone mode
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      if (isStandalone) {
        setInstallState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
      }
    };

    checkStandalone();

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallState({
        isInstallable: true,
        isInstalled: false,
        promptDeferred: e
      });
    };

    const handleAppInstalled = () => {
      setInstallState({
        isInstallable: false,
        isInstalled: true,
        promptDeferred: null
      });
      console.log('%c[PWA Launch] Application successfully added to user homescreen!', 'color: #10b981;');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (!installState.promptDeferred) {
      return false;
    }

    try {
      const promptEvent = installState.promptDeferred;
      promptEvent.prompt();
      
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstallState(prev => ({ ...prev, isInstallable: false, isInstalled: true }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return {
    ...installState,
    triggerInstall
  };
}

export default usePWAInstall;
