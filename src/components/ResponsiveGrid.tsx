import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 'auto';
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}

const gapStyles = {
  sm: 'gap-3 md:gap-4',
  md: 'gap-4 md:gap-6',
  lg: 'gap-6 md:gap-8'
};

export function ResponsiveGrid({ children, cols = 3, className, gap = 'md' }: ResponsiveGridProps) {
  const colStyles = 
    cols === 1 ? 'grid-cols-1' :
    cols === 2 ? 'grid-cols-1 sm:grid-cols-2' :
    cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
    cols === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <div className={cn("grid w-full", colStyles, gapStyles[gap], className)}>
      {children}
    </div>
  );
}
