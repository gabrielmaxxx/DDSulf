/**
 * DDSulf Scalability Operations & Policies Service
 * Coordinates database partition allocations, handles bulk batching policies, and computes pricing/quota limits.
 */

export interface PartitionScope {
  tenantId: string;
  regionCode: string;
  shardIndex: number;
}

class ScalabilityService {
  /**
   * Generates correct database partitioning path to resolve index conflicts in large Firestore instances
   */
  public getPartitionAssignment(tenantId: string, regionCode: string = 'RS'): PartitionScope {
    // Basic hash to allocate across shards [0, 1, 2] to ensure instant writes without hot-spotting
    let hash = 0;
    for (let i = 0; i < tenantId.length; i++) {
        hash = tenantId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const shard = Math.abs(hash % 3);

    return {
      tenantId,
      regionCode,
      shardIndex: shard
    };
  }

  /**
   * Calculates optimum limits based on current network and hardware classification
   */
  public getBatchQuotaAdvice(lowEndActive: boolean): { maxBatchSize: number; cacheExpiryMs: number; fetchLimit: number } {
    return {
      maxBatchSize: lowEndActive ? 150 : 500,
      cacheExpiryMs: lowEndActive ? 60000 : 3600000, // 1 min vs 1 hour
      fetchLimit: lowEndActive ? 25 : 100
    };
  }
}

export const scalabilityService = new ScalabilityService();
export default scalabilityService;
