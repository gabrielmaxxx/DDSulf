/**
 * Hook: useWorkflowTracing
 * Creates tracing spans and measures precise execution times of UI and Firestore integrations.
 */

import { useState } from 'react';
import { tracingService } from '../services';
import { ActivityTrace, OperationalDomain } from '../types';

export function useWorkflowTracing() {
  const [completedTraces, setCompletedTraces] = useState<ActivityTrace[]>(() => tracingService.getTraces());

  const executeWithProfilingSpan = async <T>(
    name: string,
    domain: OperationalDomain,
    executorFn: () => Promise<T>,
    parameters?: Record<string, any>
  ): Promise<T> => {
    const spanId = tracingService.startTrace(name, domain, parameters);
    try {
      const response = await executorFn();
      tracingService.endTrace(spanId, 'success');
      setCompletedTraces(tracingService.getTraces());
      return response;
    } catch (err: any) {
      tracingService.endTrace(spanId, 'failed');
      setCompletedTraces(tracingService.getTraces());
      throw err;
    }
  };

  return {
    completedTraces,
    activeSpansCount: tracingService.getActiveSpansCount(),
    executeWithProfilingSpan
  };
}
