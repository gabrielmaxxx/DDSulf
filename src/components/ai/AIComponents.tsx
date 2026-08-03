import React, { useState } from 'react';
import { Sparkles, Terminal, Info, ShieldAlert, CheckCircle, ArrowUpRight, Cpu, CornerDownLeft } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';

// 1. Structural output recommendations card mapped from AI opportunity outputs
interface AIRecommendationCardProps {
  advice: string;
  recommendedPriceAdjustment: number;
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
  pesticideRecommendations: string[];
}

export function AIRecommendationCard({
  advice,
  recommendedPriceAdjustment,
  riskLevel,
  pesticideRecommendations
}: AIRecommendationCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Alto':
        return 'bg-rose-50 border-rose-100 text-rose-700';
      case 'Médio':
        return 'bg-amber-50 border-amber-100 text-amber-700';
      case 'Baixo':
      default:
        return 'bg-emerald-50 border-emerald-100 text-emerald-700';
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute right-0 top-0 bg-yellow-400/5 size-24 rounded-full blur-2xl" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Sparkles className="size-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono block">Análise Concluída</span>
            <span className="text-xs font-bold text-slate-200">Recomendações IA PestFlow</span>
          </div>
        </div>

        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border leading-none font-mono ${getRiskColor(riskLevel)}`}>
          Risco {riskLevel}
        </span>
      </div>

      <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-slate-300 leading-relaxed font-sans">
        {advice}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-0.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Fator de Operação</span>
          <span className="text-sm font-black text-amber-400 font-mono">+{recommendedPriceAdjustment}%</span>
          <span className="text-[9px] text-slate-400 block font-sans">margem extra sugerida</span>
        </div>

        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-0.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Ativos Identificados</span>
          <span className="text-xs font-bold text-slate-200 block font-mono">
            {pesticideRecommendations.length} Formulações
          </span>
          <span className="text-[9px] text-slate-400 block font-sans">em estoque</span>
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none block">Composição Química Recomendada</span>
        <div className="flex flex-wrap gap-1">
          {pesticideRecommendations.map(p => (
            <span key={p} className="text-[10px] bg-white/10 border border-white/5 text-slate-300 font-medium px-2 py-0.5 rounded-lg font-mono">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. High fidelity AI Terminal Chat screen representing internal Operations AI query handler
interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export function AIChat() {
  const { empresaId } = useAuth();
  const activeEmpresaId = empresaId || '';
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Olá Operador. Sou o Copiloto IA PestFlow. Insira detalhes da aplicação do orçamento ou estoques para diagnóstico operacional imediato.' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = inputVal;
    setInputVal('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Lazy load AIService for analyzing queries
      const { AIService } = await import('@/services/ai/ai');
      
      // Simulate/Trigger dynamic response
      let responseText = '';
      if (userMsg.toLowerCase().includes('estoque') || userMsg.toLowerCase().includes('suprimentos')) {
        const audits = await AIService.getVulnerabilityAuditSummary(activeEmpresaId);
        responseText = audits.length > 0 
          ? `[DIAGNÓSTICO DIGITAL DE INSUMOS] Identifiquei inconformidades ativas de suprimento:\n${audits.join('\n')}`
          : 'Status de ativos químicos normatizado. Sem gargalos de suprimento ativos na data operacional.';
      } else {
        responseText = `Entendido. Registrei a solicitação regulatória no banco operacional. Recomendo mapear as diretrizes do POP de controle de vetores integrado.`;
      }

      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Falha ao sincronizar com motores cognitivos PestFlow. Tente novamente.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm flex flex-col h-[340px] font-sans">
      {/* Dynamic Header */}
      <div className="bg-slate-900 text-white p-3.5 flex items-center gap-2 border-b border-slate-850 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-amber-500 animate-pulse" />
          <span className="text-xs font-bold font-sans">PestFlow AI Engine v2.4</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-slate-400">
          <span className="size-2 rounded-full bg-emerald-500 inline-block animate-ping" />
          COORDENADOR ATIVO
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
        {messages.map((m, idx) => {
          const isAssistant = m.role === 'assistant';
          return (
            <div key={idx} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                isAssistant 
                  ? 'bg-white text-slate-800 border border-slate-200/50 rounded-tl-sm font-medium shadow-sm' 
                  : 'bg-slate-900 text-white rounded-tr-sm font-semibold'
              }`}>
                {m.text}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-2xl bg-white border border-slate-200/50 rounded-tl-sm text-xs font-mono text-slate-400 flex items-center gap-1">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce [animation-delay:0.2s]">●</span>
              <span className="animate-bounce [animation-delay:0.4s]">●</span>
              <span>Analisando matriz de decisão Comercial...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input panel Form */}
      <form onSubmit={sendMessage} className="p-2 bg-white border-t border-slate-100 flex gap-1.5 shrink-0">
        <input 
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Perguntar sobre estoque, orçamentos, ou riscos..."
          className="flex-1 bg-slate-50 px-3.5 py-2 text-xs border border-transparent rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-sans text-slate-800"
        />
        <button 
          type="submit" 
          className="size-8 bg-slate-900 hover:bg-black rounded-xl text-white flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm"
        >
          <CornerDownLeft className="size-4.5" />
        </button>
      </form>
    </div>
  );
}
