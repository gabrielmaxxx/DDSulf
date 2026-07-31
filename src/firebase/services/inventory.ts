import { 
  getDocument, 
  createDocument, 
  queryDocuments, 
  subscribeCollection, 
  executeBatchWrite 
} from '../firestore';
import { Product, StockMovement } from '@/types';

const PRODUCTS_PATH = 'products';
const MOVEMENTS_PATH = 'stock_movements';

/**
 * Save or update product catalogue items in tenant scope
 */
export async function saveProduct(empresaId: string | undefined, id: string, product?: Omit<Product, 'id' | 'updatedAt'>): Promise<void> {
  const targetId = product ? id : (empresaId as string);
  const targetPayload = product || (id as any);
  const targetEmpresa = product ? empresaId : undefined;
  await createDocument<Product>(PRODUCTS_PATH, targetId, targetPayload, targetEmpresa);
}

/**
 * Fetch a single product specifications in tenant scope
 */
export async function getProduct(empresaId: string | undefined, id?: string): Promise<Product | null> {
  const targetId = id || (empresaId as string);
  const targetEmpresa = id ? empresaId : undefined;
  return await getDocument<Product>(PRODUCTS_PATH, targetId, targetEmpresa);
}

/**
 * Fetch entire catalog list in tenant scope
 */
export async function getAllProducts(empresaId?: string): Promise<Product[]> {
  return await queryDocuments<Product>(PRODUCTS_PATH, {
    orderByField: 'name',
    orderDirection: 'asc'
  }, empresaId);
}

/**
 * Live stream of database chemical catalog in tenant scope
 */
export function listenToProducts(empresaId: string | undefined, onUpdate: (products: Product[]) => void): () => void;
export function listenToProducts(onUpdate: (products: Product[]) => void): () => void;
export function listenToProducts(arg1: any, arg2?: any): () => void {
  const empresaId = typeof arg1 === 'string' ? arg1 : undefined;
  const onUpdate = typeof arg1 === 'function' ? arg1 : arg2;
  return subscribeCollection<Product>(PRODUCTS_PATH, {
    orderByField: 'name',
    orderDirection: 'asc'
  }, onUpdate, undefined, empresaId);
}

/**
 * Registers stock flow movement, performing atomic operations to adjust available quantity in tenant scope
 */
export async function registerStockMovement(
  empresaId: string | undefined,
  movement?: Omit<StockMovement, 'id' | 'createdAt'>
): Promise<void> {
  const targetMovement = movement || (empresaId as any);
  const targetEmpresa = movement ? empresaId : undefined;

  const product = await getProduct(targetEmpresa, targetMovement.productId);
  if (!product) {
    throw new Error(`[PestFlow Inventory] Error: Product ID ${targetMovement.productId} not found.`);
  }

  let newQty = product.quantityAvailable;
  if (targetMovement.type === 'Entrada') {
    newQty += targetMovement.quantity;
  } else {
    newQty -= targetMovement.quantity;
    if (newQty < 0) {
      console.warn(`[PestFlow Inventory] Alert: Product ${product.name} is in negative units (${newQty})`);
    }
  }

  const movementId = `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await executeBatchWrite([
    {
      type: 'create',
      path: MOVEMENTS_PATH,
      id: movementId,
      data: targetMovement
    },
    {
      type: 'update',
      path: PRODUCTS_PATH,
      id: targetMovement.productId,
      data: { quantityAvailable: newQty }
    }
  ], targetEmpresa);
}

/**
 * Retrieve logs for chemical or mechanical usage movements in tenant scope
 */
export async function getStockMovements(empresaId?: string, productId?: string): Promise<StockMovement[]> {
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
