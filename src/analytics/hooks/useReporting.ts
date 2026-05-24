/**
 * Hook: useReporting
 * Exposes compiled reports lists, snapshot generation workflows, and simulated file exports.
 */

import { useState } from 'react';
import { reportingService, AnalyticalReport } from '../services/reportingService';

export function useReporting() {
  const [reports, setReports] = useState<AnalyticalReport[]>(() => reportingService.getReports());

  const compileNewReport = (title: string, scope: 'financial' | 'chemical' | 'regulatory' | 'operational', issuedBy = 'Auditor BI') => {
    reportingService.generateReportSnapshot(title, scope, issuedBy);
    setReports(reportingService.getReports());
  };

  const getCsvData = (scope: string) => {
    return reportingService.compileCSVFormat(scope);
  };

  const incrementDownload = (id: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, downloadCount: r.downloadCount + 1 };
      }
      return r;
    }));
  };

  return {
    reports,
    compileNewReport,
    getCsvData,
    incrementDownload
  };
}
