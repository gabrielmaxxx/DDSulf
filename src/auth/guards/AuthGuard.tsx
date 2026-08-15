import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../components/LoginScreen';
import { AuthLoading } from '../components/AuthLoading';
import { AlertOctagon, LogOut, PhoneCall } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Higher-Order Route Protection Guard to wrap sensitive client UI sections
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading, empresaSuspensa, isSuperAdmin, logout, empresaId } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Check company active suspension (bypass for superadmin)
  if (empresaSuspensa && !isSuperAdmin) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4 font-sans text-slate-100">
        <div className="w-full max-w-md bg-slate-800/90 border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="size-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <AlertOctagon className="size-8" />
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              Acesso Bloqueado
            </span>
            <h2 className="text-xl font-black text-white">Empresa com Acesso Suspenso</h2>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Esta empresa está com o acesso suspenso. Entre em contato com o suporte.
            </p>
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700/50 text-left text-xs space-y-2 text-slate-400">
            <div className="flex justify-between items-center text-slate-300 font-mono">
              <span>Identificador:</span>
              <span className="font-bold text-white uppercase">{empresaId || 'Tenant'}</span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <PhoneCall className="size-3.5 text-rose-400 shrink-0" />
              <span>Contate o administrador da plataforma para regularização.</span>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full h-11 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="size-4" />
            Sair da Conta
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthGuard;
