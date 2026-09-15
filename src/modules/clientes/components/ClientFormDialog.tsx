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
import { Check } from 'lucide-react';

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  name: string;
  setName: (v: string) => void;
  cnpjCpf: string;
  setCnpjCpf: (v: string) => void;
  clientType: 'B2B' | 'B2C';
  setClientType: (v: 'B2B' | 'B2C') => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  mode,
  name,
  setName,
  cnpjCpf,
  setCnpjCpf,
  clientType,
  setClientType,
  phone,
  setPhone,
  email,
  setEmail,
  address,
  setAddress,
  onSubmit,
}: ClientFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" id="dialog-client-form">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Cadastrar Novo Cliente' : 'Editar Dados do Cliente'}
          </DialogTitle>
          <DialogDescription>
            Cadastre dados fiscais básicos e informações principais do cliente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">
              Nome Relevante / Razão Social *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Restaurante Bom Sabor Ltda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">
                CPF / CNPJ
              </label>
              <input
                type="text"
                placeholder="Ex: 12.345.678/0001-90"
                value={cnpjCpf}
                onChange={(e) => setCnpjCpf(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">
                Perfil do Cliente
              </label>
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value as any)}
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none h-[34px]"
              >
                <option value="B2B">🏢 B2B (Corporativo / Condomínio)</option>
                <option value="B2C">👤 B2C (Pessoa Física / Residencial)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">
                Telefone de Contato
              </label>
              <input
                type="text"
                placeholder="Ex: (24) 3340-9900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">
                E-mail para Faturas
              </label>
              <input
                type="email"
                placeholder="Ex: contato@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">
              Endereço Completo
            </label>
            <textarea
              placeholder="Ex: Rua das Flores, 450 - Curitiba - PR"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-[#FAF9F6] flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#141410] text-[10px] font-black uppercase tracking-wider rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="px-5 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1 font-semibold"
            >
              <Check className="size-3.5" /> Salvar Cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
