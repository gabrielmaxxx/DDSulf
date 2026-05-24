/**
 * DDSulf Integration Validation and Production Readiness Service
 */

import { PipelineRun, PipelineStep } from '../types';

class ProductionValidationService {
  private activePipelineRuns: PipelineRun[] = [];

  constructor() {
    this.seedPipelineRuns();
  }

  private seedPipelineRuns() {
    this.activePipelineRuns = [
      {
        id: 'run_908',
        commitSha: '6fb9a12c',
        branch: 'main',
        triggeredBy: 'github-actions',
        status: 'success',
        startedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        finishedAt: new Date(Date.now() - 3600000 * 24 + 114000).toISOString(),
        environment: 'production',
        steps: [
          {
            id: 'step_1',
            name: 'Typescript Compiler Verification',
            type: 'build',
            status: 'passed',
            logs: [
              'yarn install v1.22.19',
              'info No lockfile found. Generating yarn.lock...',
              'tsc --noEmit --skipLibCheck passed with 0 errors.'
            ]
          },
          {
            id: 'step_2',
            name: 'PWA ServiceWorker Integrity Audit',
            type: 'validation',
            status: 'passed',
            logs: [
              'Checking service-worker.js precaching assets...',
              'PWA manifest compliance check: passed.'
            ]
          },
          {
            id: 'step_3',
            name: 'Dependency Vulnerability Audit',
            type: 'security_scan',
            status: 'passed',
            logs: [
              'Running npm audit --audit-level=high...',
              '0 vulnerabilities found (all dependencies safe).'
            ]
          },
          {
            id: 'step_4',
            name: 'Production Smoke Integration Tests',
            type: 'smoke_test',
            status: 'passed',
            logs: [
              'Simulating isolated tenant requests for ddsulf_matriz...',
              'Firestore indices matched, geo-lookup returned 200.',
              'Gemini 2.5 flash connection verified.'
            ]
          }
        ]
      },
      {
        id: 'run_907',
        commitSha: 'fa38b1ad',
        branch: 'hotfix/use-permissions-loop',
        triggeredBy: 'gabriel.max@ddsulf.com.br',
        status: 'failed',
        startedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
        finishedAt: new Date(Date.now() - 3600000 * 30 + 45000).toISOString(),
        environment: 'staging',
        steps: [
          {
            id: 'step_1',
            name: 'Typescript Compiler Verification',
            type: 'build',
            status: 'failed',
            logs: [
              'yarn install v1.22.19',
              'src/hooks/useWorkspacePermissions.ts(12,21): error TS2304: Cannot find name "TenantContext".',
              'FAIL: Compilation found 1 TS issue.'
            ]
          }
        ]
      }
    ];
  }

  public getPipelineRuns(): PipelineRun[] {
    return this.activePipelineRuns;
  }

  public triggerNewPipelineRun(branch: string, environment: 'production' | 'staging' | 'development', authorCount: string): PipelineRun {
    const steps: PipelineStep[] = [
      {
        id: 'step_1',
        name: 'Typescript Compiler Verification',
        type: 'build',
        status: 'queued',
        logs: ['Queue allocation successfully granted.', 'Initializing build sandbox container...']
      },
      {
        id: 'step_2',
        name: 'PWA ServiceWorker Integrity Audit',
        type: 'validation',
        status: 'queued',
        logs: ['Pending predecessor build resolution.']
      },
      {
        id: 'step_3',
        name: 'Dependency Vulnerability Audit',
        type: 'security_scan',
        status: 'queued',
        logs: ['Pending predecessor build resolution.']
      },
      {
        id: 'step_4',
        name: 'Production Smoke Integration Tests',
        type: 'smoke_test',
        status: 'queued',
        logs: ['Pending predecessor check approval.']
      }
    ];

    const newRun: PipelineRun = {
      id: `run_${Math.floor(100 + Math.random() * 900)}`,
      commitSha: Math.random().toString(16).substring(2, 10),
      branch,
      triggeredBy: authorCount,
      status: 'running',
      startedAt: new Date().toISOString(),
      environment,
      steps
    };

    this.activePipelineRuns.unshift(newRun);
    return newRun;
  }

  public advancePipelineSimulated(runId: string): PipelineRun | null {
    const run = this.activePipelineRuns.find(r => r.id === runId);
    if (!run || run.status !== 'running') return null;

    // Find the first queued or running step
    const nextStep = run.steps.find(s => s.status === 'queued' || s.status === 'running');
    if (!nextStep) {
      run.status = 'success';
      run.finishedAt = new Date().toISOString();
      return run;
    }

    if (nextStep.status === 'queued') {
      nextStep.status = 'running';
      nextStep.logs.push('Running comprehensive check validations...');
      nextStep.startedAt = new Date().toISOString();
    } else if (nextStep.status === 'running') {
      nextStep.status = 'passed';
      nextStep.logs.push('All assertions validated with absolute zero errors.');
      nextStep.finishedAt = new Date().toISOString();
      
      const remainingQueued = run.steps.find(s => s.status === 'queued');
      if (!remainingQueued) {
        run.status = 'success';
        run.finishedAt = new Date().toISOString();
      }
    }

    return run;
  }
}

export const productionValidationService = new ProductionValidationService();
export default productionValidationService;
