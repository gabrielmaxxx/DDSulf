/**
 * PestFlow Enterprise Notification, Alerts & Engagement Systems — TypeScript Bedrock
 */

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export type AlertCategory = 
  | 'financial' 
  | 'operations' 
  | 'workflow' 
  | 'analytics' 
  | 'sync' 
  | 'system'
  | 'incident';

export type DeliveryChannel = 'in_app' | 'push' | 'email' | 'whatsapp';

export type DeliveryState = 'delivered' | 'failed' | 'pending' | 'not_sent' | 'not_configured';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface QuickAction {
  id: string;
  label: string;
  type: 'redirect' | 'resolve_approval' | 'ack_incident' | 'sync_db';
  routeUrl?: string;
  payload?: Record<string, any>;
}

export interface OperationalNotification {
  id: string;
  tenantId: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  aiSummary?: string; // AI generated compression or guidance
  aiPriorityIndex?: number; // 0-100 indicating relevance based on user profile and history
  status: NotificationStatus;
  timestamp: number;
  readAt?: number;
  actorId?: string;
  recipientId?: string; // Specific user ID or 'broadcast' for general organization channel
  isOffline: boolean;
  isSynced: boolean;
  dedupKey?: string; // To avoid duplication spam
  routeUrl?: string; // Redirect path
  actions?: QuickAction[];
  
  // Observability & multi-channel delivery metrics
  delivery: {
    channels: DeliveryChannel[];
    status: Record<DeliveryChannel, DeliveryState>;
    latenciesMs?: Record<string, number>;
    retryCounts?: Record<string, number>;
  };
}

export interface CommunicationTemplate {
  id: string;
  category: AlertCategory;
  name: string;
  subjectTemplate?: string;
  bodyTemplate: string;
  defaultSeverity: AlertSeverity;
  supportedChannels: DeliveryChannel[];
  aiExpansionRules?: string; // Rules for Gemini to adapt wording dynamically
}

export interface UserPreferences {
  userId: string;
  tenantId: string;
  channelsEnabled: {
    in_app: boolean;
    push: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  categoryRules: Record<AlertCategory, {
    enabled: boolean;
    minSeverity: AlertSeverity;
    bypassQuietHours: boolean;
  }>;
  quietHours: {
    enabled: boolean;
    start: string; // "HH:MM"
    end: string;   // "HH:MM"
    timezone: string;
  };
  lastModified: number;
}

export interface IncidentLog {
  id: string;
  tenantId: string;
  notificationId: string;
  severity: 'critical' | 'high';
  status: 'active' | 'acknowledged' | 'escalated' | 'resolved';
  carrierName?: string; // E.g. vehicle, warehouse item, chemical lot
  initiatedAt: number;
  acknowledgedAt?: number;
  resolvedAt?: number;
  acknowledgedBy?: string;
  assignedTechnicianId?: string;
  failureLogString: string;
  escalationPath: string[]; // List of user role groups to notify next
  nextEscalationAt: number;
}

export interface CommunicationMetrics {
  totalDelivered: number;
  totalFailed: number;
  totalOpened: number;
  openRate: number;
  averageLatencyMs: number;
  deliveredByChannel: Record<DeliveryChannel, number>;
  alertsPreventedCount: number;
  criticalIncidentsActive: number;
}
