/**
 * DDSulf Granular Preferences & Delivery Routing Configuration Service
 */

import { UserPreferences, AlertCategory, AlertSeverity } from '../types';
import { db, auth } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const DEFAULT_PREFERENCES: UserPreferences = {
  userId: 'user_default_technician',
  tenantId: 'tenant_ddsulf_enterprise',
  channelsEnabled: {
    in_app: true,
    push: true,
    email: false,
    whatsapp: true
  },
  categoryRules: {
    financial: { enabled: true, minSeverity: 'high', bypassQuietHours: false },
    operations: { enabled: true, minSeverity: 'low', bypassQuietHours: false },
    workflow: { enabled: true, minSeverity: 'medium', bypassQuietHours: false },
    analytics: { enabled: false, minSeverity: 'high', bypassQuietHours: false },
    sync: { enabled: true, minSeverity: 'medium', bypassQuietHours: false },
    system: { enabled: true, minSeverity: 'high', bypassQuietHours: false },
    incident: { enabled: true, minSeverity: 'low', bypassQuietHours: true } // Incidents always bypass quiet hours!
  },
  quietHours: {
    enabled: true,
    start: '21:00',
    end: '07:00',
    timezone: 'America/Sao_Paulo'
  },
  lastModified: Date.now()
};

export class UserPreferencesService {
  private static instance: UserPreferencesService;
  private currentPrefs: UserPreferences = { ...DEFAULT_PREFERENCES };
  private listeners: Set<(prefs: UserPreferences) => void> = new Set();

  private constructor() {
    this.loadLocal();
    this.syncWithFirestore();
  }

  public static getInstance(): UserPreferencesService {
    if (!UserPreferencesService.instance) {
      UserPreferencesService.instance = new UserPreferencesService();
    }
    return UserPreferencesService.instance;
  }

  private loadLocal() {
    const saved = localStorage.getItem('ddsulf_communication_preferences');
    if (saved) {
      try {
        this.currentPrefs = { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed parsing preferences local storage', e);
      }
    }
  }

  private saveLocal() {
    localStorage.setItem('ddsulf_communication_preferences', JSON.stringify(this.currentPrefs));
    this.broadcast();
  }

  private async syncWithFirestore() {
    const userId = auth.currentUser?.uid || 'user_default_technician';
    this.currentPrefs.userId = userId;
    
    try {
      const docRef = doc(db, 'users', userId, 'communication', 'preferences');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.currentPrefs = { ...DEFAULT_PREFERENCES, ...docSnap.data() } as UserPreferences;
        this.saveLocal();
      }
    } catch (e) {
      console.warn('[DDSulf preferences Service] Local storage mode active for user preferences sync.', e);
    }
  }

  public getPreferences(): UserPreferences {
    return { ...this.currentPrefs };
  }

  public subscribe(onUpdate: (prefs: UserPreferences) => void): () => void {
    this.listeners.add(onUpdate);
    onUpdate(this.currentPrefs);
    return () => {
      this.listeners.delete(onUpdate);
    };
  }

  private broadcast() {
    this.listeners.forEach(cb => cb({ ...this.currentPrefs }));
  }

  public async updatePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    this.currentPrefs = {
      ...this.currentPrefs,
      ...prefs,
      lastModified: Date.now()
    };
    this.saveLocal();

    const userId = auth.currentUser?.uid || 'user_default_technician';
    try {
      const docRef = doc(db, 'users', userId, 'communication', 'preferences');
      await setDoc(docRef, this.currentPrefs);
    } catch (e) {
      console.warn('[DDSulf preferences Service] Local save succeeded. Firestore sync bypassed.', e);
    }

    return this.currentPrefs;
  }

  /**
   * Evaluates if a notification should be delivered to the user based on category filters, quiet hours schedules, and channel preferences.
   */
  public shouldDeliver(category: AlertCategory, severity: AlertSeverity): {
    shouldDeliver: boolean;
    channelsToDeliver: Array<'in_app' | 'push' | 'email' | 'whatsapp'>;
    reason?: string;
  } {
    const rule = this.currentPrefs.categoryRules[category];
    if (!rule) {
      return { shouldDeliver: true, channelsToDeliver: ['in_app'] };
    }

    if (!rule.enabled) {
      return { shouldDeliver: false, channelsToDeliver: [], reason: 'Categoria desativada nas preferências.' };
    }

    // Severity mapping scores for strict comparison
    const severityMap: Record<AlertSeverity, number> = {
      critical: 5,
      high: 4,
      medium: 3,
      low: 2,
      informational: 1
    };

    if (severityMap[severity] < severityMap[rule.minSeverity]) {
      return { 
        shouldDeliver: false, 
        channelsToDeliver: [], 
        reason: `Requisito mínimo de severidade (${rule.minSeverity}) maior que o evento (${severity}).` 
      };
    }

    // Evaluate quiet hours
    if (this.currentPrefs.quietHours.enabled && !rule.bypassQuietHours) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentMinutesSinceMidnight = currentHour * 60 + currentMinute;

      const [startHour, startMin] = this.currentPrefs.quietHours.start.split(':').map(Number);
      const [endHour, endMin] = this.currentPrefs.quietHours.end.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      let isQuietTime = false;
      if (startMinutes > endMinutes) {
        // Over midnight (e.g., 22:00 to 06:00)
        isQuietTime = currentMinutesSinceMidnight >= startMinutes || currentMinutesSinceMidnight <= endMinutes;
      } else {
        // Standard day hours (e.g., 12:00 to 14:00)
        isQuietTime = currentMinutesSinceMidnight >= startMinutes && currentMinutesSinceMidnight <= endMinutes;
      }

      if (isQuietTime) {
        return { 
          shouldDeliver: false, 
          channelsToDeliver: [], 
          reason: 'Período silencioso ativo. Notificação em espera.' 
        };
      }
    }

    // Select enabled channels
    const channelsToDeliver: Array<'in_app' | 'push' | 'email' | 'whatsapp'> = [];
    if (this.currentPrefs.channelsEnabled.in_app) channelsToDeliver.push('in_app');
    if (this.currentPrefs.channelsEnabled.push) channelsToDeliver.push('push');
    if (this.currentPrefs.channelsEnabled.email) channelsToDeliver.push('email');
    if (this.currentPrefs.channelsEnabled.whatsapp) channelsToDeliver.push('whatsapp');

    return {
      shouldDeliver: true,
      channelsToDeliver
    };
  }
}

export default UserPreferencesService;
