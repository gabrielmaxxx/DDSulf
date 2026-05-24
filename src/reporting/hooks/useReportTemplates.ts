/**
 * Custom React Hook: useReportTemplates
 * Streamlines template customization colors, layout structures, and logo toggles configuration.
 */

import { useState, useEffect } from 'react';
import { ReportTemplate } from '../types';
import { ReportingEngineService } from '../services/reportingService';

export function useReportTemplates() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);

  useEffect(() => {
    setTemplates(ReportingEngineService.getTemplates());
  }, []);

  const updateTemplateDesign = (templateId: string, updates: Partial<Pick<ReportTemplate, 'accentColor' | 'logoIncluded' | 'layoutType'>>) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === templateId) {
        return { ...t, ...updates };
      }
      return t;
    }));
  };

  return {
    templates,
    updateTemplateDesign
  };
}

export default useReportTemplates;
