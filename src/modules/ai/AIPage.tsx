import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  ArrowRight,
  BrainCircuit,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSystemStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SUGGESTIONS = [
  "Qual foi o serviço mais lucrativo este mês?",
  "Quais produtos estão com estoque baixo?",
  "Qual é minha margem média atual?",
  "Quanto estou gastando com veículos por serviço?",
  "Qual o ticket médio dos últimos 30 dias?",
  "Onde estou perdendo mais margem?",
  "Tenho produtos suficientes para 10 serviços de dedetização de baratas?"
];

export function AIPage() {
  const navigate = useNavigate();
  const { financial, inventory, quotes, pops } = useSystemStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. DYNAMIC SYSTEM CONTEXT GATHERING
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const monthQuotes = quotes.list.filter(q =>
    q.createdAt.startsWith(currentMonth) && q.status !== 'rascunho'
  );

  const revenue = monthQuotes.reduce((sum, q) => sum + q.pricing.finalPrice, 0);
  const totalCosts = monthQuotes.reduce((sum, q) => sum + q.costs.total, 0);
  
  const avgMargin = monthQuotes.length > 0
    ? monthQuotes.reduce((sum, q) => sum + q.pricing.marginPercent, 0) / monthQuotes.length
    : 0;
    
  const avgTicket = monthQuotes.length > 0 ? revenue / monthQuotes.length : 0;
  
  const totalFixedCosts = Object.values(financial.fixedCosts).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
  const targetServicesPerMonth = financial.operational.servicesPerMonth || 120;
  const costPerService = targetServicesPerMonth > 0 ? totalFixedCosts / targetServicesPerMonth : 0;

  const recentQuotes = [...quotes.list]
    .filter(q => q.status !== 'rascunho')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const systemContext = `
Você é o assistente operacional de inteligência da DDSulf Dedetização, empresa de controle de pragas com 20 anos de mercado em Volta Redonda/RJ.
Seu papel é atuar como um consultor estratégico, técnico e financeiro focado em otimização operacional e compliance sanitário.

DADOS FINANCEIROS ATUAIS DA EMPRESA:
- Custos Fixos Mensais Totais: R$ ${totalFixedCosts.toFixed(2)}
  - Aluguel de Veículos: R$ ${(financial.fixedCosts.vehicleRental || 0).toFixed(2)}
  - Salários de Campo: R$ ${(financial.fixedCosts.salaries || 0).toFixed(2)}
  - Combustível e Deslocamento: R$ ${(financial.fixedCosts.fuel || 0).toFixed(2)}
  - Outros Custos Indiretos: R$ ${(financial.fixedCosts.other || 0).toFixed(2)}
- Custo por Serviço Rateado: R$ ${costPerService.toFixed(2)}
- Margem Mínima Desejada: ${financial.operational.minimumMarginPercent}%
- Meta Operacional Mensal: ${financial.operational.servicesPerMonth} serviços/mês

DESEMPENHO COMERCIAL DO MÊS ATUAL (${currentMonth}):
- Total de Serviços Fechados/Em andamento: ${monthQuotes.length}
- Faturamento Acumulado: R$ ${revenue.toFixed(2)}
- Margem de Contribuição Média: ${avgMargin.toFixed(1)}%
- Ticket Médio de Fechamento: R$ ${avgTicket.toFixed(2)}

INVENTÁRIO / ESTOQUE ATUAL DE OUTS / PRODUTOS OPERACIONAIS:
${inventory.products.length > 0 
  ? inventory.products.map(p => `- ${p.name}: ${p.quantity} ${p.unit} (Mínimo de Segurança: ${p.minQuantity}) — ${p.quantity <= p.minQuantity ? '⚠️ CRÍTICO (ESTOQUE BAIXO)' : 'Regular / Em conformidade'}`).join('\n')
  : 'Nenhum insumo ou produto cadastrado no estoque.'
}

POPs OPERACIONAIS PARA CONTROLE (DOCUMENTOS DE CAMPO):
${pops.procedures.length > 0
  ? pops.procedures.map(p => `- Procedimento: ${p.name} | Praga: ${p.pestType} | Tipo de Aplicação: ${p.serviceType}`).join('\n')
  : 'Nenhum Procedimento Operacional Padrão (POP) registrado no sistema.'
}

ÚLTIMOS 5 ORÇAMENTOS RECENTES DE CAMPO:
${recentQuotes.length > 0
  ? recentQuotes.map(q => `- Cliente: ${q.client.name} | Praga Principal: ${q.service.pestType} | Preço Final: R$ ${q.pricing.finalPrice.toFixed(2)} | Margem Obtida: ${q.pricing.marginPercent.toFixed(1)}% | Status: ${q.status}`).join('\n')
  : 'Nenhum orçamento emitido recentemente no sistema.'
}

INSTRUÇÕES DE TOM DE VOZ E COMPORTAMENTO DA IA:
1. Responda de forma direta, pragmática, baseando-se RIGOROSAMENTE nos números reais fornecidos acima.
2. Seja um consultor de gestão experiente (não um chatbot amigável de suporte genérico). Mostre as perdas e ganhos claramente.
3. Se o estoque estiver crítico para algum insumo, alerte o usuário.
4. Apresente os dados estruturados com listas e formatação Markdown excelente e legível. 
5. Se faltarem dados (por exemplo, faturamento zerado ou estoque vazio), oriente o usuário a cadastrá-los em "/financial" ou "/inventory".
`;

  // Empty state verification - If finance fixed costs are fully empty & no quotes are created
  const isStoreEmpty = totalFixedCosts === 0 && quotes.list.length === 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    if (!customText) {
      setInput('');
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/ddsulf-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          systemContext,
          // Convert history to match assistant vs model role mapping required by schema
          history: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao comunicar com os servidores de inteligência.');
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.text || 'Gostaria de me aprofundar um pouco mais nessa questão. Você pode refinar a pergunta?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ **Instabilidade Operacional Temporária**: Não consegui processar a inteligência devido a: "${err.message || 'Erro desconhecido'}". Certifique-se de que a sua chave Gemini está configurada corretamente nos segredos do sistema.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-5xl mx-auto min-h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Profile */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-150">
        <div className="flex gap-4 items-center">
          <div className="size-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-md shrink-0">
             <BrainCircuit className="size-6 text-white" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Co-Piloto Operacional IA</h1>
            <div className="flex items-center gap-2">
               <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">DDSulf Insight System Online</p>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <Button 
            variant="outline"
            onClick={handleClearChat}
            className="h-10 px-4 rounded-xl text-xs font-bold text-slate-600 border-slate-200 hover:bg-slate-50 transition-all select-none gap-2"
          >
            <RotateCcw className="size-3.5" />
            Limpar Conversa
          </Button>
        )}
      </header>

      {isStoreEmpty ? (
        /* ESTADO VAZIO INTELIGENTE */
        <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 text-center max-w-xl mx-auto my-12 space-y-6 animate-in fade-in duration-300">
          <div className="size-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
            <AlertCircle className="size-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">IA Necessita de Dados Operacionais</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              A IA precisa de dados reais de simulação para gerar estratégias úteis. Preencha os custos fixos no módulo Financeiro e gere ao menos um orçamento para habilitar a inteligência consultiva.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button 
              onClick={() => navigate('/financial')}
              className="bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider h-11 px-6 shadow-sm hover:opacity-90 transition-all w-full sm:w-auto"
            >
              Configurar Financeiro
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/calculator')}
              className="border-slate-200 text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider h-11 px-6 transition-all w-full sm:w-auto"
            >
              Criar Orçamento
            </Button>
          </div>
        </div>
      ) : (
        /* MAIN CHAT APPLICATION */
        <div className="flex-1 bg-white border border-slate-200/80 rounded-[32px] shadow-sm flex flex-col overflow-hidden relative min-h-[580px]">
          
          {/* TOP QUICK SUGGESTIONS CHIPS */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 items-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 select-none mr-2">Sugestões Rápidas:</span>
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                disabled={loading}
                className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-full hover:border-slate-800 disabled:opacity-55 disabled:pointer-events-none transition-all text-xs font-bold text-slate-700 whitespace-nowrap cursor-pointer shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          {/* MESSAGE CHRONOLOGICAL SCREEN */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 min-h-[350px]"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                <div className="size-20 bg-slate-50 rounded-[28px] flex items-center justify-center">
                  <Sparkles className="size-8 text-slate-400" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h2 className="text-xl font-black text-slate-900">Qual a sua consulta operacional?</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Tenho visibilidade total sobre os custos fixos descritos em financeiro, compras de insumos em estoque, POPs registrados e as margens acumuladas este mês.
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-4 max-w-3xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                      {m.role === 'user' ? <User className="size-4" /> : <Bot className="size-4" />}
                    </div>

                    <div className={`flex flex-col spacing-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-5 rounded-[22px] text-xs font-medium leading-relaxed shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-tr-none' 
                          : 'bg-slate-50 text-slate-800 border border-slate-200/50 rounded-tl-none'
                      }`}>
                        {m.role === 'assistant' ? (
                          <div className="markdown-body prose prose-slate max-w-none text-xs leading-relaxed prose-p:my-1.5 prose-strong:text-slate-950 prose-headings:font-black prose-headings:text-slate-900 prose-ul:list-disc prose-ul:pl-4">
                            <Markdown>{m.content}</Markdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 px-1.5 select-none">
                        {m.timestamp}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 items-start"
              >
                <div className="size-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center animate-pulse shrink-0">
                  <Bot className="size-4 text-slate-400" />
                </div>
                <div className="p-4 bg-slate-50 rounded-[22px] rounded-tl-none border border-slate-200/50 flex items-center gap-3">
                  <Loader2 className="size-3.5 animate-spin text-slate-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">Consultando consultor DDSulf...</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* BOTTOM CHAT FOOTER INPUT BAR */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 shrink-0">
            <div className="relative flex items-center w-full bg-white border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-slate-950 focus-within:border-slate-950 rounded-2xl group transition-all duration-200">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pergunte sobre rentabilidade, estoque crônico ou procedimentos químicos..."
                className="flex-1 h-14 pl-5 pr-14 outline-none font-medium text-slate-800 placeholder:text-slate-350 text-sm"
                disabled={loading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button 
                  onClick={() => handleSendMessage()}
                  disabled={loading || !input.trim()}
                  className="size-10 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-5 mt-4 select-none opacity-60">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3 text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Gemini 3.5 Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="size-3 text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">DDSulf Knowledge Sync</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default AIPage;
