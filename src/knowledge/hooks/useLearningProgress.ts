import { useState, useEffect, useCallback } from 'react';
import { DDSulfKnowledgeService } from '../services/knowledgeService';
import { LearningPath, UserLearningProgress } from '../types';

export function useLearningProgress(userId: string = 'tech_rod_1') {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [progress, setProgress] = useState<UserLearningProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const service = DDSulfKnowledgeService.getInstance();

  const loadLearningTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const allPaths = await service.getLearningPaths();
      const userProg = await service.getLearningProgress(userId);
      setPaths(allPaths);
      setProgress(userProg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [service, userId]);

  useEffect(() => {
    loadLearningTimeline();
  }, [loadLearningTimeline]);

  const markStepComplete = useCallback(async (pathId: string, stepId: string, completed: boolean = true) => {
    try {
      const updated = await service.updateLearningStepCompletion(userId, pathId, stepId, completed);
      setProgress(prev => prev.map(p => p.pathId === pathId ? updated : p));
      return updated;
    } catch (e) {
      console.error('Failed to toggle onboarding learning step completion:', e);
    }
  }, [service, userId]);

  const sendQuizAnswers = useCallback(async (pathId: string, quizId: string, correctCount: number, totalQuestions: number) => {
    try {
      const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
      const updated = await service.submitQuizResult(userId, pathId, quizId, scorePercentage);
      setProgress(prev => prev.map(p => p.pathId === pathId ? updated : p));
      return updated;
    } catch (e) {
      console.error('Failed to log exam answers score:', e);
    }
  }, [service, userId]);

  return {
    paths,
    progress,
    loadingLearning: loading,
    refreshPaths: loadLearningTimeline,
    markStepComplete,
    sendQuizAnswers
  };
}
