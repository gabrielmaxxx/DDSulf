import React from 'react';
import { X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ExtendedPOP } from '../types';

interface POPsEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingPop: ExtendedPOP | null;
  formName: string;
  setFormName: (val: string) => void;
  formPest: string;
  setFormPest: (val: string) => void;
  formServiceType: string;
  setFormServiceType: (val: string) => void;
  formTime: number;
  setFormTime: (val: number) => void;
  formSubcategory: string;
  setFormSubcategory: (val: string) => void;
  formInstructions: string;
  setFormInstructions: (val: string) => void;
  formRequiredProducts: any[];
  inventoryProducts: any[];
  addChemicalLine: () => void;
  removeChemicalLine: (idx: number) => void;
  updateChemicalField: (idx: number, field: string, val: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function POPsEditDialog({
  isOpen,
  onOpenChange,
  editingPop,
  formName,
  setFormName,
  formPest,
  setFormPest,
  formServiceType,
  setFormServiceType,
  formTime,
  setFormTime,
  formSubcategory,
  setFormSubcategory,
  formInstructions,
  setFormInstructions,
  formRequiredProducts,
  inventoryProducts,
  addChemicalLine,
  removeChemicalLine,
  updateChemicalField,
  onSubmit,
  onCancel,
}: POPsEditDialogProps) {
  if (!editingPop) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        showCloseButton={false}
        className="p-0 overflow-hidden max-w-2xl max-h-[95vh] flex flex-col gap-0 rounded-2xl border border-slate-250 shadow-2xl"
        id="edit-modal-container"
      >
        <DialogTitle className="sr-only">Editar Procedimento Operacional</DialogTitle>
        <DialogDescription className="sr-only">
          Edição dos parâmetros, dosagens e instruções do POP {editingPop.name}.
        </DialogDescription>

        <div className="bg-[#1B3A2D] text-white px-6 py-4 flex items-center justify-between" id="edit-modal-header">
          <div>
            <span className="text-[9px] font-extrabold tracking-widest text-[#1b3a2d] bg-emerald-300 px-2.5 py-0.5 rounded leading-none uppercase">
              Homologador Técnico
            </span>
            <h3 className="font-bold text-white text-base font-sans tracking-tight pt-1">
              Editar Procedimento Operacional
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-white/10 rounded-lg text-white/80 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-6 space-y-5 text-left text-xs font-semibold text-slate-700 overflow-y-auto"
          id="edit-pop-form"
        >
          <div className="space-y-1">
            <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
              Título Regulamentar
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ex: POP Controle de Baratas Residencial"
              className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 font-sans">
                Tipo de Praga
              </label>
              <select
                value={formPest}
                onChange={(e) => setFormPest(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 cursor-pointer font-bold"
              >
                <option value="baratas">Baratas</option>
                <option value="formigas">Formigas</option>
                <option value="cupins">Cupins</option>
                <option value="ratos">Roedores</option>
                <option value="escorpioes">Escorpiões</option>
                <option value="outro">Outro / Geral</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 font-sans">
                Setor de Atuação
              </label>
              <select
                value={formServiceType}
                onChange={(e) => setFormServiceType(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 cursor-pointer font-bold"
              >
                <option value="dedetizacao">Dedetização (Operacional)</option>
                <option value="desratizacao">Desratização (Operacional)</option>
                <option value="descupinizacao">Descupinização (Operacional)</option>
                <option value="sanitizacao">Sanitização (Operacional)</option>
                <option value="administrativo">Administrativo</option>
                <option value="financeiro">Financeiro</option>
                <option value="comercial">Comercial</option>
                <option value="sistemas">Sistemas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
                Tempo Estimado (Horas por 100m²)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formTime}
                onChange={(e) => setFormTime(parseFloat(e.target.value) || 1.0)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 font-medium text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
                Subcategoria Opcional (Seletivo)
              </label>
              <input
                type="text"
                value={formSubcategory}
                onChange={(e) => setFormSubcategory(e.target.value)}
                placeholder="Ex: Controle de Baratas"
                className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 font-medium text-slate-850"
              />
            </div>
          </div>

          {/* TEXT DIRECTIVES */}
          <div className="space-y-1">
            <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
              Procedimento Operacional Descrito
            </label>
            <textarea
              rows={4}
              required
              value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)}
              placeholder="Escreva as advertências passo a passo..."
              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 font-sans font-medium text-slate-805"
            />
          </div>

          {/* CHEMICAL SELECTION */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-500">Insumos Químicos Associados</span>
              <button
                type="button"
                onClick={addChemicalLine}
                className="px-2 py-1 bg-slate-100 border text-slate-650 hover:bg-slate-200 text-[10px] font-extrabold rounded flex items-center gap-1"
              >
                <Plus className="size-3" /> + Associar Insumo
              </button>
            </div>

            <div className="space-y-1.5" id="edit-chemical-lines">
              {formRequiredProducts.map((p, pIdx) => (
                <div key={pIdx} className="flex items-center gap-2" id={`edit-chem-line-${pIdx}`}>
                  <select
                    value={p.productId}
                    onChange={(e) => updateChemicalField(pIdx, 'productId', e.target.value)}
                    className="flex-1 h-9 px-2 border rounded-lg bg-white text-[11px]"
                  >
                    {inventoryProducts.map((pDef) => (
                      <option key={pDef.id} value={pDef.id}>
                        {pDef.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={p.quantityPer100m2}
                    onChange={(e) => updateChemicalField(pIdx, 'quantityPer100m2', parseFloat(e.target.value) || 0)}
                    placeholder="Dosagem"
                    className="w-20 h-9 px-2 border rounded-lg text-center font-bold text-[11px]"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-500 w-8">{p.unit}</span>
                  <button
                    type="button"
                    onClick={() => removeChemicalLine(pIdx)}
                    className="p-1 px-1.5 text-red-500 hover:bg-red-50 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {formRequiredProducts.length === 0 && (
                <p className="text-[10px] font-medium italic text-slate-400 py-1">Não há insumos indicados.</p>
              )}
            </div>
          </div>

          {/* MODAL BOTTOM BUTTONS */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-lg text-slate-600 font-bold hover:bg-slate-55"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1B3A2D] text-white font-black rounded-lg hover:bg-emerald-800 shadow-sm"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
