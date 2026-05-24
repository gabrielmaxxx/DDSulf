import { useState, useEffect, useRef, useCallback } from 'react';
import { DDSulfKnowledgeService } from '../services/knowledgeService';
import { Procedure, ProcedureStep, ProcedureExecutionLog } from '../types';

export function useProcedureExecution(procedure: Procedure | null, technicianId: string = 'tech_rod_1', technicianName: string = 'Rodrigo Medeiros') {
  const [activeExecutionId, setActiveExecutionId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [stepPhotos, setStepPhotos] = useState<Record<string, string>>({});
  const [chemicalVolumeUsed, setChemicalVolumeUsed] = useState<number>(0);
  const [adherenceConfirmed, setAdherenceConfirmed] = useState<boolean>(false);
  const [executionState, setExecutionState] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const service = DDSulfKnowledgeService.getInstance();

  // Clear timer on cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Update timer ticks during active execution
  useEffect(() => {
    if (executionState === 'running') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [executionState]);

  const startExecution = useCallback(() => {
    if (!procedure) return;
    
    const freshId = 'exec_' + Math.random().toString(36).substring(2, 9);
    setActiveExecutionId(freshId);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setStepPhotos({});
    setChemicalVolumeUsed(0);
    setAdherenceConfirmed(false);
    setElapsedSeconds(0);
    setNotes('');
    setExecutionState('running');
  }, [procedure]);

  const markStepDone = useCallback((stepId: string, photoDataURI?: string) => {
    if (executionState !== 'running') return;
    
    // Toggle check
    setCompletedSteps(prev => {
      if (prev.includes(stepId)) {
        return prev.filter(id => id !== stepId);
      } else {
        return [...prev, stepId];
      }
    });

    if (photoDataURI) {
      setStepPhotos(prev => ({ ...prev, [stepId]: photoDataURI }));
    }
  }, [executionState]);

  const nextStep = useCallback(() => {
    if (!procedure) return;
    if (currentStepIndex < procedure.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [procedure, currentStepIndex]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const finishExecution = useCallback(async (isSuccess: boolean = true) => {
    if (!procedure || !activeExecutionId) return;

    const log: ProcedureExecutionLog = {
      id: activeExecutionId,
      procedureId: procedure.id,
      procedureTitle: procedure.title,
      technicianId,
      technicianName,
      tenantId: procedure.tenantId,
      startedAt: Date.now() - (elapsedSeconds * 1000),
      completedAt: Date.now(),
      status: isSuccess ? 'completed' : 'failed',
      completedStepIds: completedSteps,
      stepPhotos,
      chemicalVolumeUsed,
      chemicalAdherenceConfirmed: adherenceConfirmed,
      durationSeconds: elapsedSeconds,
      notes
    };

    await service.logProcedureExecution(log);
    setExecutionState(isSuccess ? 'completed' : 'failed');
    
    // Log telemetry views views
    await service.trackDocumentEngagement(procedure.id, 'procedure', elapsedSeconds);
  }, [
    procedure,
    activeExecutionId,
    completedSteps,
    stepPhotos,
    chemicalVolumeUsed,
    adherenceConfirmed,
    elapsedSeconds,
    notes,
    technicianId,
    technicianName,
    service
  ]);

  const cancelExecution = useCallback(() => {
    setExecutionState('idle');
    setActiveExecutionId(null);
  }, []);

  return {
    activeExecutionId,
    currentStepIndex,
    setCurrentStepIndex,
    completedSteps,
    stepPhotos,
    chemicalVolumeUsed,
    setChemicalVolumeUsed,
    adherenceConfirmed,
    setAdherenceConfirmed,
    executionState,
    elapsedSeconds,
    notes,
    setNotes,
    startExecution,
    markStepDone,
    nextStep,
    prevStep,
    finishExecution,
    cancelExecution
  };
}
