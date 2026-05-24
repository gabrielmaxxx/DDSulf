/**
 * Custom React Hook: useWorkspace
 * Coordinates multiple parallel visual divisions (e.g., branch cities, specific sectors).
 */

import { useOrganizational } from '../providers/OrganizationalProvider';
import { organizationalService } from '../services';

export function useWorkspace() {
  const { activeWorkspace, workspaces, switchWorkspace, activeTenant } = useOrganizational();

  /**
   * Safe provisioning of a new visual operating workspace
   */
  const createNewWorkspaceInTenant = async (name: string) => {
    if (!activeTenant) throw new Error('Tenant não configurado ou nulo.');
    const newWorkspace = await organizationalService.createWorkspace(activeTenant.id, name);
    // Reload active visual options
    switchWorkspace(newWorkspace.id);
    return newWorkspace;
  };

  return {
    activeWorkspace,
    workspaces,
    switchWorkspace,
    createNewWorkspace: createNewWorkspaceInTenant,
    hasMultipleWorkspaces: workspaces.length > 1
  };
}

export default useWorkspace;
