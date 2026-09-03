import React from 'react';
import { History, Star, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { FavoriteItem, HistoryItem } from '../types';

interface AIChatHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: HistoryItem[];
  favorites: FavoriteItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onSelectFavorite: (item: FavoriteItem) => void;
  onRemoveFavorite: (id: string) => void;
}

export const AIChatHistorySheet: React.FC<AIChatHistorySheetProps> = ({
  open,
  onOpenChange,
  history,
  favorites,
  onSelectHistory,
  onSelectFavorite,
  onRemoveFavorite,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-6 flex flex-col gap-6 text-left">
        <SheetHeader className="border-b border-slate-100 pb-3">
          <SheetTitle className="text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
            <History className="size-4.5 text-[#1B3A2D]" />
            Histórico & Favoritos
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-500 font-sans">
            Suas interações anteriores, diagnósticos e análises salvas.
          </SheetDescription>
        </SheetHeader>

        {/* HISTÓRICO DE CONSULTAS */}
        <div className="text-left select-none">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
            <History className="size-4 text-slate-600" />
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider font-sans">
              Histórico de Consultas
            </h3>
          </div>
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {history.slice(0, 8).map((h) => (
              <div
                key={h.id}
                className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 hover:bg-[#FAF9F5] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-medium text-slate-400">{h.date}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[8px] font-bold font-sans">
                    Resolvido
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onSelectHistory(h);
                  }}
                  className="text-left text-[11px] font-bold text-slate-700 hover:text-[#1B3A2D] leading-tight block w-full truncate cursor-pointer font-sans"
                  title={h.query}
                >
                  {h.title}
                </button>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-[10px] text-slate-400 font-sans italic text-center py-3">
                Nenhuma consulta recente registrada.
              </p>
            )}
          </div>
        </div>

        {/* FAVORITOS SALVOS */}
        <div className="text-left select-none">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
            <Star className="size-4 text-[#D4A017] fill-[#D4A017]/20" />
            <h3 className="text-xs font-black uppercase text-[#141410] tracking-wider font-sans">
              Meus Favoritos ({favorites.length})
            </h3>
          </div>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#1B3A2D]/30 hover:bg-[#FAF9F5] flex items-center justify-between gap-2 text-[11px] transition-all"
              >
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onSelectFavorite(fav);
                  }}
                  className="flex-1 text-left font-bold text-slate-700 hover:text-[#1B3A2D] transition-colors leading-tight truncate cursor-pointer font-sans"
                >
                  ⭐ {fav.title}
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveFavorite(fav.id)}
                  className="text-slate-300 hover:text-[#C1361A] p-1 rounded hover:bg-rose-50 cursor-pointer shrink-0 transition-colors"
                  title="Remover dos favoritos"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            {favorites.length === 0 && (
              <p className="text-[10px] text-slate-400 font-sans italic text-center py-3">
                Nenhum favorito salvo até o momento.
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
