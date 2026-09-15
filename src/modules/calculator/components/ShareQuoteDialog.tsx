import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Calendar, CheckCircle } from 'lucide-react';

interface ShareQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generatedQuotePayload: any;
  shareableText: string;
  isCopied: boolean;
  handleCopyText: () => void;
  serviceGeneratedStatus: boolean;
  handleCreateAgendaServiceFromQuote: () => void;
  selectedClient: any | null;
  onNavigateToClient?: () => void;
  onCloseAndReset: () => void;
}

export function ShareQuoteDialog({
  open,
  onOpenChange,
  generatedQuotePayload,
  shareableText,
  isCopied,
  handleCopyText,
  serviceGeneratedStatus,
  handleCreateAgendaServiceFromQuote,
  selectedClient,
  onNavigateToClient,
  onCloseAndReset
}: ShareQuoteDialogProps) {
  if (!generatedQuotePayload) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="space-y-4">
        <DialogHeader>
          <span className="px-2.5 py-0.5 rounded-md font-mono text-[9px] font-bold border border-sky-200 uppercase bg-sky-50 text-sky-700 inline-block w-fit">
            Orçamento Gerado com Sucesso!
          </span>
          <DialogTitle className="text-lg font-black text-slate-900">
            Proposta Comercial Sanitária
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-semibold">
            O orçamento comercial foi salvo nos registros operacionais. Use o gabarito profissional abaixo formatado para enviar diretamente no WhatsApp ou E-mail corporativo do cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* COPYABLE MODEL PRE CONTAINER */}
          <div className="relative">
            <pre className="p-4 bg-slate-950 text-white rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[220px] overflow-y-auto w-full max-w-full">
              {shareableText}
            </pre>
            
            <button
              type="button"
              onClick={handleCopyText}
              className="absolute top-3 right-3 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-1 font-sans text-[10px] font-bold cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="size-3.5 text-emerald-400" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copiar Texto
                </>
              )}
            </button>
          </div>

          {/* VINCULADO GERAR SERVICO FLUXOS ACTION BAR */}
          <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl space-y-3">
            <div className="flex gap-2 text-xs">
              <span className="text-base leading-none">💡</span>
              <div className="space-y-0.5">
                <p className="font-extrabold text-slate-800">Mudar para serviço agendado</p>
                <p className="text-[11px] text-slate-500">Gere uma visita correspondente na agenda e organize as OS da equipe técnica.</p>
              </div>
            </div>

            {serviceGeneratedStatus ? (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="size-4 text-emerald-600" />
                <span>Visita agendada para hoje na agenda técnica!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCreateAgendaServiceFromQuote}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Calendar className="size-4" />
                <span>Gerar Serviço na Agenda Operacional</span>
              </button>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          {selectedClient && onNavigateToClient ? (
            <Button
              type="button"
              variant="outline"
              onClick={onNavigateToClient}
              className="text-[10px] font-extrabold uppercase rounded-xl"
            >
              Abrir Perfil do Cliente
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            onClick={onCloseAndReset}
            className="bg-[#1B3A2D] hover:bg-[#1B3A2D]/90 text-white font-extrabold uppercase text-[10px] px-6 rounded-xl shadow-xs"
          >
            Concluído
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
