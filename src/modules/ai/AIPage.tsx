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
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      {/* Header fixo */}
      <div className="pb-6 border-b border-slate-200/40 shrink-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-[#1B3A2D] flex items-center justify-center shadow-md shadow-emerald-900/10 shrink-0">
              <BrainCircuit className="size-7 text-[#D4A017]" />
            </div>
            <div>
              <h1 className="text-[40px] font-bold text-slate-900 leading-none tracking-tight">IA Operacional</h1>
              <p className="text-base text-slate-500 font-normal mt-2">
                Consulte o assistente treinado com dados reais de inventário, laudos e fluxo financeiro.
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="mr-3 text-xs font-semibold text-[#6B6B5F] hover:text-[#C1361A] transition-colors cursor-pointer"
              >
                Limpar Conversa
              </button>
            )}
            <div className="flex items-center gap-1.5 text-xs text-[#2D6A4F] font-semibold 
                            bg-[#D8EDE3] px-3 py-1.5 rounded-full select-none">
              <div className="size-1.5 bg-[#2D6A4F] rounded-full animate-pulse" />
              Online
            </div>
          </div>
        </div>
      </div>

      {/* Sugestões (se sem mensagens) ou área de chat */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6 overflow-y-auto">
          {isStoreEmpty && (
            <div className="max-w-md p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left text-xs text-amber-850">
              <p className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                <AlertCircle className="size-4 shrink-0" /> IA Necessita de Dados Operacionais
              </p>
              A IA gerará respostas mais precisas após você preencher custos fixos no módulo Financeiro e gerar orçamentos reais.
            </div>
          )}
          <div className="text-center">
            <p className="font-display text-2xl text-[#141410] mb-2">Como posso ajudar?</p>
            <p className="text-sm text-[#6B6B5F]">Pergunte sobre margens, estoque, orçamentos ou sugestões operacionais.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-lg">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="px-4 py-2.5 bg-white border border-[#E8E6E1] rounded-xl text-xs 
                           text-[#141410] font-medium hover:border-[#2D6A4F] hover:bg-[#D8EDE3]/20 
                           transition-all text-left cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 font-sans"
        >
          {messages.map((message, i) => {
            if (message.role === 'user') {
              return (
                <div key={i} className="flex justify-end mb-4">
                  <div className="max-w-[75%] bg-[#1B3A2D] text-white rounded-2xl rounded-tr-md px-4 py-3 text-sm text-left whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              );
            } else {
              return (
                <div key={i} className="flex gap-3 mb-4 text-left">
                  <div className="size-8 rounded-lg bg-[#D8EDE3] flex items-center justify-center shrink-0 mt-0.5">
                    <BrainCircuit className="size-4 text-[#1B3A2D]" />
                  </div>
                  <div className="max-w-[80%] bg-white border border-[#E8E6E1] rounded-2xl rounded-tl-md px-4 py-3 text-sm text-[#141410] leading-relaxed markdown-body">
                    <Markdown>{message.content}</Markdown>
                  </div>
                </div>
              );
            }
          })}

          {loading && (
            <div className="flex gap-3 mb-4 text-left">
              <div className="size-8 rounded-lg bg-[#D8EDE3] flex items-center justify-center shrink-0">
                <BrainCircuit className="size-4 text-[#1B3A2D]" />
              </div>
              <div className="bg-white border border-[#E8E6E1] rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="size-1.5 bg-[#2D6A4F] rounded-full animate-bounce"
                         style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input fixo no rodapé */}
      <div className="border-t border-[#E8E6E1] p-4 bg-white shrink-0">
        <div className="flex gap-3 items-end max-w-3xl mx-auto">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Pergunte algo sobre a operação..."
            className="flex-1 resize-none rounded-xl border border-[#E8E6E1] px-4 py-3 text-sm 
                       text-[#141410] focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/15 
                       focus:border-[#2D6A4F] transition-all max-h-32 bg-[#F7F6F3]"
          />
          <button 
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            className="size-11 bg-[#1B3A2D] text-white rounded-xl flex items-center 
                               justify-center hover:bg-[#2D6A4F] transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIPage;
