import React from 'react';
import { ChevronRight, Calendar, User, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

// 1. Fully-typed custom DataTable specifically for operating logs with premium border glow
interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({ data, columns, onRowClick, emptyMessage = 'Nenhuma informação registrada.' }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-100/80">
        <p className="text-xs text-slate-400 font-sans">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200/50 bg-white overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {columns.map((col, idx) => (
                <th key={idx} className={`p-4 font-bold text-slate-500 uppercase tracking-wider ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, rowIdx) => (
              <tr 
                key={rowIdx} 
                onClick={() => onRowClick?.(item)}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-slate-50/50 active:bg-slate-50' : ''
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`p-4 text-slate-700 font-medium ${col.className || ''}`}>
                    {col.accessor(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 2. Beautiful chronological activity Timeline for pest control milestones
interface TimelineEvent {
  title: string;
  description: string;
  timestamp: string;
  status: 'done' | 'pending' | 'warning';
  operator?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="size-4 text-emerald-650" />;
      case 'warning':
        return <AlertTriangle className="size-4 text-amber-650" />;
      case 'pending':
      default:
        return <Clock className="size-4 text-slate-450" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-emerald-50 border-emerald-100/50 text-emerald-600';
      case 'warning':
        return 'bg-amber-50 border-amber-100/50 text-amber-600';
      case 'pending':
      default:
        return 'bg-slate-100 border-slate-200/50 text-slate-500';
    }
  };

  return (
    <div className="space-y-5 relative pl-4 border-l border-slate-100 ml-2.5 font-sans">
      {events.map((event, idx) => (
        <div key={idx} className="relative space-y-1">
          {/* Indicator Dot overlay */}
          <div className={`absolute -left-[30px] top-1.5 size-7 rounded-lg border flex items-center justify-center shrink-0 ${getStatusBg(event.status)}`}>
            {getStatusIcon(event.status)}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h4 className="text-xs font-bold text-slate-900 leading-snug">{event.title}</h4>
            <span className="text-[10px] text-slate-400 font-bold font-mono">
              {new Date(event.timestamp).toLocaleDateString('pt-BR')} {new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
            {event.description}
          </p>

          {event.operator && (
            <div className="flex items-center gap-1 text-[10px] text-slate-450 font-semibold pt-1">
              <User className="size-3 text-slate-400" />
              <span>Operador: {event.operator}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// 3. Status Badge Utility Component
interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const formatted = status.toUpperCase();
  
  const getBadgeColors = () => {
    if (formatted.includes('APROVADO') || formatted.includes('SUCESSO') || formatted.includes('EXECUTA')) {
      return 'bg-emerald-50 border-emerald-100 text-emerald-700';
    }
    if (formatted.includes('PENDENTE') || formatted.includes('CONTRATO') || formatted.includes('ENVIADO')) {
      return 'bg-blue-50 border-blue-100 text-blue-700';
    }
    if (formatted.includes('CANCELADO') || formatted.includes('INATIVO') || formatted.includes('ALERTA')) {
      return 'bg-rose-50 border-rose-100 text-rose-700';
    }
    if (formatted.includes('RASCO') || formatted.includes('ORÇA')) {
      return 'bg-slate-50 border-slate-200 text-slate-600';
    }
    return 'bg-amber-50 border-amber-100 text-amber-700';
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[9px] font-black tracking-wider uppercase font-mono leading-none ${getBadgeColors()}`}>
      {status}
    </span>
  );
}
