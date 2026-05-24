import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { Role } from '../types';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallback?: React.ReactNode;
}

/**
 * Access protection based on User roles
 */
export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { role, loading } = useAuth();
  const { simulateRole } = useRole();

  if (loading) {
    return null;
  }

  const hasAccess = role && allowedRoles.includes(role);

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-200/50">
        <div className="max-w-md text-center space-y-5">
          <div className="size-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="size-6 text-amber-600 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Módulo Restrito</h3>
            <p className="text-slate-500 text-xs leading-normal">
              Seu perfil operacional (<span className="font-bold underline">{role}</span>) não possui privilégios de acesso a esta ferramenta.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button 
              onClick={() => window.location.href = '/'}
              className="h-8 rounded-lg px-3 bg-slate-900 text-white text-[10px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-black transition-all"
            >
              <ArrowLeft className="size-3.5" />
              Voltar ao Início
            </button>
            <button 
              onClick={() => simulateRole('admin')}
              className="h-8 rounded-lg px-3 bg-white border border-slate-200 text-slate-700 text-[10px] font-black flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 transition-all font-mono"
            >
              <RefreshCw className="size-3 text-amber-500" />
              Simular Admin Bypass
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RoleGuard;
