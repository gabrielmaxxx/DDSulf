/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { trainingService } from '../services/trainingService';
import { TrainingModule } from '../types';

export function useTrainingGuidance() {
  const [courses, setCourses] = useState<TrainingModule[]>(() => trainingService.getModules());

  const refreshCourses = useCallback(() => {
    setCourses([...trainingService.getModules()]);
  }, []);

  const finishCourse = useCallback((id: string, score: number) => {
    trainingService.completeModule(id, score);
    refreshCourses();
  }, [refreshCourses]);

  return {
    courses,
    finishCourse
  };
}
export default useTrainingGuidance;
