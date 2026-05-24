/**
 * DDSulf Advanced Workflow Automation & Process Orchestration Types
 */

export type WorkflowStatus = 'idle' | 'running' | 'completed' | 'failed' | 'retrying';

export type TriggerType = 
  | 'event' 
  | 'time_delayed' 
  | 'cron_scheduled' 
  | 'condition_threshold';

export type ActionType = 
  | 'dispatch_notice' 
  | 'escalate_severity' 
  | 'trigger_ai_recommendation' 
  | 'lock_pricing_model' 
  | 'sync_to_cloud';

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  eventKey?: string; // e.g., "pricing_calc.completed"
  delaySeconds?: number;
  conditionExpression?: string; // JS-based dynamic rule evaluation e.g., "payload.margin < 0.15"
}

export interface WorkflowAction {
  id: string;
  type: ActionType;
  payload: Record<string, any>;
}

export interface WorkflowRule {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  isActive: boolean;
  priority: number; // Execution order: heavier weight runs first
}

export interface WorkflowInstance {
  id: string;
  ruleId: string;
  name: string;
  status: WorkflowStatus;
  currentStepIndex: number;
  payload: Record<string, any>;
  startedAt: number;
  completedAt?: number;
  retryCount: number;
  errorLog?: string[];
  executionTrail: string[];
}

export interface AutomationExecutionMetrics {
  totalTriggered: number;
  successRate: number; // percentage: e.g. 0.98
  averageLatencyMs: number;
  failuresPreventedCount: number;
  activeExecutors: number;
}
