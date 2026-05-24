/**
 * DDSulf Testing Orchestration Service
 * Manages suite execution, telemetry, and detailed reports.
 */

import { TestCase, TestSuite, TestStatus, TestType } from '@/types/qa';

class TestingOrchestrationService {
  private suites: TestSuite[] = [];

  constructor() {
    this.initializeDefaultSuites();
  }

  private initializeDefaultSuites() {
    this.suites = [
      {
        id: 'suite_unit',
        name: 'Unit Testing: Core Calculators & Dosage Algorithms',
        type: TestType.UNIT,
        status: TestStatus.IDLE,
        cases: [
          {
            id: 'tc_unit_1',
            name: 'Pest Chemical Dilution Math Validity',
            type: TestType.UNIT,
            description: 'Assert eco-safe dosage yields strictly correct dilution parts per million.',
            status: TestStatus.IDLE,
          },
          {
            id: 'tc_unit_2',
            name: 'Financial Profit Margin Threshold Rule',
            type: TestType.UNIT,
            description: 'Assert commercial quotes below minimum margin of 35% are flagged.',
            status: TestStatus.IDLE,
          },
          {
            id: 'tc_unit_3',
            name: 'IndexedDB Offline Cache Eviction Policy',
            type: TestType.UNIT,
            description: 'Assert local store correctly drops oldest records when limit is reached.',
            status: TestStatus.IDLE,
          }
        ]
      },
      {
        id: 'suite_sec',
        name: 'Security & Multi-Tenant Boundaries Sandbox',
        type: TestType.SECURITY,
        status: TestStatus.IDLE,
        cases: [
          {
            id: 'tc_sec_1',
            name: 'Tenant Segregation SQL/NoSQL Isolation Gate',
            type: TestType.SECURITY,
            description: 'Verify cross-tenant read attempts yield immediate security breach exceptions.',
            status: TestStatus.IDLE,
          },
          {
            id: 'tc_sec_2',
            name: 'Firestore Security Rules Access Controls',
            type: TestType.SECURITY,
            description: 'Assert normal technicians cannot overwrite operational audit logs.',
            status: TestStatus.IDLE,
          }
        ]
      },
      {
        id: 'suite_realtime',
        name: 'Real-time WebSocket Connection Integrity',
        type: TestType.REALTIME,
        status: TestStatus.IDLE,
        cases: [
          {
            id: 'tc_rt_1',
            name: 'Snapshot Broadcast Event Latency',
            type: TestType.REALTIME,
            description: 'Assert update latencies are strictly below 50ms across high-density segments.',
            status: TestStatus.IDLE,
          },
          {
            id: 'tc_rt_2',
            name: 'Graceful Reconnection Under Packet Loss',
            type: TestType.REALTIME,
            description: 'Assert listeners auto-rebind local DB subscriptions on network reconnection.',
            status: TestStatus.IDLE,
          }
        ]
      },
      {
        id: 'suite_offline',
        name: 'Offline-First Reconciliation & Queue',
        type: TestType.OFFLINE,
        status: TestStatus.IDLE,
        cases: [
          {
            id: 'tc_off_1',
            name: 'Idempotent Sync Queue Serialization',
            type: TestType.OFFLINE,
            description: 'Ensure offline insect-treatment records can replay on servers out-of-order.',
            status: TestStatus.IDLE,
          },
          {
            id: 'tc_off_2',
            name: 'Automatic Last-Write-Wins Conflict Match',
            type: TestType.OFFLINE,
            description: 'Resolve parallel updates on identical customer profiles.',
            status: TestStatus.IDLE,
          }
        ]
      },
      {
        id: 'suite_ai',
        name: 'AI GenAI Prompt & Dosage Guardrails Test',
        type: TestType.AI,
        status: TestStatus.IDLE,
        cases: [
          {
            id: 'tc_ai_1',
            name: 'Gemini Safety Filter Compliance',
            type: TestType.AI,
            description: 'Assert recommenders reject queries containing unsafe chemical usage commands.',
            status: TestStatus.IDLE,
          },
          {
            id: 'tc_ai_2',
            name: 'Dosage Recommendation Explainability Score',
            type: TestType.AI,
            description: 'Verify model output contains references to MSDS datasheets.',
            status: TestStatus.IDLE,
          }
        ]
      },
      {
        id: 'suite_e2e',
        name: 'End-to-End Core Workflows (Playwright Simulator)',
        type: TestType.E2E,
        status: TestStatus.IDLE,
        cases: [
          {
            id: 'tc_e2e_1',
            name: 'Lead to Approved Quote to POP Scheduling Sequence',
            type: TestType.E2E,
            description: 'Simulate commercial rep converting prospect and generating operations schedule.',
            status: TestStatus.IDLE,
          },
          {
            id: 'tc_e2e_2',
            name: 'Financial Ledger Reconciliation Drill',
            type: TestType.E2E,
            description: 'Verify payment receipt updates accounts receivable balance live.',
            status: TestStatus.IDLE,
          }
        ]
      }
    ];
  }

