/**
 * Multi-Document Atomic Transactions & Operational Integrity Actions
 */

import { runTransaction, doc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../config';
import { handleFirestoreError } from '../utils/errorHandler';
import { OperationType } from '../types';
import { ChemicalConsumption } from '../types/enterprise';

export interface FinalizeSessionArgs {
  serviceId: string;
  quoteId: string;
  consumptions: ChemicalConsumption[];
  uId: string;
  notes?: string;
  laborCost?: number;
  displacementCost?: number;
}

/**
 * Executes service finishing transaction atomically committing:
 * 1. Lowers remaining product stock by consumption volume
 * 2. Creates detailed stock movement audit traces for each item
 * 3. Promotes service status to 'Finalizado'
 * 4. Adds operational and margin costs to our ledgers
 */
export async function runFinalizeServiceTransaction(args: FinalizeSessionArgs): Promise<boolean> {
  const { serviceId, quoteId, consumptions, uId, notes = '', laborCost = 150, displacementCost = 50 } = args;

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Verify existence of the primary service execution
      const serviceRef = doc(db, 'services', serviceId);
      const serviceSnap = await transaction.get(serviceRef);
      if (!serviceSnap.exists()) {
        throw new Error(`[Transaction Fails] Target Service ${serviceId} could not be located.`);
      }

      const serviceData = serviceSnap.data();
      if (serviceData.status === 'Finalizado') {
        throw new Error(`[Transaction Fails] Service ${serviceId} has already been finalized.`);
      }

      // 2. Adjust Product stock levels and record details
      for (const item of consumptions) {
        const productRef = doc(db, 'products', item.productId);
        const productSnap = await transaction.get(productRef);
        
        if (!productSnap.exists()) {
          throw new Error(`[Transaction Fails] Product ${item.productId} (${item.productName}) is missing in dynamic stock catalog.`);
        }

        const currentStock = productSnap.data().quantityAvailable;
        if (currentStock < item.quantityUsed) {
          throw new Error(`[Transaction Fails] Insufficient stock for ${item.productName}. Requested: ${item.quantityUsed}, Available: ${currentStock}`);
        }

        // Adjust stock balance
        transaction.update(productRef, {
          quantityAvailable: increment(-item.quantityUsed),
          updatedAt: serverTimestamp()
        });

        // Write movement audit log with deterministic ID to prevent duplicate entry
        const movementId = `mvt_${serviceId}_${item.productId}`;
        const movementRef = doc(db, 'stock_movements', movementId);
        transaction.set(movementRef, {
          id: movementId,
          productId: item.productId,
          type: 'Saída',
          quantity: item.quantityUsed,
          relatedServiceId: serviceId,
          responsibleUser: uId,
          createdAt: serverTimestamp()
        });
      }

      let totalChemicalCost = 0;
      // Calculate chemicals costs for our metrics ledger
      for (const item of consumptions) {
        const productRef = doc(db, 'products', item.productId);
        const productSnap = await transaction.get(productRef);
        if (productSnap.exists()) {
          const uCost = productSnap.data().unitCost || 0;
          totalChemicalCost += uCost * item.quantityUsed;
        }
      }

      // 3. Complete service details
      transaction.update(serviceRef, {
        status: 'Finalizado',
        actualConsumption: consumptions,
        actualCost: totalChemicalCost + laborCost + displacementCost,
        operationalNotes: notes,
        updatedAt: serverTimestamp()
      });

      // 4. Update the parent Quote status
      const quoteRef = doc(db, 'quotes', quoteId);
      transaction.update(quoteRef, {
        status: 'Executado',
        updatedAt: serverTimestamp()
      });

      // 5. Create analytical metrics expense automatically
      const costId = `cost_${serviceId}`;
      const costRef = doc(db, 'financial_costs', costId);
      transaction.set(costRef, {
        id: costId,
        category: 'Operacional',
        subcategory: 'Insumos e Mão de Obra',
        amount: Math.round((totalChemicalCost + laborCost + displacementCost) * 100) / 100,
        relatedServiceId: serviceId,
        createdBy: uId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    console.log(`%c⚡ Transaction successfully matched, service complete: ${serviceId}`, 'color: #10b981;');
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `finalize_service:${serviceId}`);
    return false;
  }
}
