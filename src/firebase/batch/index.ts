/**
 * Bulk Processing & Consolidated Batch Services
 */

import { writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config';
import { handleFirestoreError } from '../utils/errorHandler';
import { OperationType } from '../types';

export interface BatchItemUpdate {
  collection: string;
  id: string;
  data: any;
}

/**
 * Commits a list of standard item writes or updates using optimized Firestore WriteBatch
 */
export async function executeBulkWrites(updates: BatchItemUpdate[]): Promise<boolean> {
  if (!updates || updates.length === 0) return true;

  try {
    const batch = writeBatch(db);

    for (const item of updates) {
      const docRef = doc(db, item.collection, item.id);
      
      const payload = {
        ...item.data,
        updatedAt: serverTimestamp()
      };

      // Merge ensures we do not stomp other valid properties on existing schemas
      batch.set(docRef, payload, { merge: true });
    }

    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `bulk_write_batch_${updates.length}`);
    return false;
  }
}

/**
 * Bulk setup of technical Procedural Database (POPs) for faster bootstrap
 */
export async function setupBasePOPs(): Promise<void> {
  const list: BatchItemUpdate[] = [
    {
      collection: 'pops',
      id: 'pop_baratas',
      data: {
        title: 'Controle Integrado de Blatelas (Baratas)',
        category: 'Insetos Rasteiros',
        pestType: 'Baratas',
        description: 'Tratamento de baratas residenciais e comerciais utilizando gel atrativo e pulverização focalizada em frestas.',
        epis: ['Respirador facial semi-completo', 'Luvas de nitrilo', 'Óculos panorâmicos de proteção', 'Macacão impermeável'],
        recommendedProducts: ['Gel Blatela Killer', 'Fipronil Pro Spray'],
        checklist: [
          'Preencher ficha de vistoria técnica e identificar focos principais de abrigo.',
          'Isolar ambientes sensíveis ou alimentos descobertos.',
          'Aplicar micro-gotas de gel blatela em dobradiças, reentrâncias de gavetas e caixas de eletricidade.',
          'Efetuar pulverização residual apenas em perímetros externos e ralos operacionais.'
        ]
      }
    },
    {
      collection: 'pops',
      id: 'pop_cupins',
      data: {
        title: 'Descupinização de Estruturas de Madeira Seca',
        category: 'Pragas da Madeira',
        pestType: 'Cupins',
        description: 'Injeção direcionada em focos de madeira e pulverização residual de barreira química.',
        epis: ['Máscara facial completa com filtro químico', 'Luvas de PVC manga longa', 'Botas de segurança', 'Capacete de proteção'],
        recommendedProducts: ['Duraban Termicida Plus', 'Cupinicida Gel Total'],
        checklist: [
          'Inspecionar frestas e perfurações para identificar espécies (madeira seca vs cupim de solo).',
          'Vedar e perfurar pontos cruciais nos marcos de portas e armários em intervalos de 20cm.',
          'Injetar calda termicida sob pressão controlada até saturação.',
          'Instalar barreira química protetora no solo se aplicável ao caso.'
        ]
      }
    }
  ];

  await executeBulkWrites(list);
}
