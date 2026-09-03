import React from 'react';
import { Sparkles, X, Plus, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface POPsCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formName: string;
  setFormName: (val: string) => void;
  formPest: string;
  setFormPest: (val: string) => void;
  formCategory: string;
  setFormCategory: (val: string) => void;
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
  isDragging: boolean;
  uploadedFileName?: string;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleUploadedFiles: (file: File) => void;
  onClearUploadedFile: () => void;
  setIsDragging: (val: boolean) => void;
  isGeneratingAI: boolean;
  handleGenerateProcedureWithAI: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function POPsCreateDialog({
  isOpen,
  onOpenChange,
  formName,
  setFormName,
  formPest,
  setFormPest,
  formCategory,
  setFormCategory,
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
  isDragging,
  uploadedFileName,
  handleDragOver,
  handleDrop,
  handleUploadedFiles,
  onClearUploadedFile,
  setIsDragging,
  isGeneratingAI,
  handleGenerateProcedureWithAI,
  onSubmit,
}: POPsCreateDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        showCloseButton={false}
        className="p-0 overflow-hidden max-w-2xl max-h-[90vh] flex flex-col gap-0 rounded-2xl border border-slate-250 shadow-2xl"
        id="create-modal-container"
      >
        <DialogTitle className="sr-only">Cadastrar Nova Diretriz Técnica (POP)</DialogTitle>
        <DialogDescription className="sr-only">
          Formulário para homologação e cadastro de novo Procedimento Operacional Padrão.
        </DialogDescription>

        <div className="bg-[#1B3A2D] text-white px-6 py-4 flex items-center justify-between" id="create-modal-header">
          <div>
            <span className="text-[9px] font-extrabold tracking-widest text-[#1b3a2d] bg-emerald-300 px-2.5 py-0.5 rounded leading-none uppercase">
              Homologador PestFlow
            </span>
            <h3 className="font-bold text-white text-base font-sans tracking-tight pt-1">
              Cadastrar Nova Diretriz Técnica (POP)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateProcedureWithAI}
              disabled={isGeneratingAI}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-[#1B3A2D] font-extrabold text-xs rounded-lg transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Sparkles className="size-3.5" />
              {isGeneratingAI ? 'Gerando POP...' : 'Gerar com IA'}
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-white/10 rounded-lg text-white/80 transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-6 space-y-5 text-left text-xs font-semibold text-slate-700 overflow-y-auto"
          id="create-pop-form"
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
              placeholder="Ex: POP Controle de Baratas Residencial Especializado"
              className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3" id="create-form-selectors">
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
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 cursor-pointer font-bold"
              >
                <option value="Operacional">Operacional</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Comercial">Comercial</option>
                <option value="Sistemas">Sistemas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3" id="create-form-num-values">
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
              Procedimento Operacional Descrito (Ficha / Práticas)
            </label>
            <textarea
              rows={4}
              required
              value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)}
              placeholder="Escreva as advertências sanitárias e regulamento passo a passo corporativo..."
              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 font-sans font-medium text-slate-805"
            />
          </div>

          {/* CHEMICAL SELECTION */}
          <div className="space-y-2 border-t border-slate-100 pt-3" id="form-chemical-sub-section">
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

            <div className="space-y-1.5" id="form-chemical-lines">
              {formRequiredProducts.map((p, pIdx) => (
                <div key={pIdx} className="flex items-center gap-2" id={`form-chem-line-${pIdx}`}>
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

          {/* ATTACHMENT DRAG AND DROP */}
          <div className="space-y-2 border-t border-slate-100 pt-3" id="attacher-panel-create">
            <span className="text-[11px] font-bold uppercase text-slate-500">
              Documento ou Certificado Técnico de PDF (Opcional)
            </span>
            <div
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('pop-file-upload-create')?.click()}
              className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                isDragging ? 'bg-emerald-50/50 border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <Upload className="size-5 text-slate-400" />
                <span className="text-[11px] font-extrabold text-slate-800">Escolha o anexo de laudo no computador</span>
                <span className="text-[9px] text-slate-400">Limite do navegador recomendado: 3MB (PDF, DOCX, XLSX)</span>
              </div>
              <input
                type="file"
                id="pop-file-upload-create"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleUploadedFiles(e.target.files[0]);
                }}
                className="hidden"
              />
            </div>
            {uploadedFileName && (
              <div className="p-2 bg-blue-50 text-blue-800 rounded-lg flex items-center justify-between text-[11px] font-sans border border-blue-200 mt-2">
                <span className="truncate">{uploadedFileName}</span>
                <button
                  type="button"
                  onClick={onClearUploadedFile}
                  className="text-blue-500 font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* MODAL BOTTOM BUTTONS */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4" id="create-pop-action-buttons">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 font-bold hover:bg-slate-55"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1B3A2D] text-white font-black rounded-lg hover:bg-emerald-800 shadow-sm"
            >
              Homologar e Salvar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
