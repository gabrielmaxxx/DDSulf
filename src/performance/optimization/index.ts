/**
 * DDSulf Runtime Optimization and Idle Work Scheduler
 * Orchestrates non-blocking heavy processes by cutting workflows into idle micro-chunks.
 */

import { IdleTask } from '../types';

class IdleWorkScheduler {
  private queue: IdleTask[] = [];
  private isProcessing = false;

  /**
   * Schedules a task to run when the main thread goes idle (non-blocking chunking)
   */
  public enqueue(task: IdleTask): void {
    this.queue.push(task);
    this.scheduleExecution();
  }

  private scheduleExecution(): void {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback((deadline) => {
        this.processBatch(deadline);
      });
    } else {
      // Graceful fallback for non-supporting legacy environments/browsers
      setTimeout(() => {
        this.processBatch({
          timeRemaining: () => 15, // Simulate 15ms work budget frame
          didTimeout: false
        });
      }, 50);
    }
  }

  private processBatch(deadline: { timeRemaining: () => number; didTimeout: boolean }): void {
    // Priority sorting: compile high priorities first
    this.queue.sort((a, b) => {
      const pScale = { high: 3, medium: 2, low: 1 };
      return pScale[b.priority] - pScale[a.priority];
    });

    while (this.queue.length > 0 && (deadline.timeRemaining() > 1 || deadline.didTimeout)) {
      const task = this.queue.shift();
      if (task) {
        try {
          task.execute();
        } catch (err) {
          console.error(`DDSulf IdleWorkScheduler: Task error on [${task.id}]:`, err);
        }
      }
    }

    this.isProcessing = false;

    if (this.queue.length > 0) {
      this.scheduleExecution(); // Re-schedule next idle frame
    }
  }

  /**
   * Dynamic split execution: chunks a massive dataset array down to sub-16ms fragments
   * that execute progressive loops of calculations for pest dosages or financials.
   */
  public processChunked<T>(
    items: T[],
    worker: (chunk: T[]) => void,
    chunkSize: number = 50,
    onComplete?: () => void
  ) {
    let index = 0;

    const chunkRunner = () => {
      const chunk = items.slice(index, index + chunkSize);
      worker(chunk);
      index += chunkSize;

      if (index < items.length) {
        this.enqueue({
          id: `chunk_${Date.now()}_${index}`,
          priority: 'medium',
          execute: chunkRunner
        });
      } else if (onComplete) {
        onComplete();
      }
    };

    chunkRunner();
  }

  public clearQueue() {
    this.queue = [];
    this.isProcessing = false;
  }
}

export const idleWorkScheduler = new IdleWorkScheduler();
export default idleWorkScheduler;
