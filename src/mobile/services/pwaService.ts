/**
 * DDSulf Advanced PWA Core Infrastructure Service
 * Handles service worker lifecycles, offline asset caching, and dynamic offline status telemetry.
 */

export class PWAService {
  private static swRegistration: ServiceWorkerRegistration | null = null;

  /**
   * Registers custom Service Worker to activate client asset caching
   */
  public static async registerServiceWorker(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      // Direct registration of a service worker asset
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      this.swRegistration = reg;
      console.log('%c[PWA Service] Service Worker Registered successfully under scope:', 'color: #10b981;', reg.scope);
      return true;
    } catch (err) {
      console.warn('[PWA Service] Service worker registration deferred or failed (standard external environment restriction):', err);
      return false;
    }
  }

  /**
   * Triggers a manual update review of cache structures
   */
  public static async forceUpdateAssets(): Promise<void> {
    if (this.swRegistration) {
      await this.swRegistration.update();
      console.log('[PWA Service] Inbound update cycle triggered on assets index.');
    }
  }

  /**
   * Returns whether the application runs within PWA standalone mode (added to home screen)
   */
  public static isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }
}
