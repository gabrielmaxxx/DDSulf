import { BaseFirestoreService } from '../firestore/BaseFirestoreService';
import { POP, PestType, EnvironmentType } from '@/types/database';

export class POPsService extends BaseFirestoreService<POP> {
  constructor() {
    super('pops');
  }

  /**
   * Filter and search procedures database according to pest types
   */
  async listPOPsByPest(empresaId: string, pest: PestType): Promise<POP[]> {
    return this.list(empresaId, {
      filters: [
        { field: 'pestType', operator: '==', value: pest }
      ]
    });
  }

  /**
   * Filter procedures database according to technical environment classification
   */
  async listPOPsByEnvironment(empresaId: string, env: EnvironmentType): Promise<POP[]> {
    return this.list(empresaId, {
      filters: [
        { field: 'environmentType', operator: '==', value: env }
      ]
    });
  }

  /**
   * Quick checklist retriever for technician on-site validation tasks
   */
  async getSOPChecklist(empresaId: string, popId: string): Promise<string[]> {
    const pop = await this.getById(empresaId, popId);
    if (!pop) return [];
    return pop.checklist || [];
  }
}

export const popsService = new POPsService();
export default popsService;
