/**
 * DDSulf Core Notification Infrastructure Service
 * Manages reactive in-app dispatch buffers, read status flags, and offline queues.
 */

import { OperationalAlert, AlertSeverity, AlertCategory, NotificationPreference } from '../types';
import { EventBusService } from '../events/eventBus';
import { tenantStorage } from '@/utils/storage';

export class NotificationService {
  private static STORAGE_KEY = 'in_app_notices';
  private static PREFS_KEY = 'notice_prefs';

  private static changeListeners: Set<() => void> = new Set();

  /**
   * Registers a callback triggered when active list changes (for real-time re-rendering)
   */
  public static subscribe(listener: () => void): () => void {
    this.changeListeners.add(listener);
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  private static notifyListeners() {
    this.changeListeners.forEach(listener => {
      try {
        listener();
      } catch (err) {
        console.error('[Notification Service] Trigger listener failed:', err);
      }
    });
  }

  /**
   * Retrieves active in-app notices sorted by dynamic severity scores
   */
  public static getAlerts(): OperationalAlert[] {
    const stored = tenantStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Dispatches custom alerts to client terminal buffers, triggering EventBus announcements
   */
  public static dispatch(alert: OperationalAlert): void {
    // Check preferences first
    const prefs = this.getPreferences();
    const catPref = prefs.find(p => p.category === alert.category);
    if (catPref) {
      const severityWeights: Record<AlertSeverity, number> = {
        critical: 5,
        high: 4,
        medium: 3,
        low: 2,
        informational: 1
      };
      
      const enabledChannels = catPref.enabledChannels || [];
      if (!enabledChannels.includes('in_app')) return; // In-app notification explicitly disabled under user preferences
      
      const minWeight = severityWeights[catPref.minSeverity] || 1;
      const alertWeight = severityWeights[alert.severity] || 1;
      if (alertWeight < minWeight) return; // Dropped by severity threshold constraint
    }

    const current = this.getAlerts();
    
    // Prevent duplicate deliveries of similar alert finger prints
    if (alert.dedupKey) {
      const index = current.findIndex(x => x.dedupKey === alert.dedupKey && !x.isRead);
      if (index !== -1) {
        // Recycle target node timestamp instead of creating noise
        current[index].timestamp = Date.now();
        tenantStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
        this.notifyListeners();
        return;
      }
    }

    const updated = [alert, ...current].slice(0, 50); // Hardcap index max to keep mobile storage slim
    tenantStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));

    // Announce event onto client bus
    EventBusService.publish(`alert.${alert.category}.${alert.severity}`, alert);
    this.notifyListeners();
  }

  /**
   * Marks single alert node as read
   */
  public static markAsRead(id: string): void {
    const current = this.getAlerts();
    const updated = current.map(item => item.id === id ? { ...item, isRead: true } : item);
    tenantStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.notifyListeners();
  }

  /**
   * Marks all alerts of category as read
   */
  public static markAllAsRead(category?: AlertCategory): void {
    const current = this.getAlerts();
    const updated = current.map(item => {
      if (category && item.category !== category) return item;
      return { ...item, isRead: true };
    });
    tenantStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.notifyListeners();
  }

  /**
   * Fully clears read/un-read cache buffers
   */
  public static clearAll(): void {
    tenantStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    this.notifyListeners();
  }

  /**
   * Configuration preferences getter
   */
  public static getPreferences(): NotificationPreference[] {
    const stored = tenantStorage.getItem(this.PREFS_KEY);
    if (stored) return JSON.parse(stored);

    // Dynamic Default Settings
    const defaults: NotificationPreference[] = [
      { id: '1', category: 'financial', enabledChannels: ['in_app', 'push'], minSeverity: 'medium' },
      { id: '2', category: 'operations', enabledChannels: ['in_app', 'push', 'email'], minSeverity: 'low' },
      { id: '3', category: 'workflow', enabledChannels: ['in_app'], minSeverity: 'medium' },
      { id: '4', category: 'analytics', enabledChannels: ['in_app'], minSeverity: 'medium' },
      { id: '5', category: 'sync', enabledChannels: ['in_app'], minSeverity: 'high' }
    ];
    tenantStorage.setItem(this.PREFS_KEY, JSON.stringify(defaults));
    return defaults;
  }

  /**
   * Save user notification preferences back to memory
   */
  public static savePreferences(prefs: NotificationPreference[]): void {
    tenantStorage.setItem(this.PREFS_KEY, JSON.stringify(prefs));
  }
}

export default NotificationService;