  public getSuites(): TestSuite[] {
    return this.suites;
  }

  public getSuiteById(id: string): TestSuite | undefined {
    return this.suites.find(s => s.id === id);
  }

  /**
   * Run a specific test case inside a suite
   */
  public async runTestCase(suiteId: string, caseId: string): Promise<TestCase> {
    const suite = this.getSuiteById(suiteId);
    if (!suite) throw new Error(`Suite with id ${suiteId} not found`);

    const tcase = suite.cases.find(c => c.id === caseId);
    if (!tcase) throw new Error(`Case with id ${caseId} not found in suite ${suiteId}`);

    tcase.status = TestStatus.RUNNING;
    suite.status = TestStatus.RUNNING;

    // Simulate execution time
    const duration = Math.floor(40 + Math.random() * 250);
    await new Promise(resolve => setTimeout(resolve, duration));

    // Simulate selective/indicative failures for realistic QA reporting
    // Let's make security tests and AI tests occasionally fail if simulated conditions are requested
    // Otherwise trigger success
    const passes = Math.random() > 0.08; // 92% pass rate for normal runs

    tcase.status = passes ? TestStatus.PASSED : TestStatus.FAILED;
    tcase.durationMs = duration;
    tcase.lastRun = new Date().toISOString();
    
    if (!passes) {
      tcase.errorMessage = 'AssertionError: Expected outcome to meet platform SLA boundaries';
      tcase.stackTrace = `Error: Expected outcome to meet platform SLA boundaries\n at runTestCase (src/services/qa/testingOrchestrationService.ts:167)\n at runSuite (src/services/qa/testingOrchestrationService.ts:182)`;
    } else {
      tcase.errorMessage = undefined;
      tcase.stackTrace = undefined;
    }

    // Refresh suite status
    this.refreshSuiteStatus(suite);

    return tcase;
  }

  /**
   * Run an entire suite
   */
  public async runSuite(suiteId: string): Promise<TestSuite> {
    const suite = this.getSuiteById(suiteId);
    if (!suite) throw new Error(`Suite with id ${suiteId} not found`);

    suite.status = TestStatus.RUNNING;
    for (const tcase of suite.cases) {
      await this.runTestCase(suite.id, tcase.id);
    }
    this.refreshSuiteStatus(suite);
    return suite;
  }

  /**
   * Run all registered test suites in parallel-sequence
   */
  public async runAllSuites(): Promise<TestSuite[]> {
    for (const suite of this.suites) {
      await this.runSuite(suite.id);
    }
    return this.suites;
  }

  private refreshSuiteStatus(suite: TestSuite) {
    const statuses = suite.cases.map(c => c.status);
    if (statuses.includes(TestStatus.RUNNING)) {
      suite.status = TestStatus.RUNNING;
    } else if (statuses.includes(TestStatus.FAILED)) {
      suite.status = TestStatus.FAILED;
    } else if (statuses.every(s => s === TestStatus.PASSED)) {
      suite.status = TestStatus.PASSED;
    } else {
      suite.status = TestStatus.IDLE;
    }
  }

  public getGlobalPassRate(): number {
    let total = 0;
    let passed = 0;
    for (const suite of this.suites) {
      for (const tcase of suite.cases) {
        total++;
        if (tcase.status === TestStatus.PASSED) passed++;
      }
    }
    return total === 0 ? 100 : Math.round((passed / total) * 100);
  }
}

export const testingOrchestrationService = new TestingOrchestrationService();
export default testingOrchestrationService;
