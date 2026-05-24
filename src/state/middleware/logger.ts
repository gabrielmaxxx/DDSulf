import { StateCreator } from 'zustand';

export const loggerMiddleware = <T extends object>(
  config: StateCreator<T, [], []>
): StateCreator<T, [], []> => (set, get, api) =>
  config(
    (args) => {
      const prev = get();
      set(args);
      const next = get();
      
      // Only log in development
      if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
        console.groupCollapsed(`%c DDSulf State Update [${api.getState ? 'Zustand' : 'Store'}]`, 'color: #7c3aed; font-weight: bold;');
        console.log('%c Previous State: ', 'color: #94a3b8; font-weight: bold;', prev);
        console.log('%c Mutation Payloads: ', 'color: #3b82f6; font-weight: bold;', args);
        console.log('%c Updated State: ', 'color: #10b981; font-weight: bold;', next);
        console.groupEnd();
      }
    },
    get,
    api
  );
