/**
 * DDSulf Process Orchestration & Advanced Workflow Engine Core Types
 * Defines comprehensive data nodes for triggers, actions, rule execution, approvals, security and telemetry.
 */

export type WorkflowStatus = 
  | 'idle' 
  | 'running' 
  | 'paused' 
  | 'completed' 
  | 'failed' 
  | 'retrying' 
  | 'approval_pending';

export type TriggerType = 
  | 'event' 
  | 'timer' 
  | 'cron' 
  | 'threshold' 
  | 'ai_suggestion' 
  | 'approval' 
  | 'manual';

export type ActionType = 
  | 'dispatch_notice' 
  | 'lock_pricing_model' 
  | 'trigger_ai_recommendation' 
  | 'sync_to_cloud'
  | 'deduct_inventory'
  | 'escalate_approval'
  | 'dispatch_external_webhook'
  | 'write_audit_log';

export interface RetryPolicy {
  maxRetries: number;
  delayMs: number;
  exponentialBackoff: boolean;
}

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  eventKey?: string; // e.g., 'operations.pest_report_submitted'
  cronExpression?: string; // e.g., '0 0 * * 1'
  delaySeconds?: number;
  conditionExpression?: string; // e.g., 'payload.margin < 0.15'
  parameters?: Record<string, any>;
}

export interface WorkflowAction {
  id: string;
  type: ActionType;
  payload: Record<string, any>;
  compensateActionId?: string; // Compaction action for recovery rollback
  retryPolicy?: RetryPolicy;
}

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  tenantId: string; // SaaS multi-tenant isolation key
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  isActive: boolean;
  priority: number; // Order precedence
  isOfflineCapable: boolean;
  version: number;
  createdAt: number;
  updatedAt: number;
}

export interface WorkflowStepInstance {
  id: string;
  actionId: string;
  type: ActionType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  startedAt: number;
  completedAt?: number;
  error?: string;
  retryCount: number;
}

export interface WorkflowInstance {
  id: string;
  ruleId: string;
  name: string;
  tenantId: string;
  status: WorkflowStatus;
  currentStepIndex: number;
  payload: Record<string, any>;
  startedAt: number;
  completedAt?: number;
  retryCount: number;
  executionTrail: string[];
  steps: WorkflowStepInstance[];
  isOffline: boolean;
  approvalRequestId?: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

export interface ApprovalHistoryEntry {
  approverId: string;
  approverName: string;
  action: ApprovalStatus;
  comment: string;
  timestamp: number;
}

export interface ApprovalRequest {
  id: string;
  instanceId: string;
  stepId: string;
  tenantId: string;
  status: ApprovalStatus;
  requestedLevel: 'supervisor' | 'manager' | 'director' | 'c_level';
  currentApproverId?: string;
  history: ApprovalHistoryEntry[];
  payload: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface WorkflowEvent {
  id: string;
  eventKey: string;
  tenantId: string;
  senderId: string;
  payload: Record<string, any>;
  timestamp: number;
  isRealtime: boolean;
  isOfflineBuffer: boolean;
}

export interface AutomationExecutionMetrics {
  totalTriggered: number;
  successRate: number; // fraction 0 to 1
  averageLatencyMs: number;
  failuresPreventedCount: number;
  activeExecutors: number;
  pendingApprovalsCount: number;
  offlineSyncPendingCount: number;
}

export interface AiAdvisory {
  id: string;
  type: 'bottleneck' | 'optimization' | 'auto_suggest';
  title: string;
  description: string;
  confidence: number; // 0 to 1
  suggestedWorkflowRule?: Partial<WorkflowRule>;
  detectedBottleneck?: {
    avgDelayMs: number;
    failureRatio: number;
    affectedStepId: string;
  };
  timestamp: number;
}
