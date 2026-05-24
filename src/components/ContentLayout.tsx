import React from 'react';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface ContentLayoutProps {
  children: React.ReactNode;
  title: string;
  category?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function ContentLayout({ children, title, category, description, actions, className }: ContentLayoutProps) {
  return (
    <div className={cn("flex flex-col flex-1 px-4 md:px-8 py-6 w-full max-w-7xl mx-auto space-y-6 md:space-y-8", className)}>
      <div className="flex flex-col gap-3">
        <Breadcrumbs />
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5">
          <div className="space-y-1">
            {category && (
              <span className="font-mono text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                {category}
              </span>
            )}
            <h1 className="font-display font-semibold text-xl md:text-2xl tracking-tight text-slate-900 leading-none">
              {title}
            </h1>
            {description && (
              <p className="text-xs text-slate-500 max-w-2xl font-normal leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
              {actions}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
}
