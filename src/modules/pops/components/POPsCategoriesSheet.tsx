import React from 'react';
import { BookOpen, ChevronDown, ChevronRight, Check } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { CATEGORIES_TREE, ExtendedPOP } from '../types';

interface POPsCategoriesSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeCategory: string | null;
  activeSubcategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onSelectSubcategory: (subcategory: string | null) => void;
  onSelectFilter: (filter: string) => void;
  procedures: ExtendedPOP[];
}

export function POPsCategoriesSheet({
  isOpen,
  onOpenChange,
  activeCategory,
  activeSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  onSelectFilter,
  procedures,
}: POPsCategoriesSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="sm:max-w-md w-full overflow-y-auto" id="categories-sheet-content">
        <SheetHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-[#1B3A2D] rounded-lg">
                <BookOpen className="size-4" />
              </div>
              <SheetTitle className="text-base font-extrabold text-slate-800">Diretório de Pastas</SheetTitle>
            </div>
            <button
              onClick={() => {
                onSelectCategory(null);
                onSelectSubcategory(null);
                onSelectFilter('Todos');
              }}
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              Limpar Seleção
            </button>
          </div>
          <SheetDescription className="text-xs text-slate-500 text-left">
            Navegue pelas pastas e subpastas corporativas para filtrar os POPs correspondentes.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-2" id="tree-container">
          {CATEGORIES_TREE.map((node) => {
            const isCatActive = activeCategory === node.name;
            const hasSubs = node.subs.length > 0;
            const count = node.name === 'Treinamentos' 
              ? 2 
              : procedures.filter(p => p.category === node.name).length;

            return (
              <div key={node.name} className="space-y-1">
                <button
                  id={`tree-node-${node.name.toLowerCase()}`}
                  onClick={() => {
                    const nextCat = isCatActive && !activeSubcategory ? null : node.name;
                    onSelectCategory(nextCat);
                    onSelectSubcategory(null);
                    onSelectFilter(node.name === 'Treinamentos' ? 'Treinamentos' : 'Todos');
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                    isCatActive
                      ? 'bg-emerald-50 text-[#1B3A2D] font-bold border border-emerald-100'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${isCatActive ? 'bg-emerald-600' : 'bg-slate-350'}`} />
                    <span>{node.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({count})</span>
                  </span>
                  {hasSubs && (
                    <span className="text-slate-450 shrink-0">
                      {isCatActive ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                    </span>
                  )}
                </button>

                {/* SUBCATEGORIES SLIDE PANEL */}
                {hasSubs && isCatActive && (
                  <div className="pl-4 border-l-2 border-emerald-200 ml-3 py-1 space-y-1" id={`sub-tree-${node.name.toLowerCase()}`}>
                    {node.subs.map((subName) => {
                      const isSubActive = activeSubcategory === subName;
                      const subCount = procedures.filter(p => p.subcategory === subName).length;
                      return (
                        <button
                          key={subName}
                          id={`sub-tree-node-${subName.toLowerCase().replace(/ /g, '-')}`}
                          onClick={() => {
                            onSelectSubcategory(isSubActive ? null : subName);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded text-xs font-medium text-left transition-all ${
                            isSubActive
                              ? 'text-emerald-700 bg-emerald-50/70 font-bold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <span>{subName} <span className="text-[10px] text-slate-400">({subCount})</span></span>
                          {isSubActive && <Check className="size-3.5 text-emerald-600 ml-1 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
