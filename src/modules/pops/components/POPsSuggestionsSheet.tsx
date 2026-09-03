import React from 'react';
import { UserCheck, AlertCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { SuggestedEdit } from '../types';

interface POPsSuggestionsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  suggestedEdits: SuggestedEdit[];
  onApproveSuggestion: (sug: SuggestedEdit) => void;
  onRejectSuggestion: (sugId: string) => void;
}

export function POPsSuggestionsSheet({
  isOpen,
  onOpenChange,
  suggestedEdits,
  onApproveSuggestion,
  onRejectSuggestion,
}: POPsSuggestionsSheetProps) {
  const pendingSuggestions = suggestedEdits.filter((s) => s.status === 'pendente');

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md md:max-w-lg w-full overflow-y-auto" id="collaborator-panel-suggestion">
        <SheetHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
              <UserCheck className="size-4" />
            </div>
            <div className="text-left">
              <SheetTitle className="text-base font-extrabold text-slate-800">
                Revisões Pendentes (Modelo B)
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-500 font-medium">
                Sugestões de melhorias técnicas propostas por colaboradores de campo.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-4 space-y-3" id="suggestion-alert-inbox">
          {pendingSuggestions.map((sug) => (
            <div
              key={sug.id}
              className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-left space-y-2.5"
              id={`sug-inbox-card-${sug.id}`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-[#1B3A2D]">{sug.proposer}</span>
                <span className="text-[11px] text-slate-400">{sug.date}</span>
              </div>
              <div className="text-xs text-slate-700 leading-relaxed font-medium">
                <strong className="text-slate-900 block mb-0.5">Ref: {sug.popName}</strong>
                <p className="bg-white/80 p-2.5 rounded-lg border border-amber-150 italic text-slate-800">
                  "{sug.content}"
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onApproveSuggestion(sug)}
                  className="px-3 py-1.5 bg-[#1B3A2D] text-white hover:bg-emerald-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Aprovar & Publicar
                </button>
                <button
                  onClick={() => onRejectSuggestion(sug.id)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-red-600 text-xs font-semibold rounded-lg transition-colors"
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}

          {pendingSuggestions.length === 0 && (
            <div className="text-center py-12 text-slate-400 font-medium text-xs space-y-2" id="sug-inbox-empty">
              <div className="p-3 bg-slate-50 rounded-full w-fit mx-auto text-slate-300">
                <AlertCircle className="size-6" />
              </div>
              <p className="text-slate-600 font-bold">Nenhuma sugestão técnica pendente</p>
              <p className="text-slate-400 text-[11px] max-w-xs mx-auto">
                Quando técnicos ou operadores sugerirem alterações em um POP pela Sala de Leitura, elas aparecerão aqui para validação técnica.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
