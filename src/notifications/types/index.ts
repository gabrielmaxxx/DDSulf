/**
 * DDSulf Operational Events, Alerts and Notifications System Types
 */

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export type AlertCategory = 
  | 'financial' 
  | 'operations' 
  | 'workflow' 
  | 'analytics' 
  | 'sync' 
  | 'system';

export interface OperationalAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  metadata?: Record<string, any>;
  routeUrl?: string; // Quick action redirection pathway
  rolesPermitted?: string[]; // RBAC visibility constraint
  dedupKey?: string; // Fingerprint to prevent alert fatigue
}

export interface DDEvent {
  id: string;
  type: string; // e.g. "pricing_calc.completed", "sync.flushed", "margin.drop"
  payload: Record<string, any>;
  timestamp: number;
  origin: 'client' | 'server';
}

export interface NotificationPreference {
  id: string;
  category: AlertCategory;
  enabledChannels: Array<'in_app' | 'push' | 'email'>;
  minSeverity: AlertSeverity;
}

export type EventListenerCallback = (event: DDEvent) => void;
