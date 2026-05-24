/**
 * DDSulf Organisational SaaS Provider & Coordination Store
 * Establishes reactive global workspace states, local-storage scopes and active branding injection.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tenant, Workspace, UserRoleType, Permission, TenantBranding } from '../types';
import { tenantService, organizationalService, rbacService } from '../services';

interface OrganizationalContextType {
  activeTenant: Tenant | null;
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  availableTenants: Tenant[];
  isLoading: boolean;
  switchWorkspace: (workspaceId: string) => void;
  switchTenant: (tenantId: string) => void;
  activeFeatures: string[];
  permissions: Permission[];
}

const OrganizationalContext = createContext<OrganizationalContextType>({
  activeTenant: null,
  activeWorkspace: null,
  workspaces: [],
  availableTenants: [],
  isLoading: true,
  switchWorkspace: () => {},
  switchTenant: () => {},
  activeFeatures: [],
  permissions: []
});

export function OrganizationalProvider({ children }: { children: React.ReactNode }) {
  const { user, role: authRole } = useAuth();
  
  // Storage keys for offline-first visual resilience
  const [tenantId, setTenantId] = useState<string>(() => {
    return localStorage.getItem('ddsulf_active_tenant') || 'ddsulf_matriz';
  });
  
  const [workspaceId, setWorkspaceId] = useState<string>(() => {
    return localStorage.getItem('ddsulf_active_workspace') || 'workspace_erechim';
  });

  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derive permissions of the active role from the RBAC core
  const userRole: UserRoleType = (user?.role || authRole || 'operator') as UserRoleType;
  const roleConfig = rbacService.getRoleInfo(userRole);
  const permissions = roleConfig.permissions;

  // React to tenant or identity variations
  useEffect(() => {
    async function loadSaaSContext() {
      setIsLoading(true);
      try {
        // Load available tenants for enterprise administration switcher lists
        const m1 = await tenantService.getTenantById('ddsulf_matriz');
        const m2 = await tenantService.getTenantById('dedetizadora_serra');
        const tenantsList: Tenant[] = [];
        if (m1) tenantsList.push(m1);
        if (m2) tenantsList.push(m2);
        setAvailableTenants(tenantsList);

        // Fetch targeting active tenant
        const tenantInfo = await tenantService.getTenantById(tenantId);
        if (tenantInfo) {
          setActiveTenant(tenantInfo);
          
          // Load workgroups
          const workgroups = await organizationalService.getWorkspaces(tenantId);
          setWorkspaces(workgroups);

          // Find targeting workspace or fallback to the first active one
          const activeW = workgroups.find(w => w.id === workspaceId) || workgroups[0] || null;
          setActiveWorkspace(activeW);
          if (activeW) {
            setWorkspaceId(activeW.id);
            localStorage.setItem('ddsulf_active_workspace', activeW.id);
          }
        }
      } catch (err) {
        console.error('Error loading corporate multi-tenant schemas:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSaaSContext();
  }, [tenantId, workspaceId]);

  const switchWorkspace = (id: string) => {
    setWorkspaceId(id);
    localStorage.setItem('ddsulf_active_workspace', id);
  };

  const switchTenant = (id: string) => {
    setTenantId(id);
    localStorage.setItem('ddsulf_active_tenant', id);
    // Reset workspace to prevent invalid workspace crossover
    localStorage.removeItem('ddsulf_active_workspace');
    setWorkspaceId('');
  };

  const activeFeatures = activeTenant?.activeFeatures || [];

  return (
    <OrganizationalContext.Provider value={{
      activeTenant,
      activeWorkspace,
      workspaces,
      availableTenants,
      isLoading,
      switchWorkspace,
      switchTenant,
      activeFeatures,
      permissions
    }}>
      {children}
    </OrganizationalContext.Provider>
  );
}

export const useOrganizational = () => useContext(OrganizationalContext);
export default OrganizationalProvider;
