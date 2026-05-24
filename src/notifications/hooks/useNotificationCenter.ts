/**
 * Custom React Hook: useNotificationCenter
 * Manages view filters, active category selections, read status toggles and preferences
 */

import { useState } from 'react';
import { useNotifications } from './useNotifications';
import { AlertCategory, NotificationPreference } from '../types';
import { NotificationService } from '../services/notificationService';

export function useNotificationCenter() {
  const { alerts, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [activeCategory, setActiveCategory] = useState<AlertCategory | 'all'>('all');
  const [preferences, setPreferences] = useState<NotificationPreference[]>(() => 
    NotificationService.getPreferences()
  );

  // Group notifications chronologically or filter by category
  const filteredAlerts = alerts.filter(a => {
    if (activeCategory === 'all') return true;
    return a.category === activeCategory;
  });

  const updatePreferencesHandler = (nextPrefs: NotificationPreference[]) => {
    setPreferences(nextPrefs);
    NotificationService.savePreferences(nextPrefs);
  };

  const getUnreadByCategory = (cat: AlertCategory): number => {
    return alerts.filter(a => a.category === cat && !a.isRead).length;
  };

  return {
    alerts: filteredAlerts,
    totalCount: alerts.length,
    unreadCount,
    activeCategory,
    preferences,
    setActiveCategory,
    markAsRead,
    markAllAsRead,
    clearAll,
    getUnreadByCategory,
    updatePreferences: updatePreferencesHandler
  };
}

export default useNotificationCenter;
