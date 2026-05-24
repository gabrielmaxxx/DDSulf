import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import { PricingAlert as AlertType } from '../types';

interface PricingAlertProps {
  alert: AlertType;
}

export function PricingAlert({ alert }: PricingAlertProps) {
  const isErr = alert.type === 'error';
  const isWarn = alert.type === 'warning';

  return (
    <div
      role="alert"
      className={`border px-5 py-4 rounded-2xl flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
        isErr
          ? 'bg-rose-50/90 border-rose-200 text-rose-900'
          : isWarn
          ? 'bg-amber-50/90 border-amber-200 text-amber-900'
          : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
      }`}
    >
      <div className="mt-1 shrink-0">
        {isErr ? (
          <ShieldAlert className="size-5 text-rose-600" />
        ) : isWarn ? (
          <AlertTriangle className="size-5 text-amber-600" />
        ) : (
          <CheckCircle className="size-5 text-emerald-600" />
        )}
      </div>
      <div>
        <h5 className="text-xs font-black uppercase tracking-wider">{alert.title}</h5>
        <p className="text-xs opacity-90 mt-1 font-medium leading-relaxed">{alert.message}</p>
        {alert.actionRequired && (
          <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#111827] bg-white/60 inline-block px-2 py-0.5 rounded">
            Fator corretor: {alert.actionRequired}
          </div>
        )}
      </div>
    </div>
  );
}
