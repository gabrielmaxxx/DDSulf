import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glossy?: boolean;
}

export function PremiumGlassCard({ children, className, glossy = false, ...props }: PremiumGlassCardProps) {
  return (
    <div 
      className={cn(
        "rounded-[32px] border border-gray-100/80 bg-white shadow-xs p-8 relative overflow-hidden transition-all hover:shadow-md",
        glossy && "bg-white/80 backdrop-blur-md border-white/60",
        className
      )}
      {...props}
    >
      {/* Absolute subtle glowing grid backdrops for high-end feel */}
      <div className="absolute inset-0 bg-radial from-transparent to-gray-50/10 pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
