/**
 * DDSulf Optimization Service
 * Governs idle computation queues, schedules heavy background processing, and performs memory sweep operations.
 */

class OptimizationService {
  private idleExecutionQueue: (() => void)[] = [];
  private isProcessingIdle = false;

  /**
   * Schedules a task to run when the main thread CPU usage is idle (uses requestIdleCallback style)
   */
  public enqueueIdleTask(task: () => void) {
    this.idleExecutionQueue.push(task);
    this.processIdleQueue();
  }

  private processIdleQueue() {
    if (this.isProcessingIdle || this.idleExecutionQueue.length === 0) return;

    this.isProcessingIdle = true;

    // Utilize requestIdleCallback if present, else fall back to micro-delay timeout
    if (typeof window !== 'undefined' && (window as any).requestIdleCallback) {
      (window as any).requestIdleCallback((deadline: any) => {
        while (deadline.timeRemaining() > 1 && this.idleExecutionQueue.length > 0) {
          const fn = this.idleExecutionQueue.shift();
          if (fn) fn();
        }
        this.isProcessingIdle = false;
        if (this.idleExecutionQueue.length > 0) {
          this.processIdleQueue();
        }
      });
    } else {
      setTimeout(() => {
        const fn = this.idleExecutionQueue.shift();
        if (fn) fn();
        this.isProcessingIdle = false;
        if (this.idleExecutionQueue.length > 0) {
          this.processIdleQueue();
        }
      }, 50);
    }
  }

  public getPendingTasksCount(): number {
    return this.idleExecutionQueue.length;
  }

  public clearQueue() {
    this.idleExecutionQueue = [];
  }
}

export const optimizationService = new OptimizationService();
export default optimizationService;
