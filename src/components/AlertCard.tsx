import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertCardProps {
  variant?: AlertVariant;
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, { container: string; title: string; text: string; icon: LucideIcon; bgIcon: string }> = {
  info: {
    container: 'bg-blue-50/50 border-blue-100',
    title: 'text-blue-900',
    text: 'text-blue-700',
    icon: Info,
    bgIcon: 'bg-blue-100 text-blue-800'
  },
  success: {
    container: 'bg-emerald-50/50 border-emerald-100',
    title: 'text-emerald-900',
    text: 'text-emerald-700',
    icon: CheckCircle2,
    bgIcon: 'bg-emerald-100 text-emerald-800'
  },
  warning: {
    container: 'bg-amber-50/50 border-amber-200',
    title: 'text-amber-900',
    text: 'text-amber-700',
    icon: AlertTriangle,
    bgIcon: 'bg-amber-100 text-amber-800'
  },
  error: {
    container: 'bg-rose-50/50 border-rose-100',
    title: 'text-rose-900',
    text: 'text-rose-700',
    icon: XCircle,
    bgIcon: 'bg-rose-100 text-rose-800'
  }
};

export function AlertCard({ variant = 'info', title, description, icon, action, className }: AlertCardProps) {
  const styles = variantStyles[variant];
  const IconComponent = icon || styles.icon;

  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border min-h-[96px] text-left transition-all duration-300", styles.container, className)}>
      <div className="flex gap-4 items-start sm:items-center">
        <div className={cn("size-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm", styles.bgIcon)}>
          <IconComponent className="size-5 shrink-0" />
        </div>
        <div className="space-y-1">
          <h4 className={cn("font-sans font-bold text-sm", styles.title)}>
            {title}
          </h4>
          <p className={cn("text-xs leading-relaxed font-medium", styles.text)}>
            {description}
          </p>
        </div>
      </div>
      {action && (
        <div className="sm:ml-auto w-full sm:w-auto shrink-0 flex justify-end">
          {action}
        </div>
      )}
    </div>
  );
}
