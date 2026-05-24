/**
 * Custom React Hook: useOperationalReports
 * Feeds field operators with checklists completion logs and pest density reports downloads.
 */

import { useReporting } from './useReporting';

export function useOperationalReports() {
  const { snapshots, templates, triggerExport } = useReporting();

  const operationalTemplates = templates.filter(t => t.category === 'operational');
  const operationalSnapshots = snapshots.filter(s => s.category === 'operational');

  const executeTechProductivityExport = async (metrics: Record<string, any>, userRole: string) => {
    const matched = operationalTemplates.find(t => t.id === 'tpl_oper_productivity_card');
    if (!matched) throw new Error('Template operacional padrão não localizado.');

    return await triggerExport(matched.id, 'pdf', metrics, userRole);
  };

  return {
    operationalTemplates,
    operationalSnapshots,
    executeTechProductivityExport
  };
}

export default useOperationalReports;
