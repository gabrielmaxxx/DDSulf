/**
 * useRuntimeEfficiency hook
 */

import { useCallback, useState } from 'react';
import { idleWorkScheduler } from '../optimization';
import { runtimeEfficiencyService } from '../services';

export function useRuntimeEfficiency() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);

  /**
   * Spreads heavy calculations over idle browser frames safely without locking up user scroll/clicks
   */
  const processDatasetSafely = useCallback(<T>(
    items: T[],
    processChunkCallback: (chunk: T[]) => void,
    chunkSize: number = 40,
    onFinishCallback?: () => void
  ) => {
    if (items.length === 0) {
      if (onFinishCallback) onFinishCallback();
      return;
    }

    setIsProcessing(true);
    setProgressPct(0);

    let processedCount = 0;

    idleWorkScheduler.processChunked(
      items,
      (chunk) => {
        processChunkCallback(chunk);
        processedCount += chunk.length;
        setProgressPct(Math.min(100, Math.round((processedCount / items.length) * 100)));
      },
      chunkSize,
      () => {
        setIsProcessing(false);
        setProgressPct(100);
        if (onFinishCallback) onFinishCallback();
      }
    );
  }, []);

  /**
   * Defers a single function call to requestIdleCallback
   */
  const executeUnderIdleContext = useCallback((taskId: string, callback: () => void, priority: 'low' | 'medium' | 'high' = 'medium') => {
    idleWorkScheduler.enqueue({
      id: taskId,
      priority,
      execute: callback
    });
  }, []);

  return {
    processDatasetSafely,
    executeUnderIdleContext,
    isProcessing,
    progressPct,
    efficiencyMetrics: runtimeEfficiencyService.getEfficiencyStatus()
  };
}
