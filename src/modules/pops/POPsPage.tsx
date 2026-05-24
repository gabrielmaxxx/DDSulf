import { 
  Search, 
  Book, 
  Shield, 
  CheckCircle2, 
  Layers, 
  SearchX,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  Beaker,
  ListChecks,
  Info,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePops } from './hooks/usePops';
import { POP } from '@/types/database';
import { PageHeader, ViewContainer } from '../shared/components/Layout';
import { cn } from '@/lib/utils';
import { KnowledgeWorkspace } from '@/knowledge/components/KnowledgeWorkspace';

export function POPsPage() {
  const [viewMode, setViewMode] = useState<'protocolos' | 'knowledge'>('protocolos');
  const { 
    pops, 
    loading, 
    search, 
    setSearch, 
    selectedCategory, 
    setSelectedCategory,
    categories 
  } = usePops();
  
  const [selectedPop, setSelectedPop] = useState<POP | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-4">
        <div className="size-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Sincronizando Wiki Operacional...</p>
      </div>
    );
  }

  return (
    <ViewContainer>
      {/* View Selector Toggle Toolbar */}
      <div className="flex bg-neutral-100 p-1.5 rounded-2xl mb-8 max-w-lg">
        <button
          onClick={() => setViewMode('protocolos')}
          className={cn(
            "flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 leading-none",
            viewMode === 'protocolos'
              ? "bg-white text-black shadow-sm"
              : "text-neutral-500 hover:text-neutral-900"
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Central de Protocolos</span>
        </button>
        <button
          onClick={() => setViewMode('knowledge')}
          className={cn(
            "flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 leading-none",
            viewMode === 'knowledge'
              ? "bg-white text-black shadow-sm"
              : "text-neutral-500 hover:text-neutral-900"
          )}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Capacitação, Onboarding & IA</span>
          <span className="inline-block size-1.5 bg-purple-600 rounded-full animate-ping" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'knowledge' ? (
          <motion.div
            key="knowledge-workspace-container"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full"
          >
            <KnowledgeWorkspace />
          </motion.div>
        ) : !selectedPop ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <PageHeader 
              title="Central Operacional" 
              description="Padronização técnica e inteligência em campo."
            />

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar por praga, ambiente ou procedimento..."
                  className="h-14 pl-12 rounded-2xl border-[#E5E7EB] bg-white shadow-sm focus-visible:ring-black font-medium"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  <button 
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "px-6 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                    !selectedCategory ? "bg-black text-white shadow-xl" : "bg-white text-gray-400 border border-[#E5E7EB] hover:border-black"
                  )}
                  >
                    Todos
                  </button>
                  {categories.map(cat => (
                    <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-6 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                      selectedCategory === cat ? "bg-black text-white shadow-xl" : "bg-white text-gray-400 border border-[#E5E7EB] hover:border-black"
                    )}
                    >
                      {cat}
                    </button>
                  ))}
              </div>
            </div>

            {pops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                 <div className="p-6 bg-gray-50 rounded-[32px]">
                    <SearchX className="size-12 text-gray-300" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest text-black">Procedimento não encontrado</p>
                    <p className="text-xs text-gray-400 font-medium">Tente buscar por termos mais genéricos ou outra categoria.</p>
                 </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pops.map((pop) => (
                  <div key={pop.id}>
                    <PopCard pop={pop} onClick={() => setSelectedPop(pop)} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <PopDetail pop={selectedPop} onBack={() => setSelectedPop(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </ViewContainer>
  );
}

function PopCard({ pop, onClick }: { pop: POP, onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white border border-[#E5E7EB] rounded-[32px] overflow-hidden shadow-sm flex flex-col group cursor-pointer hover:border-black transition-all"
    >
      <div className="p-8 border-b border-[#E5E7EB] flex justify-between items-start gap-4">
        <div className="space-y-2">
          <Badge className="bg-[#F3F4F6] text-[#6B7280] text-[9px] font-black uppercase tracking-widest border-none px-3 py-1 rounded-lg">{pop.category}</Badge>
          <h3 className="text-xl font-black text-black tracking-tightest group-hover:text-black leading-tight transition-colors">{pop.title}</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-black group-hover:text-white transition-all shadow-sm">
          <ChevronRight className="size-5" />
        </div>
      </div>
      
      <div className="p-8 space-y-6 flex-1">
        <p className="text-sm text-[#6B7280] font-medium line-clamp-2 leading-relaxed">
          {pop.description}
        </p>
        
        <div className="flex items-center gap-6 pt-4 border-t border-[#F3F4F6]">
           <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Checklist</span>
              <span className="text-xs font-black text-black">{pop.checklist.length} itens</span>
           </div>
           <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Risco</span>
              <Badge className={cn(
                "w-fit text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border-none",
                pop.riskLevel === 'Alto' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {pop.riskLevel || 'Normal'}
              </Badge>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function PopDetail({ pop, onBack }: { pop: POP, onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-3 group px-4 py-2 hover:bg-gray-50 rounded-xl transition-all"
      >
        <div className="p-2 bg-white border border-[#E5E7EB] rounded-lg group-hover:border-black transition-colors shadow-sm">
          <ArrowLeft className="size-4" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Voltar para Central</span>
      </button>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">POP #{pop.id?.slice(-4) || 'CORE'}</Badge>
          <Badge className="bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">{pop.category}</Badge>
          {pop.pestType && <Badge className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">{pop.pestType}</Badge>}
        </div>
        <h2 className="text-5xl font-black tracking-tightest leading-none text-black">{pop.title}</h2>
        <p className="text-xl text-[#6B7280] font-medium leading-relaxed max-w-3xl">{pop.description}</p>
      </div>

      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-8 space-y-12">
          {/* Protocols Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-black rounded-xl text-white">
                  <Layers className="size-5" />
               </div>
               <h3 className="text-lg font-black uppercase tracking-[0.2em] text-black">Protocolo de Aplicação</h3>
            </div>
            
            <div className="space-y-6">
              {pop.protocols?.map((protocol, idx) => (
                <div key={idx} className="bg-white border border-[#E5E7EB] p-8 rounded-[32px] shadow-sm space-y-3 relative overflow-hidden group hover:border-black transition-all">
                  <div className="absolute top-0 right-0 p-8 text-5xl font-black opacity-[0.03] text-black pointer-events-none group-hover:opacity-[0.07] transition-opacity">0{idx + 1}</div>
                  <h4 className="text-lg font-black text-black flex items-center gap-3">
                    <span className="size-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">{idx + 1}</span>
                    {protocol.step}
                  </h4>
                  <p className="text-sm text-[#4B5563] font-medium leading-relaxed">{protocol.description}</p>
                </div>
              ))}
              {!pop.protocols && (
                <p className="text-sm text-gray-400 italic">Nenhum protocolo detalhado cadastrado.</p>
              )}
            </div>
          </section>

          {/* Checklist Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <ListChecks className="size-5" />
               </div>
               <h3 className="text-lg font-black uppercase tracking-[0.2em] text-black">Checklist Operacional</h3>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {pop.checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-white transition-all">
                  <div className="size-5 rounded-md border-2 border-indigo-200 flex items-center justify-center text-indigo-600">
                    <CheckCircle2 className="size-3" />
                  </div>
                  <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="md:col-span-4 space-y-8">
           {/* PPE / EPIs */}
           <div className="bg-rose-50 rounded-[40px] p-8 space-y-6 border border-rose-100">
              <div className="flex items-center gap-3">
                 <Shield className="size-5 text-rose-600" />
                 <h4 className="text-sm font-black uppercase tracking-[0.2em] text-rose-900">EPIs Obrigatórios</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {pop.epis.map(epi => (
                  <Badge key={epi} className="bg-white text-rose-600 hover:bg-white border-rose-100 font-bold px-3 py-1.5 rounded-xl text-[10px] shadow-sm uppercase tracking-wider">{epi}</Badge>
                ))}
              </div>
              <div className="p-4 bg-white/50 rounded-2xl flex gap-3 items-start">
                 <AlertTriangle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-rose-800 font-medium leading-relaxed">O USO DOS EPIS É OBRIGATÓRIO EM TODOS OS PROCEDIMENTOS TÉCNICOS DDSULF.</p>
              </div>
           </div>

           {/* Recommended Products */}
           <div className="bg-emerald-50 rounded-[40px] p-8 space-y-6 border border-emerald-100">
              <div className="flex items-center gap-3">
                 <Beaker className="size-5 text-emerald-600" />
                 <h4 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-900">Produtos Recomendados</h4>
              </div>
              <div className="space-y-3">
                {pop.recommendedProducts?.map(product => (
                  <div key={product} className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-emerald-100/50">
                    <div className="size-2 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">{product}</span>
                  </div>
                ))}
                {!pop.recommendedProducts && (
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Consultar Inventário Técnico</p>
                )}
              </div>
           </div>

           {/* Quick Tips */}
           <div className="bg-gray-100 rounded-[40px] p-8 space-y-4">
              <div className="flex items-center gap-3">
                 <Info className="size-5 text-gray-500" />
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Orientação ao Cliente</h4>
              </div>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                Após a aplicação, o cliente deve manter o isolamento da área por no mínimo 4 horas. Ambientes com crianças e pets exigem 12 horas.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
