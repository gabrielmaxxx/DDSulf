/**
 * Hook to manage production release certification policies, compliance checks and manual gating.
 */

import { useState } from 'react';
import { DevOpsPolicy } from '../types';

export function useProductionReadiness() {
  const [policies, setPolicies] = useState<DevOpsPolicy[]>([
    {
      code: 'POL_TSC_01',
      title: 'Strong Typescript & Index Compile',
      description: 'Garanta que types.ts compile sem imports quebrados ou mocks redundantes.',
      requirements: ['Imports do topo declarados', 'No structural bypass (any/unknown de-gated)'],
      certified: true
    },
    {
      code: 'POL_PWA_02',
      title: 'Offline Workbox Precaching Sync Layer',
      description: 'Validar se arquivos do Service Worker possuem checksum e assinaturas de cache consistentes.',
      requirements: ['assets-manifest.json valido', 'Offline router keys prontas no IndexedDB'],
      certified: true
    },
    {
      code: 'POL_TEN_03',
      title: 'Strict Multi-Tenant Leak Prevention',
      description: 'Verificar se todas as queries ao Firestore utilizam id ou contexto da organização ddsulf_matriz ativa.',
      requirements: ['No wildcard queries no-context', 'SecOps validation token anexado no headers'],
      certified: true
    },
    {
      code: 'POL_SEC_04',
      title: 'API Proxy Cryptographic Masking',
      description: 'Certificar que chaves do Gemini API e Stripe Secret trafegam estritamente server-side.',
      requirements: ['No client-side VITE_ prefix para secrets cruciais', 'Auditoria Sentry injetada'],
      certified: false
    }
  ]);

  const togglePolicyCertification = (code: string) => {
    setPolicies(prev => prev.map(p => {
      if (p.code === code) {
        return { ...p, certified: !p.certified };
      }
      return p;
    }));
  };

  const checkOverallReadyStatus = () => {
    return policies.every(p => p.certified);
  };

  return {
    policies,
    togglePolicyCertification,
    isReadyForProductionLaunch: checkOverallReadyStatus()
  };
}
export default useProductionReadiness;
