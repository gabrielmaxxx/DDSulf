/**
 * Custom React Hook: useReporting
 * Main coordinator linking active templates, generation jobs, finished snapshots and telemetry metrics.
 */

import { useState, useEffect } from 'react';
import { ReportTemplate, ReportSnapshot, ExportJob } from '../types';
import { ReportingEngineService } from '../services/reportingService';

export function useReporting() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [snapshots, setSnapshots] = useState<ReportSnapshot[]>([]);
  const [activeJobs, setActiveJobs] = useState<ExportJob[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);

  const reloadData = () => {
    setTemplates(ReportingEngineService.getTemplates());
    setSnapshots(ReportingEngineService.getSnapshots());
    setActiveJobs(ReportingEngineService.getActiveJobs());
    setTelemetry(ReportingEngineService.getTelemetry());
  };

  useEffect(() => {
    reloadData();
    const unsubscribe = ReportingEngineService.subscribe(reloadData);
    return () => unsubscribe();
  }, []);

  const triggerExport = async (templateId: string, format: 'pdf' | 'csv', customContext: Record<string, any>, userRole: string) => {
    return await ReportingEngineService.executeExport(templateId, format, customContext, userRole);
  };

  const removeJobRecord = (jobId: string) => {
    ReportingEngineService.wipeJobLog(jobId);
  };

  const removeSnapshot = (snapId: string) => {
    ReportingEngineService.deleteSnapshot(snapId);
  };

  return {
    templates,
    snapshots,
    activeJobs,
    telemetry,
    triggerExport,
    removeJobRecord,
    removeSnapshot,
    generatingCount: activeJobs.filter(j => j.status === 'generating').length
  };
}

export default useReporting;
