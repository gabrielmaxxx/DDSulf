/**
 * DDSulf Infrastructure Automation and Health Orchestration Service
 */

import { InfrastructureResource } from '../types';

class InfrastructureService {
  private resources: InfrastructureResource[] = [];

  constructor() {
    this.seedResources();
  }

  private seedResources() {
    this.resources = [
      {
        id: 'infra_res_01',
        name: 'Firestore Database Multi-Region Replica',
        type: 'database_replica',
        status: 'active',
        tier: 'tier-1-critical',
        currentLoad: 34,
        region: 'southamerica-east1 (São Paulo)',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'infra_res_02',
        name: 'Cloudflare Edge CDN Endpoint',
        type: 'cdn_endpoint',
        status: 'active',
        tier: 'tier-1-critical',
        currentLoad: 18,
        region: 'latam-edge-mesh',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'infra_res_03',
        name: 'DDSulf Service Worker Assets Manifest',
        type: 'pwa_service_worker',
        status: 'active',
        tier: 'tier-2-operational',
        currentLoad: 4,
        region: 'pwa-client-layer',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'infra_res_04',
        name: 'Gemini 2.5 Server-Side Proxy API Handler',
        type: 'gemini_api_proxy',
        status: 'active',
        tier: 'tier-2-operational',
        currentLoad: 42,
        region: 'us-central1 (Iowa)',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'infra_res_05',
        name: 'Firestore Geo-Index Bounds Composite Key',
        type: 'firestore_index',
        status: 'active',
        tier: 'tier-1-critical',
        currentLoad: 12,
        region: 'southamerica-east1',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'infra_res_06',
        name: 'Enterprise OAuth Single-Sign-On Token Broker',
        type: 'auth_broker',
        status: 'active',
        tier: 'tier-1-critical',
        currentLoad: 25,
        region: 'global-ingress-cluster',
        updatedAt: new Date().toISOString()
      }
    ];
  }

  public getResources(): InfrastructureResource[] {
    return this.resources;
  }

  public triggerScaling(id: string, factor: 'scale_up' | 'scale_down') {
    const res = this.resources.find(r => r.id === id);
    if (res) {
      if (factor === 'scale_up') {
        res.currentLoad = Math.max(10, res.currentLoad - 20); // provisioning more capacity drops current load percentage
        res.updatedAt = new Date().toISOString();
      } else {
        res.currentLoad = Math.min(95, res.currentLoad + 25);
        res.updatedAt = new Date().toISOString();
      }
    }
  }

  public provisionNewIndex(name: string): InfrastructureResource {
    const resource: InfrastructureResource = {
      id: `infra_res_${Math.floor(100 + Math.random() * 900)}`,
      name,
      type: 'firestore_index',
      status: 'provisioning',
      tier: 'tier-2-operational',
      currentLoad: 0,
      region: 'southamerica-east1',
      updatedAt: new Date().toISOString()
    };
    this.resources.push(resource);
    return resource;
  }

  public verifyIntegrityAllTiers(): { healthy: boolean; stats: Record<string, number> } {
    let active = 0;
    let fallback = 0;
    this.resources.forEach(r => {
      if (r.status === 'active') active++;
      else fallback++;
    });
    return {
      healthy: fallback === 0,
      stats: {
        total: this.resources.length,
        active,
        degradedOrFailed: fallback
      }
    };
  }
}

export const infrastructureService = new InfrastructureService();
export default infrastructureService;
