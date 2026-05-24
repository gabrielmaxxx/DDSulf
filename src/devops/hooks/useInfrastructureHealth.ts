/**
 * Hook to manage multi-resource infrastructures, cloud components and database index scaling.
 */

import { useState, useEffect } from 'react';
import { infrastructureService } from '../services/infrastructureService';
import { InfrastructureResource } from '../types';

export function useInfrastructureHealth() {
  const [resources, setResources] = useState<InfrastructureResource[]>([]);
  const [systemIntegrity, setSystemIntegrity] = useState<any>({ healthy: true, stats: {} });

  const loadResources = () => {
    setResources(infrastructureService.getResources());
    setSystemIntegrity(infrastructureService.verifyIntegrityAllTiers());
  };

  useEffect(() => {
    loadResources();
  }, []);

  const scaleResource = (id: string, factor: 'scale_up' | 'scale_down') => {
    infrastructureService.triggerScaling(id, factor);
    loadResources();
  };

  const createCompositeIndex = (name: string) => {
    const created = infrastructureService.provisionNewIndex(name);
    loadResources();
    return created;
  };

  return {
    resources,
    systemIntegrity,
    scaleResource,
    createCompositeIndex,
    refreshResources: loadResources
  };
}
