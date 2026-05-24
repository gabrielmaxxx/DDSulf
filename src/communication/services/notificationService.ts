/**
 * DDSulf Realtime Notification and Delivery Orchestration Service
 */

import { db, auth } from '../../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  writeBatch,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { 
  OperationalNotification, 
  AlertCategory, 
  AlertSeverity, 
  QuickAction, 
  NotificationStatus,
  DeliveryChannel,
  DeliveryState,
  CommunicationMetrics
} from '../types';
import { CommunicationTemplateEngine } from '../templates/engine';

// Safe Error Handling wrapper as per firebase-integration guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: Record<string, any>;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      tenantId: 'tenant_ddsulf_enterprise'
    },
    operationType,
    path
  };
  console.error('[DDSulf Notification Service SDK] Firestore Error: ', JSON.stringify(errInfo));
}

class DDSulfNotificationService {
  private static instance: DDSulfNotificationService;
  private notifications: OperationalNotification[] = [];
  private listeners: Set<(notifications: OperationalNotification[]) => void> = new Set();
  private isOnline: boolean = navigator.onLine;
  private offlineQueue: Array<{ type: 'create' | 'update'; payload: any }> = [];
  private unsubFirestore: (() => void) | null = null;
  
  // Custom Metrics Tracking standard for Observability Intelligence
  private metrics: CommunicationMetrics = {
    totalDelivered: 0,
    totalFailed: 0,
    totalOpened: 0,
    openRate: 0,
    averageLatencyMs: 0,
    deliveredByChannel: {
      in_app: 0,
      push: 0,
      email: 0,
      whatsapp: 0
    },
    alertsPreventedCount: 0,
    criticalIncidentsActive: 0
  };

  private constructor() {
    this.setupNetworkObserver();
    this.loadFromLocalStorage();
    this.setupFirebaseListener();
    this.recalculateMetrics();
  }

  public static getInstance(): DDSulfNotificationService {
    if (!DDSulfNotificationService.instance) {
      DDSulfNotificationService.instance = new DDSulfNotificationService();
    }
    return DDSulfNotificationService.instance;
  }

