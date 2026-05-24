import React from 'react';
import { cn } from '@/lib/utils';

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function SectionContainer({ children, className, title, description, actions }: SectionContainerProps) {
  return (
    <div className={cn("bg-white border border-slate-100 rounded-2xl p-4 md:p-6 shadow-sm flex flex-col gap-4", className)}>
      {(title || description || actions) && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            {title && (
              <h3 className="font-sans font-semibold text-sm text-slate-900 leading-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-[11px] text-slate-500 font-normal">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-1.5 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
}
