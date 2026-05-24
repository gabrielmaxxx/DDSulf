import React, { useState } from 'react';
import { 
  Users, 
  History, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  ChevronRight, 
  DollarSign, 
  Calendar, 
  Smartphone, 
  ShieldCheck, 
  Award, 
  HeartHandshake, 
  Zap, 
  Clock, 
  FolderPlus, 
  AlertTriangle,
  HelpCircle,
  ThumbsUp,
  Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { 
  useCustomerPortal,
  useRecurrenceIntelligence,
  useCustomerHistory,
  useCustomerAnalytics,
  useCustomerRecommendations,
  useRelationshipInsights
} from '@/customer';

export function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'recurrence' | 'insights' | 'add_client'>('timeline');

  // Customer experience hooks
  const { 
    profiles, 
    activeCustomerId, 
    setActiveCustomerId, 
    activeProfile, 
    activeCustomerHistory, 
    addNewClient 
  } = useCustomerPortal();

  const { opportunities, estimatedMissedRevenue } = useRecurrenceIntelligence();
  const { updateSatisfactionScore } = useCustomerHistory();
  const { averageNpsScore, customerRetentionRate, churnRatePrev30Days } = useCustomerAnalytics();
  const { recommendations } = useCustomerRecommendations();
  const { insights } = useRelationshipInsights();

  // Add client form state
  const [newClientName, setNewClientName] = useState('');
  const [newClientCNPJ, setNewClientCNPJ] = useState('');
  const [newClientSegment, setNewClientSegment] = useState<'corporate' | 'residential' | 'industrial' | 'agricultural'>('residential');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientRecurrence, setNewClientRecurrence] = useState(90);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientCNPJ || !newClientEmail) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }

    addNewClient({
      name: newClientName,
      corporateName: newClientName + ' S/A',
      cnpjOrCpf: newClientCNPJ,
      segment: newClientSegment,
      email: newClientEmail,
      phone: newClientPhone,
      contractStatus: 'active',
      recurrencePeriodDays: Number(newClientRecurrence)
    });

    toast.success('Cliente registrado e sincronizado!', {
      description: 'As rotas de recorrência foram geradas preventivamente.'
    });

    setNewClientName('');
    setNewClientCNPJ('');
    setNewClientEmail('');
    setNewClientPhone('');
    setActiveTab('timeline');
  };

  const setRating = (historyId: string, rating: number) => {
    updateSatisfactionScore(historyId, rating);
    toast.success('Nota de satisfação registrada!', {
      description: 'Agradecemos o feedback operacional instantâneo.'
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header and Title */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Customer Centric Platform</span>
          </div>
          <h1 className="text-5xl font-black tracking-tightest text-black">Relacionamento & Retenção</h1>
          <p className="text-xl text-[#6B7280] font-medium max-w-2xl">Mapeamento de recorrência inteligente do cliente e canais integrados de engajamento.</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'timeline' ? 'bg-black text-white shadow-xs' : 'text-gray-400 hover:text-black'
            }`}
          >
            Portal & Linha do Tempo
          </button>
          <button 
            onClick={() => setActiveTab('recurrence')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'recurrence' ? 'bg-black text-white shadow-xs' : 'text-gray-400 hover:text-black'
            }`}
          >
            Recorrência IA
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'insights' ? 'bg-black text-white shadow-xs' : 'text-gray-400 hover:text-black'
            }`}
          >
            Alunos & Churn Risk
          </button>
        </div>
      </header>

      {/* Cohort KPIs Cards Row */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-[#FAF9F6] border-[#E8E6E0] rounded-[24px] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8A8880]">Índice de Retenção</span>
            <HeartHandshake className="size-4 text-[#8A8880]" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-black">
              {(customerRetentionRate * 100).toFixed(1)}%
            </h4>
            <p className="text-[10px] font-semibold text-emerald-600 mt-1">Acima da média de mercado</p>
          </div>
        </Card>

        <Card className="bg-[#FAF9F6] border-[#E8E6E0] rounded-[24px] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8A8880]">Média NPS Ativa</span>
            <Award className="size-4 text-[#8A8880]" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-black">
              {averageNpsScore}<span className="text-xs font-normal">pts</span>
            </h4>
            <p className="text-[10px] font-semibold text-emerald-600 mt-1">Zona de Excelência</p>
          </div>
        </Card>

        <Card className="bg-[#FAF9F6] border-[#E8E6E0] rounded-[24px] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8A8880]">Recorrência Perdida</span>
            <AlertTriangle className="size-4 text-amber-600" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-black">
              R$ {estimatedMissedRevenue.toLocaleString()}
            </h4>
            <p className="text-[10px] font-semibold text-amber-600 mt-1">Receita potencial sob atraso</p>
          </div>
        </Card>

        <Card className="bg-[#FAF9F6] border-[#E8E6E0] rounded-[24px] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Volatilidade (Churn)</span>
            <Zap className="size-4 text-slate-400" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-black">
              {churnRatePrev30Days}%
            </h4>
            <p className="text-[10px] font-semibold text-[#8A8880] mt-1">Baixo impacto de desistências</p>
          </div>
        </Card>
      </div>

      {activeTab === 'timeline' && (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Side: Client Selector */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Clientes Sincronizados</label>
              <button 
                onClick={() => setActiveTab('add_client')}
                className="text-[10px] font-black text-black hover:underline flex items-center gap-1"
              >
                <FolderPlus className="size-3" /> Registrar Novo
              </button>
            </div>
            <div className="space-y-3">
              {profiles.map(p => {
                const isActive = p.id === activeCustomerId;
                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveCustomerId(p.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-black text-white border-black shadow-md' 
                        : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.segment}
                      </span>
                      <span className={`text-[8px] font-mono uppercase ${
                        p.contractStatus === 'active' ? 'text-emerald-500' : p.contractStatus === 'churn_risk' ? 'text-red-400' : 'text-amber-500'
                      }`}>
                        ● {p.contractStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm mt-3 truncate">{p.name}</h4>
                    <div className={`text-xs mt-1 font-medium ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                      LTV: R$ {p.lifeTimeValue.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Integrated Timeline Portal */}
          <div className="lg:col-span-8 space-y-8">
            {activeProfile ? (
              <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[32px] p-8 space-y-8">
                {/* Profile Detail Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                  <div>
                    <h3 className="text-xl font-black text-black">{activeProfile.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{activeProfile.corporateName || 'Operação Geral'}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        CPF/CNPJ: {activeProfile.cnpjOrCpf}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        E-mail: {activeProfile.email}
                      </span>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-[9px] font-black uppercase text-gray-400">Total de Visitas</p>
                    <h4 className="text-3xl font-black text-black mt-1">
                      {activeProfile.totalServicesCompleted}
                    </h4>
                  </div>
                </div>

                {/* AI Predictive Recommendations */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-indigo-600 animate-pulse" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#1e1b4b]">Filtro de Recomendação Sazonal</h4>
                  </div>
                  {recommendations.map(rec => (
                    <div key={rec.id} className="space-y-2">
                      <p className="text-sm font-bold text-indigo-950">{rec.title}</p>
                      <p className="text-xs text-indigo-900/75 leading-relaxed">{rec.rationale}</p>
                      <div className="flex items-center gap-4 text-[10px] font-mono font-bold mt-1 text-indigo-700">
                        <span>Alvo: {rec.pestTarget}</span>
                        <span>Fórmula: {rec.chemicalFormulaSuggested}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Service History Timeline */}
                <div className="space-y-6">
                  <h4 className="text-sm font-black uppercase tracking-widest text-black">Linha do Tempo de Visitas</h4>
                  <div className="space-y-4">
                    {activeCustomerHistory.map(item => (
                      <div 
                        key={item.id}
                        className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-800">{item.serviceType}</p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                            <span>Técnico: {item.technicianName}</span>
                            <span>•</span>
                            <span>Executado em: {new Date(item.executedAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 pt-1.5">
                            {item.pestIdentified.map(p => (
                              <Badge key={p} variant="outline" className="text-[9px] font-mono border-gray-200">
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Satisfaction Feedback */}
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">Satisfação do Cliente</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => {
                              const activeStars = item.satisfactionScore || 0;
                              return (
                                <button
                                  key={star}
                                  onClick={() => setRating(item.id, star)}
                                  className="focus:outline-hidden"
                                >
                                  <Star 
                                    className={`size-4 ${
                                      star <= activeStars ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                                    } hover:scale-110 transition-transform`} 
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}

                    {activeCustomerHistory.length === 0 && (
                      <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl space-y-2">
                        <History className="size-6 mx-auto text-gray-300" />
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Nenhum histórico listado localmente.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <div className="p-16 text-center border-2 border-dashed border-gray-200 rounded-[32px] space-y-4 bg-white">
                <Users className="size-8 text-gray-300 mx-auto" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Nenhum cliente selecionado.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'recurrence' && (
        <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[32px] p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-black">Atrasos de Ciclo Operacional (Recorrência IA)</h3>
            <p className="text-xs text-gray-400">Clientes com hiato estendido que requerem envio de e-mails corporativos.</p>
          </div>

          <div className="space-y-4">
            {opportunities.map(opp => (
              <div 
                key={opp.id}
                className="p-5 border border-[#F3F4F6] bg-gray-50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-black transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-gray-900">{opp.customerName}</p>
                    <Badge variant="outline" className="text-[8px] font-mono font-bold uppercase">
                      {opp.segment}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">Ação Sugerida: <span className="text-black font-semibold">{opp.recommendedPestAction}</span></p>
                  <p className="text-[10px] font-mono text-gray-400">Última Visita: {new Date(opp.lastExecutedAt).toLocaleDateString('pt-BR')}</p>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-left md:text-right">
                    <p className="text-[8px] font-black uppercase text-rose-500">Atraso</p>
                    <p className="text-lg font-black text-rose-600">{opp.daysOverdue} dias</p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-[8px] font-black uppercase text-gray-400">Estimativa do Bilhete</p>
                    <p className="text-lg font-black text-black">R$ {opp.estimatedRevenue.toLocaleString()}</p>
                  </div>

                  <Button 
                    onClick={() => {
                      toast.success(`E-mail de recontratação disparado para ${opp.customerName}!`, {
                        description: 'A proposta do checklist de segurança já foi incluída.'
                      });
                    }}
                    className="h-10 bg-black hover:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all"
                  >
                    Propor Renovação
                  </Button>
                </div>
              </div>
            ))}

            {opportunities.length === 0 && (
              <div className="p-12 text-center border border-dashed border-gray-200 rounded-3xl">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Todos os clientes em conformidade ativa!</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'insights' && (
        <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[32px] p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-black">Relatórios e Controles Preventivos de Churn</h3>
            <p className="text-xs text-gray-400">Análise de interações perdidas e propostas de resgate comercial.</p>
          </div>

          <div className="grid gap-4">
            {insights.map(item => (
              <div 
                key={item.id}
                className={`p-5 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  item.impactLevel === 'high' ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-mono uppercase font-black px-2 py-0.5 rounded ${
                      item.impactLevel === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      Impacto {item.impactLevel}
                    </span>
                    <span className="font-bold text-sm text-gray-900">{item.customerName}</span>
                  </div>
                  <p className="text-xs text-gray-700 font-medium">{item.message}</p>
                </div>

                <div className="shrink-0">
                  <Button 
                    onClick={() => {
                      toast.success('Tarefa adicionada à fila de CRM!', {
                        description: item.suggestedAction
                      });
                    }}
                    variant="outline"
                    className="bg-white border-gray-200 hover:bg-black hover:text-white h-10 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Resgatar Cliente
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'add_client' && (
        <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[32px] p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-black font-sans">Cadastrar Cliente Integrado</h3>
            <p className="text-xs text-gray-400">Ative o pipeline de recorrências e segurança preventivo.</p>
          </div>

          <form onSubmit={handleCreateClient} className="space-y-4 max-w-xl">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome ou Razão Fantasia</label>
                <input 
                  type="text"
                  required
                  placeholder="Nome do cliente"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">CNPJ / CPF</label>
                <input 
                  type="text"
                  required
                  placeholder="00.000.000/0001-00"
                  value={newClientCNPJ}
                  onChange={e => setNewClientCNPJ(e.target.value)}
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8A8880]">Segmento Comercial</label>
                <select 
                  value={newClientSegment}
                  onChange={e => setNewClientSegment(e.target.value as any)}
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black bg-white transition-all"
                >
                  <option value="residential">Residencial</option>
                  <option value="corporate">Comercial / Corporativo</option>
                  <option value="industrial">Industrial / Fábrica</option>
                  <option value="agricultural">Agrícola</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ciclo de Recorrência Sugerida</label>
                <select 
                  value={newClientRecurrence}
                  onChange={e => setNewClientRecurrence(Number(e.target.value))}
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black bg-white transition-all"
                >
                  <option value={30}>30 dias (Mensal Crítico)</option>
                  <option value={90}>90 dias (Trimestral)</option>
                  <option value={180}>180 dias (Semestral)</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">E-mail para Alertas</label>
                <input 
                  type="email"
                  required
                  placeholder="cliente@provedor.com"
                  value={newClientEmail}
                  onChange={e => setNewClientEmail(e.target.value)}
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Telefone / WhatsApp</label>
                <input 
                  type="text"
                  placeholder="(54) 99999-0000"
                  value={newClientPhone}
                  onChange={e => setNewClientPhone(e.target.value)}
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button 
                type="submit"
                className="h-12 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
              >
                Gravar Registro Premium
              </Button>
              <Button 
                type="button"
                onClick={() => setActiveTab('timeline')}
                variant="outline"
                className="h-12 border-gray-200 hover:bg-gray-50 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
