/**
 * Realtime Status and Network sync parameters
 */

export class RealtimeCommunicationManager {
  public static isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  public static getLatencyInfo(): Promise<number> {
    const start = Date.now();
    return fetch('/api/health')
      .then(r => r.ok ? Date.now() - start : 999)
      .catch(() => 999);
  }
}
export default RealtimeCommunicationManager;
