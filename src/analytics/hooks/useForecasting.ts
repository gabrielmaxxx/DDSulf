/**
 * Hook: useForecasting
 * Exposes seasonality parameters, month-by-month predictions, and rain-demand estimation trees.
 */

import { useState } from 'react';
import { forecastingService } from '../services/forecastingService';
import { HistoricalForecast } from '../types';

export function useForecasting(period?: any) {
  const [revenueForecast] = useState<HistoricalForecast[]>(() => forecastingService.getRevenueForecast());
  const [pestActivity] = useState(() => forecastingService.getPestActivitySazonalidade());

  const getSazonalidadePestCoeffs = (category: 'cupins' | 'baratas' | 'roedores') => {
    return pestActivity[category];
  };

  const predictDynamicPesticideCapacityNeededKg = (humidity: number, temperature: number) => {
    return forecastingService.generatePredictiveInboundVolume(humidity, temperature);
  };

  return {
    revenueForecast,
    pestActivity,
    getSazonalidadePestCoeffs,
    predictDynamicPesticideCapacityNeededKg
  };
}
