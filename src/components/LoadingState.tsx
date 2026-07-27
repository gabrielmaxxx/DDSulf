import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  message?: string;
  fullscreen?: boolean;
}

export function LoadingState({ message, fullscreen = false }: LoadingStateProps) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8FAFC]/90 backdrop-blur-sm flex flex-col justify-center items-center gap-4">
        <div className="w-[320px] bg-white border border-slate-200/50 p-6 rounded-2xl shadow-lg space-y-4">
          <div className="flex gap-4 items-center">
            <Skeleton className="size-11 rounded-2xl bg-slate-100 shrink-0 animate-pulse" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-4.5 w-1/2 bg-slate-100 animate-pulse" />
              <Skeleton className="h-3 w-3/4 bg-slate-100 animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center pt-2">
            {message || "PREPARANDO SISTEMA PESTFLOW..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200/40 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex gap-4 items-center">
              <Skeleton className="size-11 rounded-2xl bg-slate-100 shrink-0 animate-pulse" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-1/3 bg-slate-100 animate-pulse" />
                <Skeleton className="h-3 w-1/2 bg-slate-100 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-[48px] w-full bg-slate-50 border border-slate-100 animate-pulse rounded-xl" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4.5 w-1/4 bg-slate-100 animate-pulse" />
                <Skeleton className="h-4.5 w-1/3 bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
