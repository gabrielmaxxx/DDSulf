/**
 * Custom React Hook: useFinancialReports
 * Manages margin structures outputs and billing reports, strictly guarded.
 */

import { useReporting } from './useReporting';

export function useFinancialReports() {
  const { snapshots, templates, triggerExport, removeSnapshot } = useReporting();

  const financialTemplates = templates.filter(t => t.category === 'financial');
  const financialSnapshots = snapshots.filter(s => s.category === 'financial');

  const executeAuditExport = async (format: 'pdf' | 'csv', metricsContext: Record<string, any>, userRole: string) => {
    const auditTemplate = financialTemplates.find(t => t.id === 'tpl_financial_margin_audit');
    if (!auditTemplate) throw new Error('Template de auditoria de margem indisponível.');

    return await triggerExport(auditTemplate.id, format, metricsContext, userRole);
  };

  return {
    financialTemplates,
    financialSnapshots,
    executeAuditExport,
    deleteFinancialSnapshot: removeSnapshot
  };
}

export default useFinancialReports;
