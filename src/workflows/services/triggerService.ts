import { WorkflowEventBus } from '../events/eventBus';
import { WorkflowEvent } from '../types';

export class TriggerService {
  /**
   * Publishes custom event streams into the subscription matrix
   */
  public static dispatchEvent(eventKey: string, payload: Record<string, any>, tenantId: string, senderId: string = 'system'): void {
    WorkflowEventBus.publish(eventKey, payload, tenantId, senderId);
  }

  /**
   * Enrolls callback observers on customized keys
   */
  public static registerTriggerListener(eventKey: string, callback: (event: WorkflowEvent) => void): () => void {
    return WorkflowEventBus.subscribe(eventKey, callback);
  }

  /**
   * Trace live events timeline streams
   */
  public static attachTraceListener(callback: (event: WorkflowEvent) => void): () => void {
    return WorkflowEventBus.subscribeAll(callback);
  }
}
export default TriggerService;
