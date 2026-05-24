/**
 * Custom React Hook: useExportEngine
 * Handles active document export queues, statuses updates, and file downloads.
 */

import { useReporting } from './useReporting';

export function useExportEngine() {
  const { activeJobs, removeJobRecord } = useReporting();

  const handleDownloadFile = (jobId: string) => {
    const job = activeJobs.find(j => j.id === jobId);
    if (!job || !job.downloadUrl || job.status !== 'ready') return;

    // Standard client trigger anchor click
    const link = document.createElement('a');
    link.href = job.downloadUrl;
    link.download = `ddsulf_document_${jobId}.${job.format === 'csv' ? 'csv' : 'svg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    queue: activeJobs,
    activeJobsCount: activeJobs.filter(j => j.status === 'generating').length,
    downloadJob: handleDownloadFile,
    clearJobHistory: removeJobRecord
  };
}

export default useExportEngine;
