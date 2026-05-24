import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  category?: string;
  className?: string;
}

export function PageHeader({ title, description, actions, category, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6 border-slate-100", className)}>
      <div className="space-y-1.5">
        {category && (
          <div className="inline-flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              {category}
            </span>
          </div>
        )}
        <h1 className="font-sans font-bold text-2xl md:text-3xl tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 max-w-xl font-normal leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
