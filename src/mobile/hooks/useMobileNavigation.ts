/**
 * Custom Mobile Routing state machine
 * Implements historical page stacks and linear back transition buffers.
 */

import { useState } from 'react';
import { MobileTab, MobileNavigationState } from '../types';

export function useMobileNavigation(initialTab: MobileTab = 'dashboard') {
  const [state, setState] = useState<MobileNavigationState>({
    activeTab: initialTab,
    history: [initialTab],
    canGoBack: false
  });

  const navigateTo = (tab: MobileTab) => {
    setState(prev => {
      // Avoid duplicated adjacent states
      if (prev.activeTab === tab) return prev;

      const newHistory = [...prev.history, tab];
      return {
        activeTab: tab,
        history: newHistory,
        canGoBack: newHistory.length > 1
      };
    });
  };

  const goBack = () => {
    setState(prev => {
      if (prev.history.length <= 1) return prev;

      const newHistory = prev.history.slice(0, -1);
      const previousTab = newHistory[newHistory.length - 1];

      return {
        activeTab: previousTab,
        history: newHistory,
        canGoBack: newHistory.length > 1
      };
    });
  };

  const resetTo = (tab: MobileTab) => {
    setState({
      activeTab: tab,
      history: [tab],
      canGoBack: false
    });
  };

  return {
    activeTab: state.activeTab,
    canGoBack: state.canGoBack,
    navigateTo,
    goBack,
    resetTo
  };
}

export default useMobileNavigation;
