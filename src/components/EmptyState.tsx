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
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 bg-white border border-slate-200/50 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.01)] w-full">
      <div className="size-14 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-center text-[#1B3A2D] mb-5 shadow-sm">
        <Icon className="size-6 stroke-[2]" />
      </div>
      <h3 className="font-sans font-bold text-lg text-slate-800 mb-1.5 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed font-medium">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          variant="default"
          size="default"
          className="shadow-sm"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
