import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

// 1. Success Message Feedback Card
interface SuccessStateProps {
  title: string;
  description: string;
  onRetryLink?: string;
  onActionButton?: () => void;
  actionText?: string;
}

export function SuccessState({
  title,
  description,
  onRetryLink,
  onActionButton,
  actionText = 'Continuar'
}: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center text-center p-8 bg-white border border-slate-100 rounded-3xl space-y-4 max-w-sm mx-auto font-sans">
      <div className="size-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 animate-pulse">
        <CheckCircle2 className="size-6" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-black text-slate-900 tracking-tight">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed font-normal">{description}</p>
      </div>

      {onActionButton && (
        <button 
          onClick={onActionButton}
          className="w-full h-9 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold leading-none select-none transition-all cursor-pointer border border-transparent hover:border-slate-800"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

// 2. Error Message Feedback layout with action triggers
interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Falha no processamento',
  description,
  onRetry
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-rose-50/10 border border-rose-100 rounded-3xl space-y-4 max-w-sm mx-auto font-sans">
      <div className="size-11 rounded-xl bg-rose-100 border border-rose-200/50 flex items-center justify-center text-rose-600">
        <XCircle className="size-5" />
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-950 tracking-tight">{title}</h4>
        <p className="text-[11px] text-slate-500 leading-relaxed font-normal">{description}</p>
      </div>

      {onRetry && (
        <button 
          onClick={onRetry}
          className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-[10px] font-black tracking-wide uppercase flex items-center justify-center gap-1 transition-all cursor-pointer border border-slate-200"
        >
          <RefreshCw className="size-3" />
          Tentar Novamente
        </button>
      )}
    </div>
  );
}
