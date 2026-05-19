import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingDown, 
  LineChart, 
  Settings, 
  ListOrdered,
  Plus,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinancialMetrics } from './hooks/useFinancialMetrics';
import { FinancialStats } from './components/FinancialStats';
import { OperationalSettings } from './components/OperationalSettings';
import { PageHeader, ViewContainer } from '../shared/components/Layout';
import { cn } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

type Tab = 'overview' | 'settings' | 'transactions';

export function FinancialPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { metrics, costs, revenues, loading } = useFinancialMetrics();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <Loader2 className="size-8 animate-spin text-black" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Processando Inteligência Financeira...</p>
      </div>
    );
  }

  return (
    <ViewContainer>
      <PageHeader 
        title="Financeiro Operacional" 
        description="Sua central de inteligência e lucratividade."
      >
        <div className="flex items-center p-1 bg-[#F3F4F6] rounded-2xl">
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            icon={LineChart}
            label="Geral"
          />
          <TabButton 
            active={activeTab === 'transactions'} 
            onClick={() => setActiveTab('transactions')}
            icon={ListOrdered}
            label="Movimentos"
          />
          <TabButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            icon={Settings}
            label="Inteligência"
          />
        </div>
      </PageHeader>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <FinancialStats metrics={metrics} />

            <div className="grid gap-8 md:grid-cols-12">
               <Card className="md:col-span-8 bg-white border-[#E5E7EB] shadow-sm rounded-[32px] overflow-hidden p-8 space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <h3 className="text-xl font-black text-black">Tendência de Receita</h3>
                        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Performance dos últimos 7 dias</p>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="size-3 bg-black rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Receita Bruta</span>
                     </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metrics.chartData}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} 
                          dy={10}
                        />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#000" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorAmount)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </Card>

               <div className="md:col-span-4 space-y-6">
                  <Card className="bg-black text-white p-8 rounded-[32px] shadow-2xl space-y-6">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Ticket Médio</div>
                      <div className="text-3xl font-black">R$ {(metrics.totalRevenue / Math.max(1, revenues.length)).toFixed(0)}</div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="space-y-1">
                        <div className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Conversão</div>
                        <div className="text-xl font-bold">12%</div>
                      </div>
                      <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <ArrowUpRight className="size-6 text-emerald-400" />
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-rose-50 border-rose-100 p-8 rounded-[32px] space-y-4">
                     <div className="size-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
                        <TrendingDown className="size-6" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="font-black text-rose-900 text-sm uppercase tracking-wider">Atenção ao Custo/KM</h4>
                        <p className="text-xs text-rose-700 font-medium leading-relaxed">
                          Os custos de deslocamento subiram 15% este mês. Verifique as rotas operacionais.
                        </p>
                     </div>
                  </Card>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div 
            key="transactions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-white border border-[#E5E7EB] rounded-[32px] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-[#E5E7EB] flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-black">Fluxo de Caixa</h3>
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Histórico completo de entradas e saídas</p>
                </div>
                <div className="flex gap-2">
                   <Button variant="outline" className="h-10 rounded-xl font-bold text-xs px-4 border-[#E5E7EB]">Exportar CSV</Button>
                   <Button className="h-10 rounded-xl font-bold text-xs px-4 bg-black text-white hover:bg-black/90"><Plus className="size-4 mr-2" /> Novo Registro</Button>
                </div>
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-[#F3F4F6] h-14">
                      <TableHead className="font-black uppercase text-[10px] px-8 text-[#9CA3AF] tracking-[0.2em]">Data</TableHead>
                      <TableHead className="font-black uppercase text-[10px] px-8 text-[#9CA3AF] tracking-[0.2em]">Descrição</TableHead>
                      <TableHead className="font-black uppercase text-[10px] px-8 text-[#9CA3AF] tracking-[0.2em]">Categoria</TableHead>
                      <TableHead className="font-black uppercase text-[10px] px-8 text-right text-[#9CA3AF] tracking-[0.2em]">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...revenues.map(r => ({ ...r, type: 'revenue' })), ...costs.map(c => ({ ...c, type: 'cost' }))]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((item, idx) => (
                      <TableRow key={idx} className="border-[#F3F4F6] hover:bg-gray-50/50 transition-colors h-16">
                        <TableCell className="text-[#6B7280] text-[10px] font-bold px-8 uppercase tracking-wider">
                          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="font-bold px-8 text-sm text-[#111827]">
                          {(item as any).subcategory || (item as any).category || 'Transação Geral'}
                        </TableCell>
                        <TableCell className="px-8">
                          <Badge className={cn(
                            "border-none font-black text-[9px] uppercase tracking-wider px-3 py-1 rounded-lg",
                            item.type === 'revenue' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          )}>
                            {item.type === 'revenue' ? 'Receita' : (item as any).category}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-black px-8 text-base",
                          item.type === 'revenue' ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {item.type === 'revenue' ? '+' : '-'} R$ {item.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <OperationalSettings />
          </motion.div>
        )}
      </AnimatePresence>
    </ViewContainer>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em]",
        active ? "bg-white text-black shadow-sm" : "text-[#6B7280] hover:text-black"
      )}
    >
      <Icon className={cn("size-4", active ? "text-black" : "text-[#9CA3AF]")} />
      {label}
    </button>
  );
}