  private setupNetworkObserver() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushOfflineQueue();
      this.broadcast();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.broadcast();
    });
  }

  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('ddsulf_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
      const queueStored = localStorage.getItem('ddsulf_notifications_offline_queue');
      if (queueStored) {
        this.offlineQueue = JSON.parse(queueStored);
      }
    } catch (e) {
      console.error('Failed to load ddsulf_notifications from local storage', e);
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('ddsulf_notifications', JSON.stringify(this.notifications));
      localStorage.setItem('ddsulf_notifications_offline_queue', JSON.stringify(this.offlineQueue));
    } catch (e) {
      console.error('Failed to save ddsulf_notifications to local storage', e);
    }
  }

  public subscribe(callback: (notifications: OperationalNotification[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.notifications);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private broadcast() {
    this.recalculateMetrics();
    this.listeners.forEach(cb => cb([...this.notifications]));
  }

  public setupFirebaseListener() {
    if (this.unsubFirestore) {
      this.unsubFirestore();
      this.unsubFirestore = null;
    }

    const tenantId = 'tenant_ddsulf_enterprise';
    const path = `tenants/${tenantId}/notifications`;

    try {
      // Create firestore onSnapshot reference safely
      const q = query(
        collection(db, path),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      this.unsubFirestore = onSnapshot(q, (snapshot) => {
        const firestoreNotifications: OperationalNotification[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          firestoreNotifications.push({
            id: docSnap.id,
            ...data,
            isSynced: true
          } as OperationalNotification);
        });

        if (firestoreNotifications.length > 0) {
          // Merge local & server states ensuring local-first speed is preserved
          const localOnly = this.notifications.filter(
            n => n.isOffline || !firestoreNotifications.some(fn => fn.id === n.id)
          );
          
          this.notifications = [...localOnly, ...firestoreNotifications];
          // Sort overall list descendente por timestamp
          this.notifications.sort((a, b) => b.timestamp - a.timestamp);
          this.saveToLocalStorage();
          this.broadcast();
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    } catch (err) {
      console.warn('[DDSulf] Firestore real-time notification synchronization path bypassed. LocalStorage active.', err);
    }
  }

  /**
   * Generates a context-aware smart notification. Renders template variables,
   * analyzes urgency & summary via Gemini AI (server router proxies), and coordinates channels.
   */
  public async createNotification(params: {
    category: AlertCategory;
    templateKey?: string;
    variables?: Record<string, any>;
    customTitle?: string;
    customMessage?: string;
    severity?: AlertSeverity;
    actorId?: string;
    recipientId?: string;
    routeUrl?: string;
    actions?: QuickAction[];
  }): Promise<OperationalNotification> {
    const startMs = Date.now();
    const id = `notif_${Math.random().toString(36).substring(2, 12)}`;
    const tenantId = 'tenant_ddsulf_enterprise';

    let title = params.customTitle || 'Nova Notificação DDSulf';
    let message = params.customMessage || '';
    let severity: AlertSeverity = params.severity || 'informational';
    let channels: DeliveryChannel[] = ['in_app'];

    // Render operational dynamic values using the template engine if requested
    if (params.templateKey && params.variables) {
      const rendered = CommunicationTemplateEngine.render(params.templateKey, params.variables);
      title = rendered.title;
      message = rendered.body;
      severity = params.severity || rendered.severity;
      channels = rendered.channels;
    }

    // Default status allocations for multichannel delivery
    const channelStatus: Record<DeliveryChannel, DeliveryState> = {
      in_app: 'delivered',
      push: channels.includes('push') ? 'pending' : 'not_sent',
      email: channels.includes('email') ? 'pending' : 'not_sent',
      whatsapp: channels.includes('whatsapp') ? 'pending' : 'not_sent'
    };

    const newNotification: OperationalNotification = {
      id,
      tenantId,
      category: params.category,
      severity,
      title,
      message,
      status: 'unread',
      timestamp: Date.now(),
      actorId: params.actorId || 'system',
      recipientId: params.recipientId || 'broadcast',
      isOffline: !this.isOnline,
      isSynced: false,
      routeUrl: params.routeUrl,
      actions: params.actions,
      delivery: {
        channels,
        status: channelStatus,
        latenciesMs: {},
        retryCounts: {}
      }
    };

    // Fast-optimistic insertion
    this.notifications.unshift(newNotification);
    this.saveToLocalStorage();
    this.broadcast();

    // Trigger Server-Side AI Analysis to obtain summaries & prioritized scoring asynchronously
    this.analyzeWithGeminiAPI(newNotification).then((aiData) => {
      if (aiData) {
        this.updateNotificationProperties(id, {
          aiSummary: aiData.aiSummary,
          aiPriorityIndex: aiData.aiPriorityIndex
        });
        
        // If AI recommended action suggestions, append them seamlessly
        if (aiData.actionSuggestion && newNotification.actions) {
          const suggestions = [...newNotification.actions];
          suggestions.push({
            id: `action_suggest_${Date.now()}`,
            label: `Sugestão AI: ${aiData.actionSuggestion}`,
            type: 'redirect',
            routeUrl: params.routeUrl || '/dashboard'
          });
          this.updateNotificationProperties(id, { actions: suggestions });
        }
      }
    });

    // Simulate multi-channel infrastructure routing latencies & performance logs
    channels.forEach(ch => {
      if (ch !== 'in_app') {
        setTimeout(() => {
          const lat = Date.now() - startMs;
          const statusResult: DeliveryState = Math.random() > 0.05 ? 'delivered' : 'failed';
          
          this.notifications = this.notifications.map(n => {
            if (n.id === id) {
              const uStatus = { ...n.delivery.status, [ch]: statusResult };
              const uLat = { ...n.delivery.latenciesMs, [ch]: lat };
              const uRetry = { ...n.delivery.retryCounts, [ch]: statusResult === 'failed' ? 1 : 0 };
              return {
                ...n,
                delivery: {
                  ...n.delivery,
                  status: uStatus,
                  latenciesMs: uLat,
                  retryCounts: uRetry
                }
              };
            }
            return n;
          });
          this.saveToLocalStorage();
          this.broadcast();
        }, 300 + Math.random() * 800);
      }
    });

    // Sync to Firestore if online
    if (this.isOnline) {
      this.syncNotificationToFirestore(newNotification);
    } else {
      this.offlineQueue.push({ type: 'create', payload: newNotification });
      this.saveToLocalStorage();
    }

    return newNotification;
  }

  /**
   * Safe execution proxy to obtain server-side Gemini summaries & priority indices
   */
  private async analyzeWithGeminiAPI(notification: OperationalNotification): Promise<{
    aiSummary: string;
    aiPriorityIndex: number;
    actionSuggestion?: string;
  } | null> {
    try {
      const resp = await fetch('/api/ai/analyze-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notification.title,
          message: notification.message,
          category: notification.category,
          severity: notification.severity
        })
      });

      if (resp.ok) {
        return await resp.json();
      }
    } catch (e) {
      console.warn('[DDSulf AI Notification System Component] Offline/Server bypass for client-side heuristic prediction.', e);
    }

    // Heuristic standard fallback to keep offline experience snappy of enterprise standards
    let score = 20;
    if (notification.severity === 'critical') score = 95;
    else if (notification.severity === 'high') score = 75;
    else if (notification.severity === 'medium') score = 50;

    if (notification.category === 'incident') score = Math.max(score, 90);
    if (notification.category === 'financial') score = Math.max(score, 60);

    return {
      aiSummary: `[Resumo Rápido] ${notification.title}: ${notification.message.substring(0, 60)}...`,
      aiPriorityIndex: score,
      actionSuggestion: 'Verifique as pendências no operacional do DDSulf'
    };
  }

  private async syncNotificationToFirestore(notif: OperationalNotification) {
    const tenantId = 'tenant_ddsulf_enterprise';
    const docPath = `tenants/${tenantId}/notifications/${notif.id}`;
    try {
      await setDoc(doc(db, docPath), {
        tenantId: notif.tenantId,
        category: notif.category,
        severity: notif.severity,
        title: notif.title,
        message: notif.message,
        status: notif.status,
        timestamp: notif.timestamp,
        actorId: notif.actorId,
        recipientId: notif.recipientId,
        routeUrl: notif.routeUrl || '',
        actions: notif.actions || [],
        delivery: notif.delivery,
        aiSummary: notif.aiSummary || '',
        aiPriorityIndex: notif.aiPriorityIndex || 50
      });

      this.notifications = this.notifications.map(n => 
        n.id === notif.id ? { ...n, isSynced: true, isOffline: false } : n
      );
      this.saveToLocalStorage();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
      // Ensure we flag it back to local to avoid UI disruption
      this.notifications = this.notifications.map(n => 
        n.id === notif.id ? { ...n, isOffline: true } : n
      );
      this.saveToLocalStorage();
    }
  }

  public updateNotificationProperties(id: string, properties: Partial<OperationalNotification>) {
    this.notifications = this.notifications.map(n => {
      if (n.id === id) {
        const updated = { ...n, ...properties };
        
        // Queue Firestore update if online
        if (this.isOnline && n.isSynced) {
          const tenantId = 'tenant_ddsulf_enterprise';
          const docPath = `tenants/${tenantId}/notifications/${id}`;
          updateDoc(doc(db, docPath), properties).catch(err => {
            handleFirestoreError(err, OperationType.UPDATE, docPath);
          });
        } else {
          this.offlineQueue.push({ type: 'update', payload: { id, properties } });
        }
        return updated;
      }
      return n;
    });
    this.saveToLocalStorage();
    this.broadcast();
  }

  public markAsRead(id: string) {
    this.updateNotificationProperties(id, { 
      status: 'read',
      readAt: Date.now() 
    });
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map(n => {
      if (n.status === 'unread') {
        const updated = { ...n, status: 'read' as NotificationStatus, readAt: Date.now() };
        if (this.isOnline && n.isSynced) {
          const docPath = `tenants/tenant_ddsulf_enterprise/notifications/${n.id}`;
          updateDoc(doc(db, docPath), { status: 'read', readAt: Date.now() }).catch(e => {
            handleFirestoreError(e, OperationType.UPDATE, docPath);
          });
        }
        return updated;
      }
      return n;
    });
    this.saveToLocalStorage();
    this.broadcast();
  }

  public archiveNotification(id: string) {
    this.updateNotificationProperties(id, { status: 'archived' });
  }

  private flushOfflineQueue() {
    if (this.offlineQueue.length === 0) return;
    
    console.log(`[DDSulf Realtime Synchronizer] Replaying ${this.offlineQueue.length} offline operations...`);
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];
    localStorage.removeItem('ddsulf_notifications_offline_queue');

    queue.forEach(op => {
      if (op.type === 'create') {
        this.syncNotificationToFirestore(op.payload);
      } else if (op.type === 'update') {
        const { id, properties } = op.payload;
        this.updateNotificationProperties(id, properties);
      }
    });
  }

  public getLiveMetrics(): CommunicationMetrics {
    this.recalculateMetrics();
    return this.metrics;
  }

  private recalculateMetrics() {
    const active = this.notifications.filter(n => n.status !== 'archived');
    const read = active.filter(n => n.status === 'read');
    
    const countInApp = active.length;
    let countPush = 0;
    let countEmail = 0;
    let countWhatsapp = 0;
    let failed = 0;
    let totalLats = 0;
    let latCount = 0;

    active.forEach(n => {
      Object.entries(n.delivery.status).forEach(([ch, stat]) => {
        if (stat === 'delivered') {
          if (ch === 'push') countPush++;
          if (ch === 'email') countEmail++;
          if (ch === 'whatsapp') countWhatsapp++;
        } else if (stat === 'failed') {
          failed++;
        }
      });

      if (n.delivery.latenciesMs) {
        Object.values(n.delivery.latenciesMs).forEach(l => {
          totalLats += l;
          latCount++;
        });
      }
    });

    const activeIncidents = active.filter(
      n => n.category === 'incident' && n.severity === 'critical' && n.status === 'unread'
    ).length;

    // Direct instrumentation
    this.metrics = {
      totalDelivered: countInApp + countPush + countEmail + countWhatsapp,
      totalFailed: failed,
      totalOpened: read.length,
      openRate: active.length > 0 ? (read.length / active.length) * 100 : 0,
      averageLatencyMs: latCount > 0 ? Math.round(totalLats / latCount) : 480,
      deliveredByChannel: {
        in_app: countInApp,
        push: countPush,
        email: countEmail,
        whatsapp: countWhatsapp
      },
      alertsPreventedCount: active.filter(n => n.aiPriorityIndex && n.aiPriorityIndex < 40).length,
      criticalIncidentsActive: activeIncidents
    };
  }
}

export default DDSulfNotificationService;
