/**
 * DDSulf Firebase Emulator Suite Mock for QA Testing
 * Simulates local firestore rules enforcement and snapshot streaming.
 */

export interface EmulatorConfig {
  host: string;
  firestorePort: number;
  authPort: number;
  storagePort: number;
}

export class FirebaseEmulatorMock {
  private config: EmulatorConfig;
  private connectionActive: boolean = false;
  private securityRulesLoaded: boolean = false;

  constructor(config: EmulatorConfig) {
    this.config = config;
  }

  public async connect(): Promise<boolean> {
    this.connectionActive = true;
    this.securityRulesLoaded = true;
    return true;
  }

  public async loadFirestoreRules(rulesContent: string): Promise<boolean> {
    if (!this.connectionActive) {
      throw new Error('Emulator not running. Cannot load database security rules.');
    }
    this.securityRulesLoaded = true;
    return true;
  }

  /**
   * Mock querying isolated tenant collection enforcing rules
   */
  public queryCollectionIsolated(
    tenantId: string, 
    collection: string, 
    requestingUserRole: string,
    requestingUserTenantId: string
  ): { allowed: boolean; records: any[]; reason?: string } {
    if (requestingUserTenantId !== tenantId) {
      return {
        allowed: false,
        records: [],
        reason: 'Missing or insufficient permissions: Access violation on multi-tenant isolation rules.'
      };
    }

    if (collection === 'audit_logs' && requestingUserRole !== 'super_admin' && requestingUserRole !== 'admin') {
      return {
        allowed: false,
        records: [],
        reason: 'Missing or insufficient permissions: Role does not possess read authorization on analytical audit records.'
      };
    }

    return {
      allowed: true,
      records: [
        { id: 'rec_1', name: 'Mock Record A', tenantId },
        { id: 'rec_2', name: 'Mock Record B', tenantId }
      ]
    };
  }

  public disconnect() {
    this.connectionActive = false;
  }
}
