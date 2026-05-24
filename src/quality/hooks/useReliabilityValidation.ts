/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { qaOrchestrationService } from '../services/qaOrchestrationService';
import { TestCase, TestType } from '../types';

export function useReliabilityValidation() {
  const [testCases, setTestCases] = useState<TestCase[]>(() => qaOrchestrationService.getTestCases());
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const unsubscribe = qaOrchestrationService.subscribe(() => {
      setTestCases([...qaOrchestrationService.getTestCases()]);
    });
    return () => unsubscribe();
  }, []);

  const runAllSuite = useCallback(async () => {
    setIsRunning(true);
    await qaOrchestrationService.runAllTests();
    setIsRunning(false);
  }, []);

  const runSingleTest = useCallback(async (id: string) => {
    await qaOrchestrationService.runTestCase(id);
    qaOrchestrationService.generateReport();
  }, []);

  const resetSuite = useCallback(() => {
    qaOrchestrationService.resetAllToIdle();
    qaOrchestrationService.generateReport();
  }, []);

  return {
    testCases,
    isRunning,
    runAllSuite,
    runSingleTest,
    resetSuite
  };
}
export default useReliabilityValidation;
