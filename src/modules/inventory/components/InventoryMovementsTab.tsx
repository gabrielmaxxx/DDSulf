import { Card } from '@/components/ui/card';
import { History } from 'lucide-react';

interface InventoryMovementsTabProps {
  movements: any[];
  products: any[];
}

export function InventoryMovementsTab({
  movements,
  products,
}: InventoryMovementsTabProps) {
  return (
    <div className="space-y-4 text-left">
      <Card className="p-6 border-slate-200">
        <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
          <History className="size-5 text-[#1B3A2D]" /> Log de Movimentações (Timeline Unificada)
        </h3>
        <p className="text-slate-500 text-xs mt-1">
          Rastreabilidade completa de todas as baixas e entradas de campo.
        </p>

        {movements.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Não há registros de movimentações locais cadastrados.
          </div>
        ) : (
          <div className="mt-6 border-l border-slate-200 pl-4 space-y-6">
            {movements
              .slice()
              .reverse()
              .map((m, idx) => {
                const prod = products.find((p) => p.id === m.productId);
                const formattedDate = new Date(m.date).toLocaleDateString('pt-BR');

                return (
                  <div key={m.id || idx} className="relative pl-6">
                    {/* Dot */}
                    <span
                      className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                        m.type === 'entrada' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {formattedDate}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            m.type === 'entrada'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          {m.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {prod ? prod.name : 'Insumo Removido'}:{' '}
                        <span className="font-black text-slate-950 font-mono">
                          {m.type === 'entrada' ? '+' : '-'}
                          {m.quantity} {prod?.unit || 'un'}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        Motivo: {m.reason || 'Sincronização'}
                      </p>
                      {m.lot && (
                        <p className="text-[10px] font-mono font-bold text-slate-400">
                          Lote: {m.lot}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </Card>
    </div>
  );
}
