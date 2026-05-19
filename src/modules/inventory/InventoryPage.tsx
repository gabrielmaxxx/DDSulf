import { 
  Search, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  History, 
  Plus, 
  SearchX,
  Filter,
  ArrowRightLeft,
  Loader2,
  Package2,
  BoxSelect
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventory } from './hooks/useInventory';
import { ProductCard } from './components/InventoryComponents';
import { PageHeader, ViewContainer } from '../shared/components/Layout';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function InventoryPage() {
  const { products, loading, search, setSearch, alerts, refresh } = useInventory();
  const [filter, setFilter] = useState<'all' | 'alert'>('all');

  const displayedProducts = filter === 'alert' ? alerts : products;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-6">
        <div className="relative">
          <Loader2 className="size-12 animate-spin text-black" />
          <Package2 className="size-5 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">Sincronizando Estoque Operacional...</p>
      </div>
    );
  }

  return (
    <ViewContainer>
      <PageHeader 
        title="Estoque Técnico" 
        description="Controle de insumos e consumo operacional."
      >
        <Button variant="outline" className="h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border-[#E5E7EB] hover:bg-black hover:text-white transition-all">
          <History className="size-4 mr-2" /> Movimentações
        </Button>
        <Button className="h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-black text-white shadow-xl hover:opacity-90 active:scale-95 transition-all">
          <Plus className="size-4 mr-2" /> Novo Insumo
        </Button>
      </PageHeader>

      {/* Top Indicators Overlaying as Interactive Filters */}
      <div className="grid gap-6 md:grid-cols-4">
         <button 
           onClick={() => setFilter('all')}
           className={cn(
             "p-6 rounded-[32px] border text-left transition-all space-y-4",
             filter === 'all' ? "bg-black border-black text-white shadow-xl" : "bg-white border-[#E5E7EB] text-black hover:border-black"
           )}
         >
            <div className={cn("size-10 rounded-2xl flex items-center justify-center", filter === 'all' ? "bg-white/20" : "bg-gray-100")}>
               <BoxSelect className="size-5" />
            </div>
            <div className="space-y-1">
               <p className={cn("text-[10px] font-black uppercase tracking-widest", filter === 'all' ? "text-white/50" : "text-gray-400")}>Total de Itens</p>
               <p className="text-2xl font-black">{products.length}</p>
            </div>
         </button>

         <button 
           onClick={() => setFilter('alert')}
           className={cn(
             "p-6 rounded-[32px] border text-left transition-all space-y-4",
             filter === 'alert' ? "bg-rose-600 border-rose-600 text-white shadow-xl shadow-rose-100" : "bg-rose-50 border-rose-100 text-rose-600 hover:border-rose-300"
           )}
         >
            <div className={cn("size-10 rounded-2xl flex items-center justify-center", filter === 'alert' ? "bg-white/20" : "bg-rose-100")}>
               <AlertTriangle className={cn("size-5", filter === 'alert' ? "text-white" : "text-rose-600")} />
            </div>
            <div className="space-y-1">
               <p className={cn("text-[10px] font-black uppercase tracking-widest", filter === 'alert' ? "text-white/50" : "text-rose-400")}>Estoque Crítico</p>
               <p className="text-2xl font-black">{alerts.length}</p>
            </div>
         </button>

         <div className="p-6 rounded-[32px] border border-[#E5E7EB] bg-white text-black space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
               <div className="size-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="size-5 text-emerald-600" />
               </div>
               <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px]">Giro de Estoque</Badge>
            </div>
            <div className="flex items-end justify-between">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Consumo em Maio</p>
                  <p className="text-2xl font-black">R$ 1.840,00</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="size-3" /> 8% vs anterior
                  </p>
                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Baseado em custos reais</p>
               </div>
            </div>
         </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por insumo, categoria ou fabricante..."
              className="h-14 pl-12 rounded-2xl border-[#E5E7EB] bg-white shadow-sm focus-visible:ring-black font-medium"
            />
          </div>
          <Button variant="outline" className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest border-[#E5E7EB]">
             <Filter className="size-4 mr-2 text-gray-400" /> Filtros Avançados
          </Button>
        </div>

        {displayedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
             <div className="size-20 bg-white rounded-3xl shadow-sm flex items-center justify-center">
                <SearchX className="size-10 text-gray-200" />
             </div>
             <div className="space-y-2 max-w-xs">
                <p className="text-lg font-black text-black">Nenhum insumo encontrado</p>
                <p className="text-sm text-gray-400 font-medium">Tente ajustar sua busca ou verifique se o item está cadastrado.</p>
             </div>
             <Button className="h-12 bg-black text-white rounded-xl px-8 font-black uppercase text-[10px] tracking-widest">Cadastrar Insumo</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {displayedProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} onUpdate={refresh} />
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="size-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600">
               <ArrowRightLeft className="size-7" />
            </div>
            <div className="space-y-1">
               <h3 className="text-lg font-black text-indigo-900 tracking-tightest">Integração com Calculadora</h3>
               <p className="text-xs text-indigo-700 font-medium max-w-sm">Os custos unitários deste estoque são utilizados automaticamente para precificar seus orçamentos em tempo real.</p>
            </div>
         </div>
         <Button className="h-12 bg-indigo-600 text-white rounded-xl px-8 font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
           Atualizar Custos Unitários
         </Button>
      </div>
    </ViewContainer>
  );
}
