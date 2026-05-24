/**
 * DDSulf Temporal Scheduling & Cron Automated Engine Service
 * Manages delayed executions, repeating cron schedules, and periodic maintenance ticks.
 */

import { WorkflowRule } from '../types';
import { WorkflowEngineService } from '../engine/workflowEngine';

export interface ScheduledTask {
  id: string;
  ruleId: string;
  tenantId: string;
  nextRunAt: number;
  intervalMs?: number;
  cronPattern?: string;
}

export class WorkflowSchedulingService {
  private static STORAGE_KEY = 'ddsulf_v2_scheduled_tasks';
  private static activeTimer: any = null;

  /**
   * Start scheduling tick listener
   */
  public static init() {
    if (typeof window === 'undefined') return;
    if (this.activeTimer) clearInterval(this.activeTimer);

    this.activeTimer = setInterval(() => {
      this.evaluateTicks();
    }, 10000); // Check tasks every 10 seconds
  }

  /**
   * Stop scheduling checks
   */
  public static destroy() {
    if (this.activeTimer) {
      clearInterval(this.activeTimer);
      this.activeTimer = null;
    }
  }

  /**
   * Evaluates if any scheduled timers have expired, executing their target workflow rule
   */
  private static evaluateTicks() {
    const tasks = this.getTasks();
    const now = Date.now();
    const expired: ScheduledTask[] = [];
    const active: ScheduledTask[] = [];

    tasks.forEach(task => {
      if (now >= task.nextRunAt) {
        expired.push(task);
        
        // If it's recurring, calculate next execution interval
        if (task.intervalMs) {
          active.push({
            ...task,
            nextRunAt: now + task.intervalMs
          });
        } else if (task.cronPattern) {
          // Calculate cron duration (simulate offset or next cron tick)
          const nextCronTime = this.calculateNextCronTime(task.cronPattern, now);
          active.push({
            ...task,
            nextRunAt: nextCronTime
          });
        }
      } else {
        active.push(task);
      }
    });

    if (expired.length > 0) {
      this.saveTasks(active);
      expired.forEach(task => {
        // Trigger Engine execution matching rule
        const rules = WorkflowEngineService.getRules(task.tenantId);
        const rule = rules.find(r => r.id === task.ruleId);
        if (rule) {
          console.log(`[Scheduler Tick]: Executing recurring rule "${rule.name}" for tenant ${task.tenantId}`);
          WorkflowEngineService.handleEvent(rule.trigger.eventKey || 'cron_scheduled_trigger', {
            scheduledTaskId: task.id,
            timestamp: now
          }, task.tenantId);
        }
      });
    }
  }

  /**
   * Program a new execution task into the scheduler
   */
  public static scheduleRule(rule: WorkflowRule): void {
    const tasks = this.getTasks();
    // Clear any duplicates of this rule
    const filtered = tasks.filter(t => t.ruleId !== rule.id);

    let nextRunAt = Date.now();
    let intervalMs: number | undefined;

    if (rule.trigger.type === 'timer' && rule.trigger.delaySeconds) {
      nextRunAt = Date.now() + (rule.trigger.delaySeconds * 1000);
    } else if (rule.trigger.type === 'cron' && rule.trigger.cronExpression) {
      nextRunAt = this.calculateNextCronTime(rule.trigger.cronExpression, Date.now());
    } else {
      // Default fallback periodic trigger
      nextRunAt = Date.now() + 60000;
      intervalMs = 60000;
    }

    const newTask: ScheduledTask = {
      id: 'sched_' + Math.random().toString(36).substr(2, 9),
      ruleId: rule.id,
      tenantId: rule.tenantId,
      nextRunAt,
      intervalMs,
      cronPattern: rule.trigger.type === 'cron' ? rule.trigger.cronExpression : undefined
    };

    filtered.push(newTask);
    this.saveTasks(filtered);
  }

  public static unscheduleRule(ruleId: string): void {
    const tasks = this.getTasks();
    const filtered = tasks.filter(t => t.ruleId !== ruleId);
    this.saveTasks(filtered);
  }

  public static getTasks(): ScheduledTask[] {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private static saveTasks(tasks: ScheduledTask[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
  }

  /**
   * Simulates interval calculations from a cron expression
   */
  private static calculateNextCronTime(cron: string, baseTime: number): number {
    // E.g. '0 0 * * 1' -> Weekly on Mondays. Let's provide standard intervals
    if (cron.includes('daily') || cron === '0 0 * * *') {
      return baseTime + (24 * 60 * 60 * 1000);
    }
    if (cron.includes('weekly') || cron === '0 0 * * 1') {
      return baseTime + (7 * 24 * 60 * 60 * 1000);
    }
    if (cron.includes('monthly') || cron === '0 0 1 * *') {
      return baseTime + (30 * 24 * 60 * 60 * 1000);
    }
    // Default hourly tick simulation for other dynamic rule loops
    return baseTime + (60 * 60 * 1000);
  }
}
export default WorkflowSchedulingService;
