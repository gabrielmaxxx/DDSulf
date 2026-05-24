import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  fullscreen?: boolean;
}

export function LoadingState({ message = "Carregando dados...", fullscreen = false }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${fullscreen ? 'h-screen w-screen' : 'min-h-[200px]'}`}>
      <Loader2 className="size-6 text-black animate-spin mb-3" />
      <span className="text-xs text-slate-500 font-mono tracking-widest uppercase">{message}</span>
    </div>
  );
}
