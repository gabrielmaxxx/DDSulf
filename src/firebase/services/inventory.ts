import { 
  getDocument,
  createDocument,
  updateExistingDocument, 
  addDocument,
  queryDocuments, 
  subscribeCollection,
  executeBatchWrite
} from '../firestore';
import { Product, StockMovement } from '@/types';

const PRODUCTS_PATH = 'products';
const MOVEMENTS_PATH = 'stock_movements';

/**
 * Save or update product catalogue items
 */
export async function saveProduct(id: string, product: Omit<Product, 'id' | 'updatedAt'>): Promise<void> {
  await createDocument<Product>(PRODUCTS_PATH, id, product);
}

/**
 * Fetch a single product specifications
 */
export async function getProduct(id: string): Promise<Product | null> {
  return await getDocument<Product>(PRODUCTS_PATH, id);
}

/**
 * Fetch entire catalog list
 */
export async function getAllProducts(): Promise<Product[]> {
  return await queryDocuments<Product>(PRODUCTS_PATH, {
    orderByField: 'name',
    orderDirection: 'asc'
  });
}

/**
 * Live stream of database chemical catalog
 */
export function listenToProducts(onUpdate: (products: Product[]) => void): () => void {
  return subscribeCollection<Product>(PRODUCTS_PATH, {
    orderByField: 'name',
    orderDirection: 'asc'
  }, onUpdate);
}

/**
 * Registers stock flow movement, performing atomic operations to adjust available quantity
 */
export async function registerStockMovement(
  movement: Omit<StockMovement, 'id' | 'createdAt'>
): Promise<void> {
  const product = await getProduct(movement.productId);
  if (!product) {
    throw new Error(`[DDSulf Inventory] Error: Product ID ${movement.productId} not found.`);
  }

  // Calculate new physical inventory balance
  let newQty = product.quantityAvailable;
  if (movement.type === 'Entrada') {
    newQty += movement.quantity;
  } else {
    newQty -= movement.quantity;
    if (newQty < 0) {
      console.warn(`[DDSulf Inventory] Alert: Product ${product.name} is in negative units (${newQty})`);
    }
  }

  // Define unique movement ID
  const movementId = `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Mutate product stock level and movement ledger atomically using batch write
  await executeBatchWrite([
    {
      type: 'create',
      path: MOVEMENTS_PATH,
      id: movementId,
      data: movement
    },
    {
      type: 'update',
      path: PRODUCTS_PATH,
      id: movement.productId,
      data: { quantityAvailable: newQty }
    }
  ]);
}

/**
 * Retrieve logs for chemical or mechanical usage movements
 */
export async function getStockMovements(productId?: string): Promise<StockMovement[]> {
  const queryOps = productId ? {
    filters: [{ field: 'productId', operator: '==', value: productId }],
    orderByField: 'createdAt',
    orderDirection: 'desc'
  } : {
    orderByField: 'createdAt',
    orderDirection: 'desc'
  };

  return await queryDocuments<StockMovement>(MOVEMENTS_PATH, queryOps as any);
}
