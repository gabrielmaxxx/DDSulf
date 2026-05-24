/**
 * Inbox System orchestration hook for category grouping and filters
 */

import { useState, useMemo } from 'react';
import { useOperationalNotifications } from './useOperationalNotifications';
import { AlertCategory, NotificationStatus, AlertSeverity } from '../types';

export function useInboxSystem() {
  const { notifications, markAsRead, archiveNotification, markAllAsRead } = useOperationalNotifications();
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<NotificationStatus | 'all'>('unread');
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchCategory = selectedCategory === 'all' || n.category === selectedCategory;
      const matchStatus = selectedStatus === 'all' || n.status === selectedStatus;
      const matchSeverity = selectedSeverity === 'all' || n.severity === selectedSeverity;
      const matchSearch = searchQuery.trim() === '' || 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchCategory && matchStatus && matchSeverity && matchSearch;
    });
  }, [notifications, selectedCategory, selectedStatus, selectedSeverity, searchQuery]);

  const categoriesCount = useMemo(() => {
    const counts: Record<string, number> = {
      all: notifications.filter(n => n.status !== 'archived').length,
    };
    notifications.forEach(n => {
      if (n.status !== 'archived') {
        counts[n.category] = (counts[n.category] || 0) + 1;
      }
    });
    return counts;
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.status === 'unread').length;
  }, [notifications]);

  return {
    filteredNotifications,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedSeverity,
    setSelectedSeverity,
    searchQuery,
    setSearchQuery,
    unreadCount,
    categoriesCount,
    markAsRead,
    archiveNotification,
    markAllAsRead
  };
}

export default useInboxSystem;
