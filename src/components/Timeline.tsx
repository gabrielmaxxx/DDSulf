import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  icon?: LucideIcon;
  variant?: 'brand' | 'success' | 'warning' | 'info' | 'danger';
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  if (!events || events.length === 0) {
    return (
      <p className="text-xs text-slate-400 font-semibold italic text-center py-4">
        Nenhum evento registrado na linha do tempo.
      </p>
    );
  }

  return (
    <div className={cn("relative pl-8 border-l-2 border-slate-200/60 ml-4.5 space-y-8 py-2 text-left", className)}>
      {events.map((event) => {
        const IconComponent = event.icon;
        return (
          <div key={event.id} className="relative group">
            {/* Bullet node dot */}
            <div className={cn(
              "absolute -left-[39px] top-1 size-4.5 rounded-full border-4 border-white flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-125",
              event.variant === 'brand' && "bg-[#1B3A2D] ring-4 ring-[#1B3A2D]/10",
              event.variant === 'success' && "bg-emerald-500 ring-4 ring-emerald-100",
              event.variant === 'warning' && "bg-amber-500 ring-4 ring-amber-100",
              event.variant === 'info' && "bg-blue-500 ring-4 ring-blue-100",
              event.variant === 'danger' && "bg-red-500 ring-4 ring-rose-100",
              !event.variant && "bg-slate-400 ring-4 ring-slate-100"
            )}>
              {IconComponent && <IconComponent className="size-2 text-white shrink-0" />}
            </div>

            {/* Event label content */}
            <div className="space-y-1.5 pl-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                <h4 className="font-sans font-extrabold text-sm text-slate-800 tracking-tight leading-none group-hover:text-[#1B3A2D] transition-colors">
                  {event.title}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 font-sans tracking-widest uppercase shrink-0">
                  {event.date} {event.time && `• ${event.time}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold max-w-2xl">
                {event.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
