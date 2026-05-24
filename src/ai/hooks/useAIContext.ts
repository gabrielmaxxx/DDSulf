/**
 * Custom React Hook: useAIContext
 * Coordinates compiling, refreshing, caching, and retrieving real-time user permissions and metrics context.
 */

import { useState, useEffect } from 'react';
import { SystemCoreContext } from '../types';
import { AIContextEngine } from '../context';

export function useAIContext() {
  const [context, setContext] = useState<SystemCoreContext>(() => 
    AIContextEngine.getCachedContext()
  );

  const refreshContext = (
    role: string,
    userName: string,
    settings?: any,
    metrics?: any,
    activeQuote?: any
  ) => {
    const nextCtx = AIContextEngine.compileContext(role, userName, settings, metrics, activeQuote);
    setContext(nextCtx);
    return nextCtx;
  };

  useEffect(() => {
    // Sync with memory if initial state was compiled elsewhere
    setContext(AIContextEngine.getCachedContext());
  }, []);

  return {
    context,
    refreshContext,
    activeRole: context.activeRole,
    userName: context.userName
  };
}

export default useAIContext;
