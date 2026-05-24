import { useProductInventory as useFirebaseProductInventory } from '@/firebase/hooks/useProductInventory';

export function useProductInventory() {
  const data = useFirebaseProductInventory();
  return {
    products: data.products,
    understockAlerts: data.understockAlerts,
    isLoading: data.loading,
    error: data.error,
    refresh: data.refresh,
    registerMovement: data.registerMovement,
    createProduct: data.createProduct
  };
}

export default useProductInventory;
