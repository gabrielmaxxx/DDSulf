import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Building2,
  ChevronRight,
  Check,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export interface CreateTenantFormData {
  empresaId: string;
  nome: string;
  cnpj: string;
  plano: string;
  finStatus: 'em_dia' | 'atrasado';
  masterLogin: string;
  masterNome: string;
  masterSenha: string;
}

export interface CreateEmpresaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTenantFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateEmpresaDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateEmpresaDialogProps) {
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [formEmpresaId, setFormEmpresaId] = useState('');
  const [formNome, setFormNome] = useState('');
  const [formCnpj, setFormCnpj] = useState('');
  const [formPlano, setFormPlano] = useState('standard');
  const [formFinStatus, setFormFinStatus] = useState<'em_dia' | 'atrasado'>('em_dia');
  const [formMasterLogin, setFormMasterLogin] = useState('master');
  const [formMasterNome, setFormMasterNome] = useState('');
  const [formMasterSenha, setFormMasterSenha] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCreateStep(1);
      setFormEmpresaId('');
      setFormNome('');
      setFormCnpj('');
      setFormPlano('standard');
      setFormFinStatus('em_dia');
      setFormMasterLogin('master');
      setFormMasterNome('');
      setFormMasterSenha('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createStep === 1) {
      if (!formEmpresaId.trim() || !formNome.trim()) {
        toast.error('Identificador e Nome da Empresa são obrigatórios.');
        return;
      }
      setCreateStep(2);
      return;
    }

    if (!formMasterLogin.trim() || !formMasterSenha.trim()) {
      toast.error('Login e Senha da Conta Master são obrigatórios.');
      return;
    }

    await onSubmit({
      empresaId: formEmpresaId.trim().toLowerCase(),
      nome: formNome.trim(),
      cnpj: formCnpj.trim(),
      plano: formPlano,
      finStatus: formFinStatus,
      masterLogin: formMasterLogin.trim().toLowerCase(),
      masterNome: formMasterNome.trim() || formNome.trim(),
      masterSenha: formMasterSenha,
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
            <Building2 className="size-4" />
          </div>
          <div>
            <DialogTitle className="text-sm font-black text-white">
              Cadastrar Nova Empresa
            </DialogTitle>
            <DialogDescription className="text-[10px] text-slate-400">
              Etapa {createStep} de 2 — {createStep === 1 ? 'Dados da Empresa (Tenant)' : 'Configuração da Conta Master'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {createStep === 1 ? (
            /* STEP 1: Dados da Empresa */
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Identificador do Tenant (empresaId) *
                </label>
                <input
                  type="text"
                  placeholder="Ex: minha-empresa, dedetizadora-sul"
                  value={formEmpresaId}
                  onChange={(e) =>
                    setFormEmpresaId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  }
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Apenas letras minúsculas, números e hífen. Usado no isolamento do banco.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Razão Social / Nome da Empresa *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dedetizadora Exemplo e Controle de Pragas"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={formCnpj}
                    onChange={(e) => setFormCnpj(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Plano Inicial</label>
                  <select
                    value={formPlano}
                    onChange={(e) => setFormPlano(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Status Financeiro Inicial</label>
                <select
                  value={formFinStatus}
                  onChange={(e) => setFormFinStatus(e.target.value as 'em_dia' | 'atrasado')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="em_dia">Em Dia (Regular)</option>
                  <option value="atrasado">Atrasado (Pendente)</option>
                </select>
              </div>
            </div>
          ) : (
            /* STEP 2: Conta Master Inicial */
            <div className="space-y-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-200">
                Agora configure o usuário <strong>Master</strong> que administrará a empresa{' '}
                <strong>{formNome}</strong>.
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Login do Gestor Master *</label>
                <input
                  type="text"
                  placeholder="Ex: master, admin, gabriel"
                  value={formMasterLogin}
                  onChange={(e) => setFormMasterLogin(e.target.value.toLowerCase().trim())}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  O email de autenticação gerado será:{' '}
                  <span className="font-mono text-slate-300">
                    {formMasterLogin || 'login'}@{formEmpresaId || 'empresa'}.pestflow.local
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Nome Completo do Gestor</label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={formMasterNome}
                  onChange={(e) => setFormMasterNome(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Senha Temporária Inicial *</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formMasterSenha}
                  onChange={(e) => setFormMasterSenha(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {createStep === 2 ? (
              <button
                type="button"
                onClick={() => setCreateStep(1)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              >
                Voltar
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  Processando...
                </>
              ) : createStep === 1 ? (
                <>
                  Próximo (Conta Master)
                  <ChevronRight className="size-3.5" />
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  Finalizar Cadastro
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateEmpresaDialog;
