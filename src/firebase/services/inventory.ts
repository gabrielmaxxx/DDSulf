import { 
  getDocument,
  createDocument,
  queryDocuments, 
  subscribeCollection,
  executeBatchWrite
} from '../firestore';
import { Product, StockMovement } from '@/types';
import { DEFAULT_EMPRESA_ID } from '../../tenant';

const PRODUCTS_PATH = 'products';
const MOVEMENTS_PATH = 'stock_movements';

/**
 * Save or update product catalogue items in tenant scope
 */
export async function saveProduct(empresaId: string = DEFAULT_EMPRESA_ID, id: string, product: Omit<Product, 'id' | 'updatedAt'>): Promise<void> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  await createDocument<Product>(PRODUCTS_PATH, id, product, empresaId);
}

/**
 * Fetch a single product specifications in tenant scope
 */
export async function getProduct(empresaId: string = DEFAULT_EMPRESA_ID, id: string): Promise<Product | null> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await getDocument<Product>(PRODUCTS_PATH, id, empresaId);
}

/**
 * Fetch entire catalog list in tenant scope
 */
export async function getAllProducts(empresaId: string = DEFAULT_EMPRESA_ID): Promise<Product[]> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await queryDocuments<Product>(PRODUCTS_PATH, {
    orderByField: 'name',
    orderDirection: 'asc'
  }, empresaId);
}

/**
 * Live stream of database chemical catalog in tenant scope
 */
export function listenToProducts(empresaId: string = DEFAULT_EMPRESA_ID, onUpdate: (products: Product[]) => void): () => void {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return subscribeCollection<Product>(PRODUCTS_PATH, {
    orderByField: 'name',
    orderDirection: 'asc'
  }, onUpdate, undefined, empresaId);
}

/**
 * Registers stock flow movement, performing atomic operations to adjust available quantity in tenant scope
 */
export async function registerStockMovement(
  empresaId: string = DEFAULT_EMPRESA_ID,
  movement: Omit<StockMovement, 'id' | 'createdAt'>
): Promise<void> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  const product = await getProduct(empresaId, movement.productId);
  if (!product) {
    throw new Error(`[DDSulf Inventory] Error: Product ID ${movement.productId} not found.`);
  }

  let newQty = product.quantityAvailable;
  if (movement.type === 'Entrada') {
    newQty += movement.quantity;
  } else {
    newQty -= movement.quantity;
    if (newQty < 0) {
      console.warn(`[DDSulf Inventory] Alert: Product ${product.name} is in negative units (${newQty})`);
    }
  }

  const movementId = `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

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
  ], empresaId);
}

/**
 * Retrieve logs for chemical or mechanical usage movements in tenant scope
 */
export async function getStockMovements(empresaId: string = DEFAULT_EMPRESA_ID, productId?: string): Promise<StockMovement[]> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  const queryOps = productId ? {
    filters: [{ field: 'productId', operator: '==', value: productId }],
    orderByField: 'createdAt',
    orderDirection: 'desc'
  } : {
    orderByField: 'createdAt',
    orderDirection: 'desc'
  };

  return await queryDocuments<StockMovement>(MOVEMENTS_PATH, queryOps as any, empresaId);
}
