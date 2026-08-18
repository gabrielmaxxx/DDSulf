/**
 * DDSulf QA Monitoring Service
 * Directs diagnostic tracking of offline synchronizations and realtime Firestore channels.
 */

import { RealtimeListenerDiagnostic, OfflineSyncSimulation } from '@/types/qa';
import { tenantStorage } from '@/utils/storage';

class QAMonitoringService {
  private listeners: RealtimeListenerDiagnostic[] = [];
  private offlineQueue: OfflineSyncSimulation[] = [];

  constructor() {
    this.seedDiagnostics();
  }

  private seedDiagnostics() {
    const tenantId = tenantStorage.getEmpresaId() || 'matriz';

    this.listeners = [
      {
        listenerId: 'lis_rt_tenants',
        collectionPath: `tenants/${tenantId}`,
        eventsReceivedCount: 142,
        lastReceivedAt: new Date(Date.now() - 5000).toISOString(),
        status: 'healthy_stream'
      },
      {
        listenerId: 'lis_rt_inventory',
        collectionPath: `tenants/${tenantId}/inventory`,
        eventsReceivedCount: 981,
        lastReceivedAt: new Date(Date.now() - 15000).toISOString(),
        status: 'healthy_stream'
      },
      {
        listenerId: 'lis_rt_billing',
        collectionPath: `tenants/${tenantId}/billing`,
        eventsReceivedCount: 42,
        lastReceivedAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'listening'
      }
    ];

    this.offlineQueue = [
      {
        id: 'off_item_101',
        payloadType: 'inventory',
        offlineAt: new Date(Date.now() - 120000).toISOString(),
        status: 'queued',
        data: { name: 'K-Othrine WG 250 (Potes 500g)', qtyDelta: -4, technicianId: 'tech_502' }
      },
      {
        id: 'off_item_102',
        payloadType: 'report',
        offlineAt: new Date(Date.now() - 90000).toISOString(),
        reconciledAt: new Date(Date.now() - 10000).toISOString(),
        status: 'resolved',
        data: { reportId: 'rep_pest_erechim_92', status: 'concluded' }
      }
    ];
  }

  public getRealtimeListeners(): RealtimeListenerDiagnostic[] {
    return this.listeners;
  }

  public getOfflineQueue(): OfflineSyncSimulation[] {
    return this.offlineQueue;
  }

  /**
   * Mock adding a client-side mutation to the offline synchronloop
   */
  public enqueueOfflineMutation(type: OfflineSyncSimulation['payloadType'], data: Record<string, any>): OfflineSyncSimulation {
    const fresh: OfflineSyncSimulation = {
      id: `off_item_${Math.floor(200 + Math.random() * 800)}`,
      payloadType: type,
      offlineAt: new Date().toISOString(),
      status: 'queued',
      data
    };
    this.offlineQueue.unshift(fresh);
    return fresh;
  }

  /**
   * Triggers a mock reconciliation syncing items in the queue to backend servers
   */
  public async processOfflineGatewaySync(): Promise<{ reconciledCount: number; unresolvedConflicts: number }> {
    let synced = 0;
    for (const item of this.offlineQueue) {
      if (item.status === 'queued') {
        item.status = 'syncing';
        await new Promise(resolve => setTimeout(resolve, 80)); // mock local db resolve
        item.status = 'resolved';
        item.reconciledAt = new Date().toISOString();
        synced++;
      }
    }
    return {
      reconciledCount: synced,
      unresolvedConflicts: 0
    };
  }
}

export const qaMonitoringService = new QAMonitoringService();
export default qaMonitoringService;
