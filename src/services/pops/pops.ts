import { BaseFirestoreService } from '../firestore/BaseFirestoreService';
import { POP, PestType, EnvironmentType } from '@/types/database';
import { logOperationalEvent } from '@/firebase/analytics';

export class POPsService extends BaseFirestoreService<POP> {
  constructor() {
    super('pops');
  }

  /**
   * Filter and search procedures database according to pest types
   */
  async listPOPsByPest(pest: PestType): Promise<POP[]> {
    return this.list({
      filters: [
        { field: 'pestType', operator: '==', value: pest }
      ]
    });
  }

  /**
   * Filter procedures database according to technical environment classification
   */
  async listPOPsByEnvironment(env: EnvironmentType): Promise<POP[]> {
    return this.list({
      filters: [
        { field: 'environmentType', operator: '==', value: env }
      ]
    });
  }

  /**
   * Quick checklist retriever for technician on-site validation tasks
   */
  async getSOPChecklist(popId: string): Promise<string[]> {
    const pop = await this.getById(popId);
    if (!pop) return [];
    return pop.checklist || [];
  }
}

export const popsService = new POPsService();
export default popsService;
