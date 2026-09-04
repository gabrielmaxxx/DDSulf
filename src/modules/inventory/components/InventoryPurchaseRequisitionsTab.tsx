import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface InventoryPurchaseRequisitionsTabProps {
  purchases: any[];
  products: any[];
  updatePurchaseStatus: (id: string, status: 'Pendente' | 'Solicitado' | 'Comprado' | 'Recebido') => void;
  updateInventoryProduct: (id: string, partial: any) => void;
  addInventoryMovement: (mov: any) => void;
}

export function InventoryPurchaseRequisitionsTab({
  purchases,
  products,
  updatePurchaseStatus,
  updateInventoryProduct,
  addInventoryMovement,
}: InventoryPurchaseRequisitionsTabProps) {
  return (
    <div className="space-y-4 text-left">
      <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 font-display">
            Requisições de Reposição Planejada
          </h3>
          <p className="text-slate-400 text-xs">
            Criação automatizada de requisições conforme mínimo de segurança exigido.
          </p>
        </div>

        {(purchases || []).length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Nenhuma requisição de compra atualmente pendente.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['Pendente', 'Solicitado', 'Comprado', 'Recebido'].map((col) => {
              const group = (purchases || []).filter((p) => p.status === col);
              return (
                <div
                  key={col}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-200/50 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {col}
                    </span>
                    <span className="bg-slate-200 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-full">
                      {group.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.map((req) => {
                      const pObj = products.find((p) => p.id === req.productId);
                      return (
                        <div
                          key={req.id}
                          className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5 text-xs text-slate-700 font-semibold text-left"
                        >
                          <h4 className="font-bold text-slate-900 leading-tight">
                            {req.productName}
                          </h4>
                          <div className="space-y-1 text-[10px] text-slate-500 font-mono font-medium">
                            <p>Estoque Atual: {req.currentStock}</p>
                            <p>Segurança Mínima: {req.minStock}</p>
                            <p className="text-slate-900 font-bold">
                              Comprar ideal: {req.quantityToBuy} {pObj?.unit}
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              const nextMap: Record<
                                string,
                                'Solicitado' | 'Comprado' | 'Recebido' | any
                              > = {
                                Pendente: 'Solicitado',
                                Solicitado: 'Comprado',
                                Comprado: 'Recebido',
                              };
                              const nextStatus = nextMap[req.status];
                              if (nextStatus) {
                                updatePurchaseStatus(req.id, nextStatus);
                                if (nextStatus === 'Recebido') {
                                  updateInventoryProduct(req.productId, {
                                    quantity: (pObj?.quantity || 0) + req.quantityToBuy,
                                  });
                                  addInventoryMovement({
                                    id: `mov-${Math.random().toString(36).substring(2, 11)}`,
                                    date: new Date().toISOString().split('T')[0],
                                    productId: req.productId,
                                    type: 'entrada',
                                    quantity: req.quantityToBuy,
                                    reason: `Conclusão de recebimento de cotação de compra #${req.id}`,
                                  });
                                }
                                toast.success(`Requisição atualizada para: ${nextStatus}`);
                              }
                            }}
                            className="w-full h-8 bg-slate-100 hover:bg-[#D8EDE3] text-[#1B3A2D] font-extrabold text-[9px] uppercase tracking-wider rounded-lg border border-slate-200 cursor-pointer"
                          >
                            Avançar Fluxo &rarr;
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
