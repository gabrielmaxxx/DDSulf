import { useState } from 'react';
import { useAuth } from '@/auth/hooks/useAuth';
import { 
  Package, 
  AlertCircle, 
  Plus, 
  Minus, 
  MoreVertical, 
  TrendingUp, 
  TrendingDown,
  Activity,
  ArrowRightLeft,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Product } from '@/types/database';
import { cn } from '@/lib/utils';
import { inventoryService } from '../services/inventoryService';
import { toast } from 'sonner';

export function ProductCard({ product, onUpdate }: { product: Product, onUpdate: () => void }) {
  const isLowStock = product.quantityAvailable <= product.minimumStock;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E5E7EB] rounded-[32px] overflow-hidden shadow-sm hover:border-black transition-all group flex flex-col"
    >
      <div className="p-8 border-b border-[#E5E7EB] flex justify-between items-start gap-4">
        <div className="space-y-1">
          <Badge className="bg-[#F3F4F6] text-[#6B7280] text-[9px] font-black uppercase tracking-widest border-none px-3 py-1 rounded-lg">
            {product.category}
          </Badge>
          <h3 className="text-xl font-black text-black tracking-tightest leading-tight">{product.name}</h3>
          {product.manufacturer && (
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.manufacturer}</p>
          )}
        </div>
        <div className={cn(
          "p-4 rounded-[20px] transition-colors shadow-sm",
          isLowStock ? "bg-rose-50 text-rose-600" : "bg-gray-50 text-black group-hover:bg-black group-hover:text-white"
        )}>
          <Package className="size-6" />
        </div>
      </div>

      <div className="p-8 space-y-6 flex-1">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Estoque Disponível</span>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-4xl font-black tracking-tighter",
                isLowStock ? "text-rose-600" : "text-black"
              )}>
                {product.quantityAvailable}
              </span>
              <span className="text-lg font-bold text-gray-400">{product.unit}</span>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mínimo</span>
            <p className="text-sm font-black text-black">{product.minimumStock} {product.unit}</p>
          </div>
        </div>

        {isLowStock && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-2xl">
             <AlertCircle className="size-4 text-rose-600" />
             <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">Abaixo do estoque crítico</span>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <MovementDialog product={product} type="Entrada" onSuccess={onUpdate} />
          <MovementDialog product={product} type="Saída" onSuccess={onUpdate} />
        </div>
      </div>
      
      <div className="px-8 py-4 bg-gray-50/50 border-t border-[#F3F4F6] flex items-center justify-between">
         <div className="flex items-center gap-2">
            <TrendingUp className="size-3 text-[#10B981]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Giro Alto</span>
         </div>
         <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Ref: #{product.id?.slice(-4)}</span>
      </div>
    </motion.div>
  );
}

function MovementDialog({ product, type, onSuccess }: { product: Product, type: 'Entrada' | 'Saída', onSuccess: () => void }) {
  const { empresaId, user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleUpdate = async () => {
    if (quantity <= 0 || !empresaId) return;
    setLoading(true);
    try {
      await inventoryService.updateStock(empresaId, product.id!, quantity, type, user?.uid || 'sys-user');
      toast.success(`${type} de ${quantity}${product.unit} registrada!`);
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar estoque');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button 
          variant="outline" 
          className={cn(
            "flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-[#E5E7EB]",
            type === 'Entrada' ? "hover:bg-emerald-50 hover:text-emerald-700" : "hover:bg-rose-50 hover:text-rose-700"
          )}
        >
          {type === 'Entrada' ? <Plus className="size-3 mr-2" /> : <Minus className="size-3 mr-2" />}
          {type}
        </Button>
      } />
      <DialogContent className="rounded-[32px] border-none shadow-2xl p-8 max-w-sm">
        <DialogHeader className="space-y-1 mb-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">{type} de Estoque</div>
          <DialogTitle className="text-2xl font-black text-black">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Quantidade ({product.unit})</Label>
            <div className="flex items-center gap-4">
               <Button 
                variant="outline" 
                size="icon" 
                className="size-12 rounded-2xl border-[#E5E7EB]"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
               >
                 <Minus className="size-4" />
               </Button>
               <Input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="h-12 text-center text-xl font-black rounded-2xl border-[#E5E7EB] focus-visible:ring-black"
               />
               <Button 
                variant="outline" 
                size="icon" 
                className="size-12 rounded-2xl border-[#E5E7EB]"
                onClick={() => setQuantity(prev => prev + 1)}
               >
                 <Plus className="size-4" />
               </Button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Impacto no Estoque</span>
             <span className={cn(
               "text-sm font-black",
               type === 'Entrada' ? "text-emerald-600" : "text-rose-600"
             )}>
               {product.quantityAvailable} → {type === 'Entrada' ? product.quantityAvailable + quantity : product.quantityAvailable - quantity} {product.unit}
             </span>
          </div>

          <Button 
            disabled={loading}
            onClick={handleUpdate}
            className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin size-4" /> : `Confirmar ${type}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
