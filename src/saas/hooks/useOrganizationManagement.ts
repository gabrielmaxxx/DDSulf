/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { OrganizationInfo } from '../types';

const ORG_STORAGE_KEY = 'ddsulf_saas_organizations';

export function useOrganizationManagement(tenantId?: string) {
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);

  const loadOrganization = useCallback(() => {
    if (!tenantId) return;

    try {
      const saved = localStorage.getItem(ORG_STORAGE_KEY);
      let orgs: OrganizationInfo[] = [];
      if (saved) {
        orgs = JSON.parse(saved);
      } else {
        orgs = [
          {
            id: 'org_matriz',
            tenantId: 'tenant_matriz_sul',
            legalName: 'DDSulf Controladores Associados LTDA',
            tradeName: 'DDSulf Sul Matriz',
            cnpj: '45.122.980/0001-92',
            branches: [
              { id: 'b_poa', branchName: 'Porto Alegre (Matriz)', city: 'Porto Alegre - RS', activeTechnicalsCount: 12 },
              { id: 'b_cax', branchName: 'Caxias do Sul Filial', city: 'Caxias do Sul - RS', activeTechnicalsCount: 5 },
              { id: 'b_pelas', branchName: 'Pelotas Filial', city: 'Pelotas - RS', activeTechnicalsCount: 3 },
            ]
          },
          {
            id: 'org_bio',
            tenantId: 'tenant_bio_sanear',
            legalName: 'Bio Sanear Controle Ambiental S/S',
            tradeName: 'Bio Sanear',
            cnpj: '19.450.112/0001-04',
            branches: [
              { id: 'b_cur', branchName: 'Curitiba Central', city: 'Curitiba - PR', activeTechnicalsCount: 8 }
            ]
          }
        ];
        localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(orgs));
      }

      const match = orgs.find(o => o.tenantId === tenantId);
      if (match) {
        setOrganization(match);
      } else {
        // Create generic placeholder organization for non-configured tenants
        const generic: OrganizationInfo = {
          id: `org_gen_${Date.now()}`,
          tenantId,
          legalName: 'Configurar Nome Legal LTDA',
          tradeName: 'Configurar Nome Comercial',
          cnpj: '00.000.000/0001-00',
          branches: [
            { id: `b_${Date.now()}`, branchName: 'Sede Principal', city: 'Porto Alegre - RS', activeTechnicalsCount: 1 }
          ]
        };
        setOrganization(generic);
      }
    } catch {
      // offline silent error
    }
  }, [tenantId]);

  useEffect(() => {
    loadOrganization();
  }, [loadOrganization]);

  const addBranch = useCallback((branchName: string, city: string) => {
    if (!organization) return;

    const updatedBranches = [
      ...organization.branches,
      {
        id: `branch_node_${Date.now()}`,
        branchName,
        city,
        activeTechnicalsCount: 0
      }
    ];

    const updatedOrg = {
      ...organization,
      branches: updatedBranches
    };

    setOrganization(updatedOrg);

    try {
      const saved = localStorage.getItem(ORG_STORAGE_KEY);
      if (saved) {
        const orgList: OrganizationInfo[] = JSON.parse(saved);
        const idx = orgList.findIndex(o => o.tenantId === organization.tenantId);
        if (idx !== -1) {
          orgList[idx] = updatedOrg;
        } else {
          orgList.push(updatedOrg);
        }
        localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(orgList));
      }
    } catch {
      // Offline fallback callback
    }
  }, [organization]);

  return {
    organization,
    addBranch,
    reloadOrganization: loadOrganization
  };
}
