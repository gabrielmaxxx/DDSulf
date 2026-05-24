import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ClipboardCheck, AlertTriangle, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/constants';

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1.5 shrink-0 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
      <Tooltip>
        <TooltipTrigger render={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(ROUTES.calculator)}
            className="size-8 rounded-lg hover:bg-white text-slate-600 hover:text-black hover:shadow-xs transition-all active:scale-95 duration-100"
          >
            <Calculator className="size-4" />
          </Button>
        } />
        <TooltipContent side="bottom" className="text-[10px] font-semibold bg-black text-white px-2 py-1">
          Nova Diluição / Orçamento
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(ROUTES.pops)}
            className="size-8 rounded-lg hover:bg-white text-slate-600 hover:text-black hover:shadow-xs transition-all active:scale-95 duration-100"
          >
            <ClipboardCheck className="size-4" />
          </Button>
        } />
        <TooltipContent side="bottom" className="text-[10px] font-semibold bg-black text-white px-2 py-1">
          Ver POPs de Campo
        </TooltipContent>
      </Tooltip>

      <div className="h-4 w-px bg-slate-200" />

      <Tooltip>
        <TooltipTrigger render={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(ROUTES.ai)}
            className="size-8 rounded-lg bg-black text-white hover:bg-slate-800 hover:shadow-2xs transition-all active:scale-95 duration-100"
          >
            <PlusCircle className="size-4.5" />
          </Button>
        } />
        <TooltipContent side="bottom" className="text-[10px] font-semibold bg-black text-white px-2 py-1">
          IA Assistente Rápido
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
