/**
 * Domain-specific Repository class for central Business Quotes matching security standards with multi-tenant support
 */

import { BaseRepository } from './BaseRepository';
import { Quote, QuoteStatus } from '../types/enterprise';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config';
import { handleFirestoreError } from '../utils/errorHandler';
import { OperationType } from '../types';
import { DEFAULT_EMPRESA_ID } from '../../tenant';

export class QuoteRepository extends BaseRepository<Quote> {
  protected readonly collectionName = 'quotes';

  public static instance = new QuoteRepository();

  /**
   * Retrieves all quotes filtered by their current status in tenant scope
   */
  public async getQuotesByStatus(empresaId: string = DEFAULT_EMPRESA_ID, status: QuoteStatus, maxCount = 50): Promise<Quote[]> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    try {
      const path = this.getTenantPath(empresaId);
      const q = query(
        collection(db, path), 
        where('status', '==', status),
        orderBy('updatedAt', 'desc'),
        limit(maxCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Quote);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `${this.collectionName}:byStatus:${status}`);
      return [];
    }
  }

  /**
   * Safe check: does a quote exist for the client in tenant scope?
   */
  public async getQuotesForClient(empresaId: string = DEFAULT_EMPRESA_ID, clientId: string): Promise<Quote[]> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    try {
      const path = this.getTenantPath(empresaId);
      const q = query(
        collection(db, path), 
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Quote);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `${this.collectionName}:byClient:${clientId}`);
      return [];
    }
  }
}

export const quoteRepository = QuoteRepository.instance;
