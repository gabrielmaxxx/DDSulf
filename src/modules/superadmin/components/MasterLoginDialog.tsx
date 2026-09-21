import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  UserPlus,
  RefreshCw,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmpresaWithUserCount } from '@/services/superadmin/superAdminService';

export interface MasterLoginFormData {
  login: string;
  name: string;
  senhaTemporaria: string;
}

export interface MasterLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: EmpresaWithUserCount | null;
  onSubmit: (data: MasterLoginFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function MasterLoginDialog({
  open,
  onOpenChange,
  empresa,
  onSubmit,
  isSubmitting,
}: MasterLoginDialogProps) {
  const [formMasterLogin, setFormMasterLogin] = useState('');
  const [formMasterNome, setFormMasterNome] = useState('');
  const [formMasterSenha, setFormMasterSenha] = useState('');

  useEffect(() => {
    if (open) {
      setFormMasterLogin('');
      setFormMasterNome('');
      setFormMasterSenha('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMasterLogin.trim() || !formMasterSenha.trim()) {
      toast.error('Preencha login e senha temporária.');
      return;
    }
    await onSubmit({
      login: formMasterLogin.trim().toLowerCase(),
      name: formMasterNome.trim() || formMasterLogin.trim(),
      senhaTemporaria: formMasterSenha,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="md"
        className="bg-slate-900 border-slate-800 text-slate-100 p-6 space-y-5 rounded-3xl shadow-2xl [&_[data-slot=dialog-close]]:text-slate-400 [&_[data-slot=dialog-close]]:hover:text-white [&_[data-slot=dialog-close]]:hover:bg-slate-800"
      >
        <DialogHeader className="border-b border-slate-800 pb-3 flex flex-row items-center gap-2.5 space-y-0">
          <div className="size-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <UserPlus className="size-4" />
          </div>
          <div>
            <DialogTitle className="text-sm font-black text-white">Criar Conta Master</DialogTitle>
            <DialogDescription className="text-[10px] text-slate-400">
              {empresa?.nome || 'Empresa'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Login do Gestor *</label>
            <input
              type="text"
              placeholder="Ex: gestor, admin2"
              value={formMasterLogin}
              onChange={(e) => setFormMasterLogin(e.target.value.toLowerCase().trim())}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">
              Email gerado:{' '}
              <span className="font-mono text-slate-300">
                {formMasterLogin || 'login'}@{empresa?.empresaId || 'empresa'}.pestflow.local
              </span>
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Nome Completo</label>
            <input
              type="text"
              placeholder="Ex: Roberto Alcantara"
              value={formMasterNome}
              onChange={(e) => setFormMasterNome(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Senha Temporária *</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formMasterSenha}
              onChange={(e) => setFormMasterSenha(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  Criar Master
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MasterLoginDialog;
