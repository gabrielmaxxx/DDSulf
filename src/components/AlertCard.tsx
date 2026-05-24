import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertCardProps {
  variant?: AlertVariant;
  title: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
}

const variantStyles: Record<AlertVariant, { container: string; text: string; icon: LucideIcon; bgIcon: string }> = {
  info: {
    container: 'bg-blue-50/50 border-blue-100',
    text: 'text-blue-800',
    icon: Info,
    bgIcon: 'bg-blue-100 text-blue-600'
  },
  success: {
    container: 'bg-emerald-50/50 border-emerald-100',
    text: 'text-emerald-800',
    icon: CheckCircle2,
    bgIcon: 'bg-emerald-100 text-emerald-600'
  },
  warning: {
    container: 'bg-amber-50/50 border-amber-100',
    text: 'text-amber-800',
    icon: AlertCircle,
    bgIcon: 'bg-amber-100 text-amber-600'
  },
  error: {
    container: 'bg-rose-50/50 border-rose-100',
    text: 'text-rose-800',
    icon: XCircle,
    bgIcon: 'bg-rose-100 text-rose-600'
  }
};

export function AlertCard({ variant = 'info', title, description, icon, className }: AlertCardProps) {
  const styles = variantStyles[variant];
  const IconComponent = icon || styles.icon;

  return (
    <div className={cn("flex gap-3.5 p-4 rounded-xl border", styles.container, className)}>
      <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", styles.bgIcon)}>
        <IconComponent className="size-4" />
      </div>
      <div className="space-y-0.5">
        <h4 className={cn("font-sans font-semibold text-sm", styles.text)}>
          {title}
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed font-normal">
          {description}
        </p>
      </div>
    </div>
  );
}
