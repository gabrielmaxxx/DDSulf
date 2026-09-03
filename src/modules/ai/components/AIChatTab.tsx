import React, { useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  BrainCircuit,
  Send,
  Trash2,
  Sparkles,
  History,
  Star,
} from 'lucide-react';
import { ChatMessage } from '../types';

interface AIChatTabProps {
  messages: ChatMessage[];
  chatLoading: boolean;
  chatInput: string;
  setChatInput: (val: string) => void;
  onSendMessage: (query?: string) => void;
  onClearMessages: () => void;
  onToggleFavorite: (title: string, query: string, mode: 'chat') => void;
  favoritesCount: number;
  onOpenHistory: () => void;
}

export const AIChatTab: React.FC<AIChatTabProps> = ({
  messages,
  chatLoading,
  chatInput,
  setChatInput,
  onSendMessage,
  onClearMessages,
  onToggleFavorite,
  favoritesCount,
  onOpenHistory,
}) => {
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, chatLoading]);

  const quickSuggestions = [
    { label: 'Como preparar calda de lambda-cialotrina?', category: 'POPs Químicos' },
    { label: 'Quais clientes estão inativos há mais de 60 dias?', category: 'CRM & Churn' },
    { label: 'Qual nossa margem líquida atual?', category: 'Finanças' },
    { label: 'Status de estoque do Demand 2.5 CS', category: 'Insumos' },
  ];

  return (
    <div className="bg-white border border-[#E8E6E1] rounded-3xl p-5 md:p-6 shadow-xs flex flex-col h-[740px]">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="size-4.5 text-[#D4A017]" />
            Chat de Inteligência Operacional
          </h2>
          <p className="text-[11px] text-slate-500 font-sans mt-0.5">
            Conectado aos módulos de POPs, Estoque de Químicos, Clientes e DRE Financeiro
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenHistory}
            className="px-3 py-1.5 bg-[#FAF9F5] border border-slate-200 hover:border-[#1B3A2D]/40 rounded-xl text-xs font-bold text-slate-700 hover:text-[#1B3A2D] flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs"
          >
            <History className="size-3.5 text-[#1B3A2D]" />
            <span>Histórico & Favoritos</span>
            {favoritesCount > 0 && (
              <span className="size-4 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={onClearMessages}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Limpar Conversa"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area or Welcome State */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6">
          <div className="size-16 rounded-3xl bg-[#FAF9F5] border border-slate-200 flex items-center justify-center text-[#1B3A2D] shadow-inner">
            <BrainCircuit className="size-8 text-[#2D6A4F]" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-base font-bold text-slate-800">Assistente IA Especializado</h3>
            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              Consulte procedimentos padrão (POPs), verifique saldos de químicos em estoque, simule margem de orçamentos e descubra clientes inativos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full text-left font-sans">
            {quickSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendMessage(item.label)}
                className="p-3 rounded-2xl border border-slate-200 bg-[#FAF9F5]/70 hover:border-[#1B3A2D] hover:bg-white text-slate-700 transition-all text-xs cursor-pointer shadow-3xs flex flex-col gap-1"
              >
                <span className="text-[9px] font-black uppercase text-[#2D6A4F] tracking-wider">
                  {item.category}
                </span>
                <span className="font-semibold text-slate-800">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#1B3A2D] text-white rounded-tr-xs shadow-3xs'
                    : 'bg-[#FAF9F5] border border-[#E8E6E1] text-slate-800 rounded-tl-xs shadow-3xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 border-b border-slate-200/40 pb-1">
                  <span className="text-[10px] font-bold opacity-75 uppercase tracking-wider font-sans">
                    {msg.role === 'user' ? 'Você' : 'Assistente PestFlow'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono opacity-60">{msg.timestamp}</span>
                    {msg.role === 'assistant' && (
                      <button
                        type="button"
                        onClick={() =>
                          onToggleFavorite(
                            msg.content.slice(0, 35) + '...',
                            messages[index - 1]?.content || msg.content.slice(0, 40),
                            'chat'
                          )
                        }
                        className="text-slate-400 hover:text-[#D4A017] p-0.5 cursor-pointer transition-colors"
                        title="Favoritar resposta"
                      >
                        <Star className="size-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="markdown-body">
                  <Markdown>{msg.content}</Markdown>
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex flex-wrap gap-1.5 items-center text-[10px]">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Fontes:</span>
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-slate-600 font-semibold"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-slate-600">
                <BrainCircuit className="size-4 animate-spin text-[#1B3A2D]" />
                <span>Consultando inteligência operacional...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message Input Bottom Container */}
      <div className="border-t border-slate-100 pt-3 mt-auto">
        <div className="flex gap-2 items-center">
          <textarea
            rows={1}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Pergunte qualquer coisa sobre a operação, químicos ou finanças..."
            className="flex-1 resize-none rounded-xl border border-[#E8E6E1] px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/15 focus:border-[#2D6A4F] bg-[#F7F6F3] font-sans"
          />
          <button
            type="button"
            onClick={() => onSendMessage()}
            disabled={chatLoading || !chatInput.trim()}
            className="size-10 bg-[#1B3A2D] text-white rounded-xl flex items-center justify-center hover:bg-[#2D6A4F] transition-colors disabled:opacity-40 cursor-pointer shadow-3xs shrink-0"
            title="Enviar consulta"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
