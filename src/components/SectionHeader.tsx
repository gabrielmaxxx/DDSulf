import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between pb-4 border-b border-slate-100 mb-4", className)}>
      <div className="space-y-0.5">
        <h2 className="font-sans font-semibold text-lg tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 font-normal">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
