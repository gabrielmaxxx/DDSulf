import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  doc, 
  runTransaction
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Product, StockMovement } from '@/types/database';
import { getTenantCollectionPath, DEFAULT_EMPRESA_ID } from '@/tenant';

export const inventoryService = {
  async getProducts(arg1?: any): Promise<Product[]> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    const empresaId = typeof arg1 === 'string' ? arg1 : DEFAULT_EMPRESA_ID;

    try {
      const path = getTenantCollectionPath(empresaId, 'products');
      const q = query(collection(db, path), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const serverProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
      localStorage.setItem('inventory_products', JSON.stringify(serverProducts));
      return serverProducts;
    } catch (error) {
      console.warn("Operating offline: retrieving products from local storage...", error);
      const localProducts = JSON.parse(localStorage.getItem('inventory_products') || '[]');
      if (localProducts.length === 0) {
        const seedProducts: Product[] = [
          {
            id: 'prod_1',
            name: 'Gel Inseticida Baratox 30g',
            category: 'Químicos',
            unit: 'Bisnaga',
            unitCost: 15.00,
            quantityAvailable: 45,
            minimumStock: 15,
            updatedAt: new Date().toISOString()
          },
          {
            id: 'prod_2',
            name: 'Raticida Granulado Malatol 25g',
            category: 'Químicos',
            unit: 'Pacote',
            unitCost: 2.50,
            quantityAvailable: 110,
            minimumStock: 30,
            updatedAt: new Date().toISOString()
          },
          {
            id: 'prod_3',
            name: 'Luvas Nitrílicas Resistentes G',
            category: 'EPIs',
            unit: 'Par',
            unitCost: 4.00,
            quantityAvailable: 180,
            minimumStock: 50,
            updatedAt: new Date().toISOString()
          },
          {
            id: 'prod_4',
            name: 'Pulverizador de Compressão 5L Guarany',
            category: 'Equipamentos',
            unit: 'Unidade',
            unitCost: 180.00,
            quantityAvailable: 8,
            minimumStock: 2,
            updatedAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('inventory_products', JSON.stringify(seedProducts));
        return seedProducts;
      }
      return localProducts;
    }
  },

  async addProduct(arg1: any, arg2?: any): Promise<any> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    let empresaId = DEFAULT_EMPRESA_ID;
    let product: Omit<Product, 'id'>;

    if (typeof arg1 === 'string') {
      empresaId = arg1;
      product = arg2;
    } else {
      product = arg1;
    }

    try {
      const path = getTenantCollectionPath(empresaId, 'products');
      return await addDoc(collection(db, path), {
        ...product,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn("Operating offline: saving product to local storage...", error);
      const localProducts = JSON.parse(localStorage.getItem('inventory_products') || '[]');
      const newProduct = {
        id: 'local_prod_' + Date.now(),
        ...product,
        updatedAt: new Date().toISOString()
      };
      localProducts.push(newProduct);
      localStorage.setItem('inventory_products', JSON.stringify(localProducts));
      return { id: newProduct.id } as any;
    }
  },

  async updateStock(arg1: string, arg2: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any): Promise<any> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    let empresaId = DEFAULT_EMPRESA_ID;
    let productId: string;
    let quantityChange: number;
    let type: 'Entrada' | 'Saída';
    let userId: string;
    let serviceId: string | undefined;

    if (typeof arg3 === 'number') {
      empresaId = arg1;
      productId = arg2;
      quantityChange = arg3;
      type = arg4;
      userId = arg5;
      serviceId = arg6;
    } else {
      productId = arg1;
      quantityChange = arg2;
      type = arg3;
      userId = arg4;
      serviceId = arg5;
    }

    try {
      const productsPath = getTenantCollectionPath(empresaId, 'products');
      const movementsPath = getTenantCollectionPath(empresaId, 'stock_movements');
      const productRef = doc(db, productsPath, productId);
      const movementRef = collection(db, movementsPath);

      return await runTransaction(db, async (transaction) => {
        const productSnap = await transaction.get(productRef);
        if (!productSnap.exists()) throw new Error("Produto não encontrado");

        const currentStock = productSnap.data().quantityAvailable || 0;
        const newStock = type === 'Entrada' ? currentStock + quantityChange : currentStock - quantityChange;

        if (newStock < 0) throw new Error("Estoque insuficiente");

        transaction.update(productRef, {
          quantityAvailable: newStock,
          updatedAt: new Date().toISOString()
        });

        const movementData: Omit<StockMovement, 'id'> = {
          productId,
          type,
          quantity: quantityChange,
          responsibleUser: userId,
          relatedServiceId: serviceId,
          createdAt: new Date().toISOString()
        };
        
        const newMovementRef = doc(movementRef);
        transaction.set(newMovementRef, movementData);
      });
    } catch (error) {
      console.warn("Operating offline: updating stock in local storage...", error);
      
      const localProducts = JSON.parse(localStorage.getItem('inventory_products') || '[]');
      const productIdx = localProducts.findIndex((p: any) => p.id === productId);
      if (productIdx === -1) throw new Error("Produto não encontrado localmente");

      const currentStock = localProducts[productIdx].quantityAvailable || 0;
      const newStock = type === 'Entrada' ? currentStock + quantityChange : currentStock - quantityChange;

      if (newStock < 0) throw new Error("Estoque insuficiente");

      localProducts[productIdx].quantityAvailable = newStock;
      localProducts[productIdx].updatedAt = new Date().toISOString();
      localStorage.setItem('inventory_products', JSON.stringify(localProducts));

      const localMovements = JSON.parse(localStorage.getItem('stock_movements') || '[]');
      const newMovement = {
        id: 'local_mov_' + Date.now(),
        productId,
        type,
        quantity: quantityChange,
        responsibleUser: userId,
        relatedServiceId: serviceId,
        createdAt: new Date().toISOString()
      };
      localMovements.unshift(newMovement);
      localStorage.setItem('stock_movements', JSON.stringify(localMovements));
    }
  },

  async getMovements(arg1?: any, arg2?: any): Promise<StockMovement[]> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    let empresaId = DEFAULT_EMPRESA_ID;
    let productId: string | undefined;

    if (typeof arg2 === 'string' || (typeof arg1 === 'string' && arg1.startsWith('empresas/'))) {
      empresaId = arg1;
      productId = arg2;
    } else if (typeof arg1 === 'string') {
      productId = arg1;
    }

    try {
      const movementsPath = getTenantCollectionPath(empresaId, 'stock_movements');
      let q = query(collection(db, movementsPath), orderBy('createdAt', 'desc'));
      if (productId) {
        q = query(q, where('productId', '==', productId));
      }
      const snapshot = await getDocs(q);
      const serverMovements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as StockMovement);
      localStorage.setItem('stock_movements', JSON.stringify(serverMovements));
      return serverMovements;
    } catch (error) {
      console.warn("Operating offline: retrieving movements from local storage...", error);
      let localMovements = JSON.parse(localStorage.getItem('stock_movements') || '[]');
      if (productId) {
        localMovements = localMovements.filter((m: any) => m.productId === productId);
      }
      if (localMovements.length === 0) {
        return [
          {
            id: 'mov_1',
            productId: 'prod_1',
            type: 'Saída',
            quantity: 2,
            responsibleUser: 'root',
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            relatedServiceId: 'service_1'
          },
          {
            id: 'mov_2',
            productId: 'prod_2',
            type: 'Entrada',
            quantity: 50,
            responsibleUser: 'root',
            createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
          }
        ] as StockMovement[];
      }
      return localMovements;
    }
  }
};
