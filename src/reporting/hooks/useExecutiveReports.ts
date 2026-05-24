/**
 * Custom React Hook: useExecutiveReports
 * Focuses on high-level administrative summaries, KPIs comparisons, and business-focused decisions.
 */

import { useReporting } from './useReporting';

export function useExecutiveReports() {
  const { snapshots, templates, triggerExport, generatingCount } = useReporting();

  const executiveTemplates = templates.filter(t => t.category === 'executive');
  const executiveSnapshots = snapshots.filter(s => s.category === 'executive');

  const executeBulkExecutiveCompilation = async (customPayload: Record<string, any>, userRole: string) => {
    // Compile all executive layouts consecutivelly
    const promises = executiveTemplates.map(t => 
      triggerExport(t.id, 'pdf', customPayload, userRole)
    );
    return Promise.all(promises);
  };

  return {
    executiveTemplates,
    executiveSnapshots,
    generatingCount,
    executeBulkExecutiveCompilation
  };
}

export default useExecutiveReports;
