import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, icon: Icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100/50">
        <Icon className="size-6 stroke-[1.5]" />
      </div>
      <h3 className="font-sans font-semibold text-base text-slate-900 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6 font-normal">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="bg-black hover:bg-slate-800 text-white font-medium rounded-lg px-4 h-9 text-xs transition-colors"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
