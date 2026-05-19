import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({ 
  title, 
  description, 
  children,
  className
}: { 
  title: string; 
  description?: string; 
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100", className)}>
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tightest text-black">{title}</h1>
        {description && <p className="text-lg text-[#6B7280] font-medium">{description}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </header>
  );
}

export function ViewContainer({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700", className)}>
      {children}
    </div>
  );
}
