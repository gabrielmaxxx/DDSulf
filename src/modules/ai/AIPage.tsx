import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  TrendingUp, 
  Target, 
  Zap, 
  RefreshCcw,
  BarChart3,
  Cpu,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOperationalAi } from './hooks/useOperationalAi';
import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';

const SUGGESTIONS = [
  "Qual serviço possui maior margem?",
  "Como está a lucratividade este mês?",
  "Quais regiões possuem maior demanda?",
  "Qual praga gera mais retrabalho?",
  "Análise da produtividade das equipes",
  "Relação faturamento vs custos"
];

export function AIPage() {
  const { messages, loading, ask, clearChat, context } = useOperationalAi();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    ask(input);
    setInput('');
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-160px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Profile */}
      <header className="flex items-center justify-between pb-6 border-b border-gray-100">
        <div className="flex gap-4 items-center">
          <div className="size-14 bg-black rounded-[24px] flex items-center justify-center shadow-2xl shadow-black/20">
             <BrainCircuit className="size-7 text-white" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black tracking-tightest text-black">DDSulf Intelligence</h1>
            <div className="flex items-center gap-2">
               <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">IA Operacional Ativa</p>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex gap-4">
           <div className="px-5 py-3 bg-white border border-[#E5E7EB] rounded-2xl flex items-center gap-3">
              <TrendingUp className="size-4 text-[#10B981]" />
              <div className="flex flex-col">
                 <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Margem Atual</span>
                 <span className="text-sm font-black text-black">{context?.financialSummary?.margin.toFixed(1)}%</span>
              </div>
           </div>
           <Button 
            variant="outline" 
            onClick={clearChat}
            className="h-14 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest border-[#E5E7EB] hover:bg-black hover:text-white transition-all"
           >
             <RefreshCcw className="size-4 mr-2" /> Limpar Conversa
           </Button>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white border border-[#E5E7EB] rounded-[40px] shadow-sm flex flex-col overflow-hidden relative">
        <ScrollArea className="flex-1 p-8" ref={scrollRef}>
          <div className="space-y-10">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                 <div className="size-24 bg-gray-50 rounded-[40px] flex items-center justify-center">
                    <Sparkles className="size-10 text-gray-200" />
                 </div>
                 <div className="space-y-2 max-w-sm">
                    <h2 className="text-2xl font-black text-black tracking-tightest">Como posso ajudar hoje?</h2>
                    <p className="text-sm text-[#6B7280] font-medium">Analiso seus dados operacionais, financeiros e de estoque para fornecer insights estratégicos.</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3 w-full max-w-2xl px-4">
                    {SUGGESTIONS.map(s => (
                      <button 
                        key={s} 
                        onClick={() => ask(s)}
                        className="p-5 bg-white border border-[#E5E7EB] rounded-[24px] text-left hover:border-black transition-all group"
                      >
                         <p className="text-xs font-black text-black uppercase tracking-tight leading-snug group-hover:translate-x-1 transition-transform">{s}</p>
                      </button>
                    ))}
                 </div>
              </div>
            )}

            {messages.map((m, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-6 max-w-3xl",
                  m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "size-10 rounded-2xl flex items-center justify-center shrink-0",
                  m.role === 'user' ? "bg-black" : "bg-indigo-50"
                )}>
                  {m.role === 'user' ? <User className="size-5 text-white" /> : <Cpu className="size-5 text-indigo-600" />}
                </div>
                
                <div className={cn(
                  "space-y-4",
                  m.role === 'user' ? "text-right" : ""
                )}>
                  <div className={cn(
                    "p-6 rounded-[28px] text-sm font-medium leading-relaxed shadow-sm",
                    m.role === 'user' ? "bg-black text-white" : "bg-gray-50 text-gray-800 border border-gray-100"
                  )}>
                    {m.role === 'assistant' ? (
                      <div className="markdown-body prose prose-slate max-w-none prose-sm prose-headings:font-black prose-headings:text-black prose-p:leading-relaxed prose-strong:text-black">
                        <Markdown>{m.content}</Markdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-6 items-start"
              >
                <div className="size-10 rounded-2xl bg-indigo-50 flex items-center justify-center animate-pulse">
                  <Cpu className="size-5 text-indigo-400" />
                </div>
                <div className="p-6 bg-gray-50 rounded-[28px] border border-gray-100 flex items-center gap-3">
                   <Loader2 className="size-4 animate-spin text-indigo-600" />
                   <span className="text-xs font-black uppercase tracking-widest text-[#6B7280]">Processando Inteligência...</span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Bar */}
        <div className="p-6 bg-white border-t border-[#F3F4F6]">
           <div className="relative group">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte qualquer coisa sobre sua operação..."
                className="h-16 pl-6 pr-20 rounded-[24px] border-[#E5E7EB] bg-gray-50 focus-visible:ring-black font-medium text-lg placeholder:text-gray-300 transition-all group-focus-within:bg-white group-focus-within:shadow-2xl group-focus-within:shadow-black/5"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 <Button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="size-12 bg-black text-white rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-black/10"
                 >
                    <Send className={cn("size-5 transition-transform", loading ? "hidden" : "group-focus-within:translate-x-0.5")} />
                    {loading && <Loader2 className="size-5 animate-spin" />}
                 </Button>
              </div>
           </div>
           <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 opacity-50">
                 <Zap className="size-3 text-amber-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Gemini 3 Flash</span>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                 <BarChart3 className="size-3 text-indigo-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Analytics Real-time</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
