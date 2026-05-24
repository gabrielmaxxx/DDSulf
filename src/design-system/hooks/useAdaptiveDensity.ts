/**
 * Custom React Hook: useAdaptiveDensity
 * Switches padding and rendering scale depending on the operational status and requirements.
 */

import { useState } from 'react';
import { ComponentDensity } from '../types';

export function useAdaptiveDensity(initialDensity: ComponentDensity = 'comfortable') {
  const [density, setDensity] = useState<ComponentDensity>(initialDensity);

  const getSpacingClass = (type: 'card' | 'table' | 'button') => {
    switch (density) {
      case 'compact':
        if (type === 'card') return 'p-4 gap-2 rounded-xl';
        if (type === 'table') return 'py-1.5 px-3 text-xs';
        return 'h-9 px-3 text-xs rounded-lg';
      case 'dense_operational':
        if (type === 'card') return 'p-3 gap-1 rounded-sm';
        if (type === 'table') return 'py-1 px-2 text-[11px] font-mono';
        return 'h-8 px-2 text-[11px] rounded-xs font-mono';
      case 'comfortable':
      default:
        if (type === 'card') return 'p-8 gap-4 rounded-3xl';
        if (type === 'table') return 'py-3.5 px-6 text-sm';
        return 'h-11 px-5 text-sm rounded-2xl';
    }
  };

  return {
    density,
    setDensity,
    getSpacingClass,
    isCompact: density === 'compact',
    isDenseOperational: density === 'dense_operational'
  };
}

export default useAdaptiveDensity;
