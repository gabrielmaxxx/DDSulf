import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Lock, Check, AlertCircle } from 'lucide-react';
import { AuthService } from '@/auth/services/auth';
import { toast } from 'sonner';

export function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Preencha todos os campos de senha.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('A confirmação da nova senha não confere.');
      return;
    }

    setLoading(true);
    try {
      await AuthService.changePassword(currentPassword, newPassword);
      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Erro ao alterar senha:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('A senha atual está incorreta.');
      } else {
        setErrorMsg(err.message || 'Erro ao alterar a senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[32px] p-8 space-y-6" id="change-password-section">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="p-2.5 bg-slate-100 rounded-xl">
          <Key className="size-5 text-black" />
        </div>
        <div>
          <h3 className="text-lg font-black text-black">Alteração de Senha</h3>
          <p className="text-xs text-gray-400">Atualize sua credencial de acesso individual à plataforma.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs">
          <AlertCircle className="size-4.5 text-rose-600 shrink-0 mt-0.5" />
          <p className="font-semibold">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
            Senha Atual
          </label>
          <div className="relative flex items-center">
            <Lock className="size-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha atual..."
              className="w-full h-11 pl-10 pr-4 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
            Nova Senha
          </label>
          <div className="relative flex items-center">
            <Lock className="size-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha (mín. 6 caracteres)..."
              className="w-full h-11 pl-10 pr-4 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
            Confirmar Nova Senha
          </label>
          <div className="relative flex items-center">
            <Lock className="size-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha..."
              className="w-full h-11 pl-10 pr-4 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-mono"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl px-6 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Check className="size-4" />
          {loading ? 'Atualizando...' : 'Atualizar Senha'}
        </Button>
      </form>
    </Card>
  );
}
