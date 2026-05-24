import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  MapPin, 
  Zap, 
  AlertCircle,
  FileText,
  PieChart,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDashboardIntelligence } from './hooks/useDashboardIntelligence';
import { KpiCard, InsightCard } from './components/DashboardComponents';
import { ReportingHub } from './components/ReportingHub';
import { InfrastructureMonitor } from './components/InfrastructureMonitor';
import { DesignSystemShowcase } from './components/DesignSystemShowcase';
import { SaaSAdminShowcase } from '@/organization';
import { SecurityAuditDashboard } from '@/security';
import { DevOpsObservabilityHub } from '@/devops';
import { ReliabilityQACenter } from '@/components/qa/ReliabilityQACenter';
import { PerformanceScalabilitySuite } from '@/performance/components/PerformanceScalabilitySuite';
import { ObservabilityIntelligenceDashboard } from '@/observability';
import { BusinessIntelligenceDashboard, AnalyticsProvider } from '@/analytics';
import { WorkflowsDashboard } from '../../workflows/components/WorkflowsDashboard';
import { CommunicationDashboard } from '../../communication/inbox/CommunicationDashboard';

export function DashboardPage() {
  const { metrics, data, loading } = useDashboardIntelligence();
  const [activeTab, setActiveTab] = useState<'kpi' | 'reports' | 'infra' | 'design' | 'saas' | 'security' | 'devops' | 'qa' | 'performance' | 'observability' | 'bi' | 'workflows' | 'communications'>('kpi');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-6">
        <div className="relative">
          <Loader2 className="size-12 animate-spin text-black" />
          <BrainCircuit className="size-5 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">Processando Inteligência Operacional...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sistema Ativo • Real-time Analytics</span>
          </div>
          <h1 className="text-5xl font-black tracking-tightest text-black">Inteligência Operacional</h1>
          <p className="text-xl text-[#6B7280] font-medium max-w-2xl">Visualização de alta densidade para decisões baseadas em lucratividade real.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border-[#E5E7EB] hover:bg-black hover:text-white transition-all">
             <Calendar className="size-4 mr-2" /> Maio 2026
           </Button>
           {activeTab !== 'reports' && (
             <Button 
               onClick={() => setActiveTab('reports')}
               className="h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-black text-white shadow-xl hover:opacity-90 active:scale-95 transition-all"
             >
               Gerar Relatório Executivo
             </Button>
           )}
        </div>
      </header>

      {/* Aesthetic High-Contrast Segment Control */}
      <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('kpi')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'kpi' 
                ? "bg-black text-white shadow-md" 
                : "text-gray-400 hover:text-black"
            )}
          >
            Painel Geral & Analytics
          </button>
          <button 
            onClick={() => setActiveTab('bi')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'bi' 
                ? "bg-black text-white shadow-md" 
                : "text-gray-400 hover:text-black"
            )}
          >
            Intellectual BI & Analytics
          </button>
          <button 
            onClick={() => setActiveTab('workflows')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'workflows' 
                ? "bg-black text-white shadow-md" 
                : "text-gray-400 hover:text-black"
            )}
          >
            Automações & Workflows
          </button>
          <button 
            onClick={() => setActiveTab('communications')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'communications' 
                ? "bg-black text-white shadow-md animate-pulse" 
                : "text-[#EF4444] font-extrabold hover:text-black"
            )}
          >
            ● Central de Comunicação
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'reports' 
                ? "bg-black text-white shadow-md" 
                : "text-gray-400 hover:text-black"
            )}
          >
            Relatórios & Exports PRO
          </button>
          <button 
            onClick={() => setActiveTab('infra')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'infra' 
                ? "bg-black text-white shadow-md" 
                : "text-gray-400 hover:text-black"
            )}
          >
            Infraestrutura & Performance
          </button>
          <button 
            onClick={() => setActiveTab('design')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'design' 
                ? "bg-black text-white shadow-md" 
                : "text-gray-400 hover:text-black"
            )}
          >
            Design System & UX
          </button>
          <button 
            onClick={() => setActiveTab('saas')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'saas' 
                ? "bg-black text-white shadow-md" 
                : "text-gray-400 hover:text-black"
            )}
          >
            Gestão Multi-Tenant & SaaS
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'security' 
                ? "bg-black text-white shadow-md" 
                : "text-gray-400 hover:text-black"
            )}
          >
            Segurança & Auditoria
          </button>
          <button 
            onClick={() => setActiveTab('devops')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'devops' 
                ? "bg-black text-white shadow-md" 
                : "text-gray-400 hover:text-black"
            )}
          >
            DevOps & Observabilidade
          </button>
          <button 
            onClick={() => setActiveTab('qa')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'qa' 
                ? "bg-black text-white shadow-md" 
                : "text-gray-400 hover:text-black"
            )}
          >
            QA & Confiabilidade
          </button>
          <button 
            onClick={() => setActiveTab('performance')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'performance' 
                ? "bg-black text-white shadow-md" 
                : "text-gray-400 hover:text-black"
            )}
          >
            Otimização & Performance
          </button>
          <button 
            onClick={() => setActiveTab('observability')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'observability' 
                ? "bg-black text-white shadow-md" 
                : "text-gray-400 hover:text-black"
            )}
          >
            Observabilidade & Monitoramento
          </button>
        </div>

        <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest hidden sm:inline-block">
          DDSULF DOCUMENTATION FRAMEWORK v1.0 • ENCRYPTED
        </span>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'reports' ? (
          <motion.div 
            key="reports-hub"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <ReportingHub />
          </motion.div>
        ) : activeTab === 'infra' ? (
          <motion.div 
            key="infra-monitor"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <InfrastructureMonitor />
          </motion.div>
        ) : activeTab === 'design' ? (
          <motion.div 
            key="design-showcase"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <DesignSystemShowcase />
          </motion.div>
        ) : activeTab === 'saas' ? (
          <motion.div 
            key="saas-admin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <SaaSAdminShowcase />
          </motion.div>
        ) : activeTab === 'security' ? (
          <motion.div 
            key="security-audit"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <SecurityAuditDashboard />
          </motion.div>
        ) : activeTab === 'devops' ? (
          <motion.div 
            key="devops-hub"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <DevOpsObservabilityHub />
          </motion.div>
        ) : activeTab === 'qa' ? (
          <motion.div 
            key="qa-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <ReliabilityQACenter />
          </motion.div>
        ) : activeTab === 'performance' ? (
          <motion.div 
            key="performance-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <PerformanceScalabilitySuite />
          </motion.div>
        ) : activeTab === 'observability' ? (
          <motion.div 
            key="observability-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <ObservabilityIntelligenceDashboard />
          </motion.div>
        ) : activeTab === 'workflows' ? (
          <motion.div 
            key="workflows-orchestrator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <WorkflowsDashboard />
          </motion.div>
        ) : activeTab === 'communications' ? (
          <motion.div 
            key="communications-orchestrator-panel text-left"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <CommunicationDashboard />
          </motion.div>
        ) : activeTab === 'bi' ? (
          <motion.div 
            key="bi-intelligence-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <AnalyticsProvider>
              <BusinessIntelligenceDashboard />
            </AnalyticsProvider>
          </motion.div>
        ) : (
          <motion.div
            key="analytics-kpis"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-10"
          >
            {/* KPI Row */}
            <div className="grid gap-6 md:grid-cols-4 xl:grid-cols-5">
              <KpiCard 
                label="Faturamento Total" 
                value={`R$ ${metrics.financial.totalRevenue.toLocaleString()}`} 
                icon={DollarSign} 
                trend={metrics.financial.growth.revenue}
                description="Receita bruta acumulada"
              />
              <KpiCard 
                label="Margem Média" 
                value={`${metrics.financial.avgMargin.toFixed(1)}%`} 
                icon={PieChart} 
                trend={metrics.financial.growth.margin}
                type={metrics.financial.avgMargin < 30 ? 'warning' : 'neutral'}
                description="Performance de precificação"
              />
              <KpiCard 
                label="Ticket Médio" 
                value={`R$ ${metrics.financial.ticketMedio.toFixed(0)}`} 
                icon={Target} 
                description="Valor médio por venda"
              />
              <KpiCard 
                label="Produtividade" 
                value={`${metrics.operational.productivity.toFixed(1)}`} 
                icon={Activity} 
                trend={12.4}
                description="Serviços por equipe"
              />
              <KpiCard 
                label="Taxa de Retrabalho" 
                value={`${metrics.operational.reworkRate}%`} 
                icon={Zap} 
                type={metrics.operational.reworkRate > 5 ? 'error' : 'neutral'}
                description="Controle de qualidade"
              />
            </div>

            <div className="grid gap-8 md:grid-cols-12">
              {/* Core Analytics */}
              <div className="md:col-span-8 space-y-8">
                 <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[40px] p-10 space-y-8 overflow-hidden relative">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-black">Performance Financeira</h3>
                        <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Evolução de receita dos últimos serviços</p>
                      </div>
                      <div className="bg-[#F3F4F6] p-1 rounded-xl flex">
                         <button className="px-4 py-2 bg-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">Receita</button>
                         <button className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Margem</button>
                      </div>
                    </div>

                    <div className="h-[350px] w-full relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={data.revenues.map((r, i) => ({ val: r.amount, label: i })).slice(0, 10).reverse()}>
                            <defs>
                              <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#000" stopOpacity={0.08}/>
                                <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis hide />
                            <YAxis hide />
                            <RechartsTooltip 
                              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                              itemStyle={{ fontWeight: '900', fontSize: '14px' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="val" 
                              stroke="#000" 
                              strokeWidth={4} 
                              fillOpacity={1} 
                              fill="url(#colorPerf)" 
                              animationDuration={2000}
                            />
                         </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                       <TrendingUp className="size-64 text-black" />
                    </div>
                 </Card>

                 <div className="grid gap-8 md:grid-cols-2">
                    <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[32px] p-8 space-y-6">
                      <div className="flex items-center justify-between">
                         <h4 className="text-sm font-black uppercase tracking-widest text-[#111827]">Volume por Praga</h4>
                         <div className="p-2 bg-gray-50 rounded-xl">
                            <Target className="size-4 text-gray-400" />
                         </div>
                      </div>
                      <div className="space-y-4">
                         {['Baratas', 'Cupins', 'Ratos', 'Formigas'].map((pest, i) => (
                           <div key={pest} className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                 <span>{pest}</span>
                                 <span>{50 - i * 10}%</span>
                              </div>
                              <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                 <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${50 - i * 10}%` }}
                                  className="h-full bg-black rounded-full" 
                                  transition={{ duration: 1, delay: i * 0.1 }}
                                 />
                              </div>
                           </div>
                         ))}
                      </div>
                    </Card>

                    <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[32px] p-8 space-y-6">
                       <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#111827]">Distribuição Regional</h4>
                          <div className="p-2 bg-gray-50 rounded-xl">
                             <MapPin className="size-4 text-gray-400" />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-2xl border border-[#F3F4F6]">
                             <div className="size-10 bg-black rounded-xl flex items-center justify-center text-white font-black text-xs">A</div>
                             <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-black">Centro Industrial</p>
                                <p className="text-[9px] font-bold text-gray-400">Região de maior lucratividade</p>
                             </div>
                             <ArrowUpRight className="size-4 text-emerald-500" />
                          </div>
                          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#F3F4F6]">
                             <div className="size-10 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 font-black text-xs">B</div>
                             <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-black">Zona Sul Residencial</p>
                                <p className="text-[9px] font-bold text-gray-400">Alto custo de deslocamento</p>
                             </div>
                             <ArrowDownRight className="size-4 text-rose-500" />
                          </div>
                       </div>
                    </Card>
                 </div>
              </div>

              {/* Intelligence Sidebar */}
              <div className="md:col-span-4 space-y-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                       <div className="p-2 bg-indigo-50 rounded-lg">
                          <BrainCircuit className="size-4 text-indigo-600" />
                       </div>
                       <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black">Insights DDSulf IA</h3>
                    </div>
                    <div className="grid gap-4">
                       {metrics.insights.map((insight, idx) => (
                         <div key={idx}>
                           <InsightCard insight={insight} />
                         </div>
                       ))}
                       {metrics.insights.length === 0 && (
                         <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-3xl space-y-4">
                            <Loader2 className="size-6 animate-spin mx-auto text-gray-300" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Aguardando mais dados para gerar insights...</p>
                         </div>
                       )}
                    </div>
                 </div>

                 <Card className="bg-black text-white p-10 rounded-[40px] space-y-8 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 space-y-6">
                      <div className="space-y-2">
                        <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">Alerta de Otimização</div>
                        <h4 className="text-2xl font-black leading-tight">Reduza o custo fixo em até 12%</h4>
                        <p className="text-xs opacity-60 font-medium leading-relaxed">
                          Sua equipe gasta 4.5h médias em trânsito. Considere o agrupamento inteligente de ordens na Zona Norte.
                        </p>
                      </div>
                      <Button className="w-full h-14 bg-white text-black hover:bg-gray-100 font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-2xl">
                        Ver Sugestão de Rota
                      </Button>
                    </div>
                    <div className="absolute -bottom-20 -left-20 size-64 bg-indigo-500/20 rounded-full blur-[80px]" />
                 </Card>

                 <div className="p-8 bg-gray-50 border border-[#E5E7EB] rounded-[32px] space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Status da Operação</h4>
                      <div className="size-2 bg-emerald-500 rounded-full" />
                    </div>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-600">Serviços em Campo</span>
                          <span className="font-black text-black">04</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-600">Pendentes de Alocação</span>
                          <span className="font-black text-black">12</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-600">Atrasos Relatados</span>
                          <span className="font-black text-rose-500">01</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
