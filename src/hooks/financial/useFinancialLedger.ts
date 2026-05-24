import { useFinancialLedger as useFirebaseFinancialLedger } from '@/firebase/hooks/useFinancialLedger';

export function useFinancialLedger() {
  const data = useFirebaseFinancialLedger();
  return {
    revenueTotal: data.revenueTotal,
    costsTotal: data.costsTotal,
    netMarginValue: data.netMarginValue,
    marginPercent: data.marginPercent,
    ebitda: data.ebitda,
    costs: data.costs,
    revenues: data.revenues,
    isLoading: data.loading,
    error: data.error,
    refresh: data.refresh,
    registerCost: data.registerCost,
    registerRevenue: data.registerRevenue
  };
}

export default useFinancialLedger;
