import React from 'react';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface POPsAIChatSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  aiChatQuery: string;
  setAiChatQuery: (val: string) => void;
  aiChatLog: Array<{ sender: 'user' | 'ia'; text: string }>;
  isAiLoading: boolean;
  onSubmitAiQuestion: (e: React.FormEvent) => void;
}

export function POPsAIChatSheet({
  isOpen,
  onOpenChange,
  aiChatQuery,
  setAiChatQuery,
  aiChatLog,
  isAiLoading,
  onSubmitAiQuestion,
}: POPsAIChatSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md md:max-w-lg w-full flex flex-col justify-between" id="ai-chat-assistent-box">
        <div>
          <SheetHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#1B3A2D] text-white rounded-lg shrink-0">
                <Sparkles className="size-4 text-emerald-300" />
              </div>
              <div className="text-left">
                <SheetTitle className="text-base font-extrabold text-slate-800">Biblioteca de Consulta IA</SheetTitle>
                <SheetDescription className="text-xs text-slate-400 font-semibold">Assistente Técnico & Diretrizes Operacionais</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* CHAT LOGS */}
          <div className="py-4 space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto" id="ai-chat-logs-screen">
            {aiChatLog.map((logMsg, lIdx) => (
              <div
                key={lIdx}
                className={`p-3 rounded-xl text-xs leading-relaxed font-sans ${
                  logMsg.sender === 'user'
                    ? 'bg-emerald-50 text-slate-800 ml-6 border border-emerald-150 text-right font-medium'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 mr-6 text-left font-normal'
                }`}
              >
                {logMsg.text}
              </div>
            ))}
            {isAiLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold px-2 animate-pulse">
                <RefreshCw className="size-3.5 animate-spin text-emerald-600" /> Buscando nas diretrizes operacionais...
              </div>
            )}
          </div>
        </div>

        {/* INPUT BAR */}
        <div className="pt-3 border-t border-slate-100">
          <form onSubmit={onSubmitAiQuestion} className="relative">
            <input
              type="text"
              value={aiChatQuery}
              onChange={(e) => setAiChatQuery(e.target.value)}
              placeholder="Ex: Como executar controle de cupins subterrâneos?"
              className="w-full h-11 pl-4 pr-12 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1B3A2D] bg-white font-medium shadow-xs"
            />
            <button
              type="submit"
              disabled={isAiLoading || !aiChatQuery.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-[#1B3A2D] text-white hover:bg-emerald-700 rounded-lg disabled:opacity-40 disabled:hover:bg-[#1B3A2D] transition-colors"
            >
              <ArrowRight className="size-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Respostas fundamentadas nos POPs, dosagens registradas e regras sanitárias da sua empresa.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
