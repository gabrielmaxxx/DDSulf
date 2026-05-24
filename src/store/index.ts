import { useState, useEffect } from 'react';

/**
 * Highly optimized, lightweight, vanilla global state dispatcher
 */
class GlobalStore<T> {
  private state: T;
  private listeners: Set<(state: T) => void> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState() {
    return this.state;
  }

  setState(nextState: Partial<T> | ((state: T) => Partial<T>)) {
    const partial = typeof nextState === 'function' ? nextState(this.state) : nextState;
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: (state: T) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

// Global UI State Schema
interface AppGlobalState {
  sidebarOpen: boolean;
  activeFilter: string | null;
  selectedClient: string | null;
}

export const appStore = new GlobalStore<AppGlobalState>({
  sidebarOpen: true,
  activeFilter: null,
  selectedClient: null
});

export function useGlobalStore() {
  const [state, setState] = useState(appStore.getState());

  useEffect(() => {
    return appStore.subscribe((nextState) => {
      setState(nextState);
    });
  }, []);

  return [
    state,
    (nextState: Partial<AppGlobalState> | ((state: AppGlobalState) => Partial<AppGlobalState>)) => {
      appStore.setState(nextState);
    }
  ] as const;
}
