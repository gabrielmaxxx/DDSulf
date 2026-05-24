/**
 * Custom React Hook: useOperationalUI
 * Orchestrates global feedback queues and dynamic loading blocks.
 */

import { useState } from 'react';

export function useOperationalUI() {
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);
  const [toastMessages, setToastMessages] = useState<{ id: string; text: string }[]>([]);

  const pushLocalNotification = (text: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToastMessages(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setToastMessages(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return {
    activeOverlayId,
    setActiveOverlayId,
    toastMessages,
    pushLocalNotification
  };
}

export default useOperationalUI;
