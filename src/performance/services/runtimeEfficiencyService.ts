/**
 * DDSulf Runtime Efficiency Service
 * Audits memory heap, watches for main thread long tasks (>50ms), and schedules idle tasks in the background.
 */

import { idleWorkScheduler } from '../optimization';
import { getCurrentHighResTime } from '../utils';

class RuntimeEfficiencyService {
  private longTasksRegisteredCount = 0;
  private peakExecutionDelayMs = 0;

  constructor() {
    this.bootstrapLongTaskObserver();
  }

  /**
   * Safe hooks PerformanceObserver to detect main UI thread blockages exceeding standard 50ms (Long Tasks ID API)
   */
  private bootstrapLongTaskObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.longTasksRegisteredCount += 1;
            if (entry.duration > this.peakExecutionDelayMs) {
              this.peakExecutionDelayMs = entry.duration;
            }
            if (process.env.NODE_ENV !== 'production') {
              console.warn(
                `[DDSulf Performance Thread Warning] Main Thread Blocked! ` +
                `Long-Task detected: ${entry.duration.toFixed(2)}ms (Limit: 50.00ms)`
              );
            }
          });
        });

        observer.observe({ entryTypes: ['longtask'] });
      } catch {
        // Safe degrade: browser or environment does not support LongTask observations
      }
    }
  }

  /**
   * Computes a highly intensive array job inside our IdleWorkScheduler to prevent freeze frame
   */
  public delegatHeavyCalculation<T>(
    items: T[],
    calculateUnit: (data: T[]) => void,
    onComplete?: () => void
  ) {
    const t0 = getCurrentHighResTime();
    
    idleWorkScheduler.processChunked(
      items,
      calculateUnit,
      40, // chunk size limit
      () => {
        const dur = getCurrentHighResTime() - t0;
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[DDSulf Runtime Efficiency] Heavy compilation complete in non-blocking chunks! Total time: ${dur.toFixed(2)}ms`);
        }
        if (onComplete) onComplete();
      }
    );
  }

  public getEfficiencyStatus() {
    return {
      totalLongTasksDetected: this.longTasksRegisteredCount,
      peakThreadFreezeDurationMs: parseFloat(this.peakExecutionDelayMs.toFixed(2)),
      idealWorkerIdleQueueSize: (idleWorkScheduler as any).queue?.length || 0
    };
  }
}

export const runtimeEfficiencyService = new RuntimeEfficiencyService();
export default runtimeEfficiencyService;
