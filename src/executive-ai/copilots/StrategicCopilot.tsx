/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCcw, BrainCircuit, Cpu, User, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useExecutiveCopilot } from '../hooks/useExecutiveCopilot';
import Markdown from 'react-markdown';

interface StrategicCopilotProps {
  tenantId?: string;
}

export function StrategicCopilot({ tenantId = 'tenant_001_poa' }: StrategicCopilotProps) {
  const { messages, loading, triggerQuery, clearSession, memoryHistory } = useExecutiveCopilot(tenantId);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    triggerQuery(input);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SUGGESTIONS = [
    'Análise da margem operacional e faturamento mensal',
    'Avaliação de segurança regulatória da Anvisa para os POPs',
    'Previsão de crescimento e rollout na unidade gaúcha'
  ];

  return (
    <div className="flex flex-col lg:flex-row h-[680px] bg-slate-950 text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Central Chat Panel */}
      <div className="flex-1 flex flex-col h-full relative">
        <header className="p-5 border-b border-slate-900 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px]">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                <BrainCircuit className="size-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm text-slate-100">Copiloto Estratégico</h3>
              <p className="text-[10px] font-mono text-emerald-400 font-semibold tracking-wider uppercase">Active Cognitive Director</p>
            </div>
          </div>
          
          <button 
            onClick={clearSession}
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            title="Reiniciar Sessão"
          >
            <RefreshCcw className="size-4" />
          </button>
        </header>

        {/* Messaging Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  msg.role === 'user' 
                    ? 'bg-slate-100 text-slate-950 border-white' 
                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                }`}>
                  {msg.role === 'user' ? <User className="size-4" /> : <Cpu className="size-4" />}
                </div>
                
                <div className="space-y-1 max-w-[85%]">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed font-sans ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-slate-50'
                      : 'bg-slate-900/60 text-slate-300 border border-slate-900'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="markdown-body prose prose-invert prose-xs max-w-none prose-headings:font-bold prose-headings:text-slate-100 prose-p:leading-relaxed prose-strong:text-emerald-400">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 block px-1">
                    {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="size-8 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 flex items-center justify-center shrink-0 animate-pulse">
                <Cpu className="size-4" />
              </div>
              <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-2xl flex items-center gap-2">
                <span className="size-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="size-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="size-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}

          {messages.length <= 1 && !loading && (
            <div className="pt-12 text-center text-slate-500">
              <Sparkles className="size-8 mx-auto text-slate-700 mb-4" />
              <p className="text-xs font-semibold text-slate-400 mb-4">Sugestões de Análise Corporativa:</p>
              <div className="space-y-2.5 max-w-md mx-auto px-4">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => triggerQuery(s)}
                    className="w-full text-left p-3.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-slate-100 text-[11px] font-semibold flex items-center justify-between transition-colors border border-slate-900 hover:border-slate-800"
                  >
                    <span>{s}</span>
                    <ArrowUpRight className="size-3.5 text-slate-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/60">
          <div className="flex gap-2.5 bg-slate-900 rounded-xl p-1.5 border border-slate-800 focus-within:border-emerald-500/50 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Pergunte ao Diretor Cognitivo (ex: Análise de MRR ou auditoria Anvisa)..."
              className="flex-1 bg-transparent px-3 text-xs text-slate-100 outline-none placeholder-slate-500"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2.5 bg-emerald-500 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 rounded-lg transition-colors font-bold flex items-center justify-center"
            >
              <Send className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Memory System Logs Panel - Operational Observability */}
      <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-950 bg-slate-900/20 p-5 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-4">Histórico de Decisões</h4>
          <div className="space-y-3 max-h-[460px] overflow-y-auto scrollbar-none">
            {memoryHistory.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-950/40 rounded-lg border border-slate-900 font-mono text-[9px] flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[8px] ${
                    item.action.startsWith('SERVER') 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {item.action}
                  </span>
                  <span className="text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-400 truncate">Source: {item.metadata.source || 'core'}</p>
                <div className="text-[8px] text-slate-500 border-t border-slate-900/60 pt-1 flex items-center gap-1.5">
                  <span className="size-1 rounded-full bg-slate-400" />
                  <span>Verified Operational State</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-900/50 pt-4 mt-4 text-[10px] font-mono text-slate-500 space-y-1 bg-slate-950/30 rounded-xl p-3">
          <p className="font-bold text-slate-400 mb-1">Status de Rede</p>
          <p>Tenant: {tenantId}</p>
          <p>Offline Mode: Local Heuristics Enabled</p>
          <p>State Continuity: Persisted</p>
        </div>
      </div>
    </div>
  );
}
export default StrategicCopilot;
