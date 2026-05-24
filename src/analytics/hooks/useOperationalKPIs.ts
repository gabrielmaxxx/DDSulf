/**
 * Hook: useOperationalKPIs
 * Retreives operational KPI structures with real-time value update capabilities.
 */

import { useState, useEffect } from 'react';
import { kpiService } from '../services/kpiService';
import { OperationalKPI } from '../types';

export function useOperationalKPIs(categoryOrPeriod?: any) {
  // Try filtering if it's a known category, else load all
  const category = (categoryOrPeriod === 'financial' || categoryOrPeriod === 'operational' || categoryOrPeriod === 'customer')
    ? categoryOrPeriod
    : undefined;

  const [kpis, setKpis] = useState<OperationalKPI[]>(() => kpiService.getKPIs(category));

  const refreshKPIs = () => {
    setKpis(kpiService.getKPIs(category));
  };

  const adjustKPIValue = (key: string, newValue: number) => {
    kpiService.updateKPI(key, newValue);
    refreshKPIs();
  };

  // Pre-existing backwards compatible fields
  const visitsFinished = 112; 

  return {
    kpis,
    refreshKPIs,
    adjustKPIValue,
    visitsFinished
  };
}
