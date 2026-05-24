import React from 'react';
import { Sparkles, FlaskConical, PlusCircle, CheckCircle2 } from 'lucide-react';
import { ProductCostItem } from '../types';

interface CostCompositionCardProps {
  chemicalDatabase: ProductCostItem[];
  selectedProducts: ProductCostItem[];
  toggleProduct: (item: ProductCostItem) => void;
  updateProductDosage: (id: string, dosage: number) => void;
  areaSize: number;
}

export function CostCompositionCard({
  chemicalDatabase,
  selectedProducts,
  toggleProduct,
  updateProductDosage,
  areaSize
}: CostCompositionCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1">
            Composição Química Diferenciada <FlaskConical className="size-4 text-black" />
          </label>
          <span className="text-[10px] text-[#9CA3AF] block">Dosagens técnicas personalizadas por m²</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2.5 py-1 rounded-full">
          {selectedProducts.length} Ativo{selectedProducts.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid gap-3.5 max-h-[320px] overflow-y-auto pr-1">
        {chemicalDatabase.map((chem) => {
          const isSelected = selectedProducts.some(p => p.id === chem.id);
          const activeInstance = selectedProducts.find(p => p.id === chem.id);
          
          return (
            <div
              key={chem.id}
              onClick={() => toggleProduct(chem)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 group text-left ${
                isSelected
                  ? 'border-black bg-[#FAFAFA] shadow-sm'
                  : 'border-[#E5E7EB] hover:border-[#9CA3AF] bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-all ${
                    isSelected ? 'bg-black text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}>
                    <FlaskConical className="size-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#111827] block leading-tight">{chem.name}</span>
                    <span className="text-[10px] text-[#6B7280] font-medium block mt-0.5">
                      Custo Base: R$ {chem.unitCost.toFixed(2)} por {chem.unitLabel}
                    </span>
                  </div>
                </div>
                <div>
                  {isSelected ? (
                    <CheckCircle2 className="size-5 text-black" />
                  ) : (
                    <PlusCircle className="size-5 text-[#D1D5DB] group-hover:text-black transition-colors" />
                  )}
                </div>
              </div>

              {isSelected && activeInstance && (
                <div
                  className="bg-white p-3 rounded-xl border border-[#E5E7EB] space-y-2 mt-1 animate-in fade-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-black">
                    <span>Dosagem Alvo por m²</span>
                    <span className="font-mono">
                      {activeInstance.dosagePerM2} {chem.unitLabel}/m²
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="0.05"
                    max="5"
                    step="0.05"
                    value={activeInstance.dosagePerM2}
                    onChange={(e) => updateProductDosage(chem.id, Number(e.target.value))}
                    className="w-full accent-black cursor-ew-resize h-1"
                  />
                  
                  <div className="flex justify-between items-baseline pt-1 text-[10px] font-medium text-[#6B7280]">
                    <span>Consumo Estimado:</span>
                    <span className="font-black text-black font-mono">
                      {(areaSize * activeInstance.dosagePerM2).toFixed(1)} {chem.unitLabel}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[10px] font-medium text-[#6B7280]">
                    <span>Subtotal Químico:</span>
                    <span className="font-extrabold text-emerald-600 font-mono">
                      R$ {(areaSize * activeInstance.dosagePerM2 * chem.unitCost).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
