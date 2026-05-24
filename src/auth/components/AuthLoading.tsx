import React from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';

export function AuthLoading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50/70 p-6 font-sans">
      <div className="w-full max-w-md flex flex-col items-center text-center space-y-6 animate-pulse">
        {/* Logo/Icon Container */}
        <div className="relative flex items-center justify-center size-16 rounded-2xl bg-slate-900 shadow-lg shadow-slate-950/10">
          <ShieldAlert className="size-8 text-white animate-bounce" />
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-emerald-500 ring-2 ring-white animate-ping" />
        </div>

        {/* Title and details */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">DDSulf Operational Platform</h2>
          <p className="text-xs text-slate-500 font-medium font-mono">Verificando chaves de segurança e sessão ativa...</p>
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
          <Loader2 className="size-4 animate-spin text-slate-900" />
          <span className="text-xs font-semibold text-slate-600">Sincronizando cache local...</span>
        </div>

        {/* Skeleton content cards */}
        <div className="w-full space-y-3 mt-4">
          <div className="h-10 bg-slate-100/80 rounded-xl" />
          <div className="h-24 bg-slate-100/80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default AuthLoading;
