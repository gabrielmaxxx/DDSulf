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
import { toast } from 'sonner';
import { Client } from '@/store';
import { Briefcase, User, Phone, Mail, AlertTriangle } from 'lucide-react';

interface ClientBillingDetailDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientBillingDetailDialog({
  client,
  open,
  onOpenChange
}: ClientBillingDetailDialogProps) {
  if (!client) return null;

  const handleWhatsAppAction = () => {
    toast.success(`Notificação automatizada gerada para ${client.name}!`, {
      description: `Disparo encaminhado para o e-mail ${client.email || 'financeiro cadastrado'}.`
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-6">
        <DialogHeader>
          <div className="flex items-center gap-1.5">
            <Briefcase className="size-4 text-[#D4A017]" />
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              Ficha de Cobrança / Reconciliável
            </span>
          </div>
          <DialogTitle className="mt-1 text-base font-extrabold text-slate-800">
            {client.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Dados cadastrais e histórico para regularização de pendências financeiras.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest font-black text-slate-400 block">
              Razão Social / Nome Fantasia
            </label>
            <p className="font-extrabold text-[#141410] text-sm flex items-center gap-1.5">
              <User className="size-4 text-slate-500" />
              {client.name}
            </p>
            <p className="text-[10.5px] font-medium text-slate-500 font-mono">
              CNPJ/CPF: {client.cnpjCpf || '⚠️ NÃO INFORMADO'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                Telefone Principal
              </span>
              <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="size-3.5 text-slate-400" />
                {client.phone || '⚠️ NÃO INFORMADO'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                E-mail de Faturamento
              </span>
              <p className="font-semibold text-slate-700 truncate flex items-center gap-1.5">
                <Mail className="size-3.5 text-slate-400" />
                {client.email || '⚠️ NÃO INFORMADO'}
              </p>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
              Endereço de Notificação
            </span>
            <p className="font-semibold text-[#141410] text-[11px] leading-relaxed">
              {client.address || '⚠️ NÃO INFORMADO'}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed space-y-1.5 mt-2">
            <p className="font-bold flex items-center gap-1">
              <AlertTriangle className="size-3.5 text-amber-700" />
              Procedimento Recomendado:
            </p>
            <p className="text-[11px]">
              Entre em contato utilizando os dados acima para notificar pendências de OS confirmadas.
              Encaminhe o boleto PDF atualizado via e-mail e registre o estorno ou acordo no Plano de Contas.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
          >
            Fechar
          </Button>
          <Button
            type="button"
            onClick={handleWhatsAppAction}
            className="px-4 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Gerar Cobrança por WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
