/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo } from 'react';
import { forecastingOrchestrationService } from '../services/forecastingOrchestrationService';
import { ForecastingMetric } from '../types';

export function useOperationalForecasting(initialBaseRevenue: number = 96000) {
  const [baseRevenue, setBaseRevenue] = useState(initialBaseRevenue);
  const [targetStabilityRate, setTargetStabilityRate] = useState(90);

  const forecastData = useMemo<ForecastingMetric[]>(() => {
    return forecastingOrchestrationService.generateForecastProjections(baseRevenue, targetStabilityRate);
  }, [baseRevenue, targetStabilityRate]);

  const updateParameters = useCallback((revenue: number, stabilityRate: number) => {
    setBaseRevenue(revenue);
    setTargetStabilityRate(stabilityRate);
  }, []);

  return {
    baseRevenue,
    targetStabilityRate,
    forecastData,
    updateParameters
  };
}
