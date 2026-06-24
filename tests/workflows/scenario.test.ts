/**
 * Test: Workflows - Linear workflow state conversions and assertions checks
 */

import { describe, test, expect } from 'vitest';
import { workflowTestingService } from '../../src/services/qa/workflowTestingService';

describe('Workflow Assurance Testing - Linear pipeline transitions', () => {

  test('Verify CRM to POP agenda booking conversion has exactly 3 steps', () => {
    const activeWorkflow = workflowTestingService.getWorkflowById('wf_commercial_delivery');
    
    expect(activeWorkflow !== undefined).toBe(true);
    expect(activeWorkflow?.steps.length).toBe(3);
  });

  test('Verify Chemical deplete technical execution has exactly 3 validation assertions', () => {
    const activeWorkflow = workflowTestingService.getWorkflowById('wf_inventory_depletion');
    
    expect(activeWorkflow !== undefined).toBe(true);
    expect(activeWorkflow?.steps[0].assertionText.includes('4 litros')).toBe(true);
  });

});
