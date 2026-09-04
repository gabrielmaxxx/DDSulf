import React from 'react';
import { Button } from '@/components/ui/button';
import {
  FileUp,
  Eye,
  Sparkles,
  Loader2,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';
import { UploadParsedItem } from '../types';

interface InventoryUploadTabProps {
  importType: 'estoque' | 'orcamento';
  setImportType: (t: 'estoque' | 'orcamento') => void;
  isDragging: boolean;
  setIsDragging: (d: boolean) => void;
  uploadedFileName: string;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rawTextPreview: string;
  uploadParsedItems: UploadParsedItem[];
  setUploadParsedItems: React.Dispatch<React.SetStateAction<UploadParsedItem[]>>;
  refineWithAI: () => void;
  isClassifyingWithAI: boolean;
  handleConfirmImport: () => void;
}

export function InventoryUploadTab({
  importType,
  setImportType,
  isDragging,
  setIsDragging,
  uploadedFileName,
  handleDragOver,
  handleDrop,
  handleFileInputChange,
  rawTextPreview,
  uploadParsedItems,
  setUploadParsedItems,
  refineWithAI,
  isClassifyingWithAI,
  handleConfirmImport,
}: InventoryUploadTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Direct selector drag box */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 text-xs font-semibold text-slate-600 shadow-xs">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-display">
              Scanner de XML, PDF e Planilhas
            </h3>
            <p className="text-slate-400 font-medium leading-relaxed mt-1">
              Arraste sua planilha, XML de nota fiscal ou PDF. O motor PestFlow identifica o grupo químico e preenche as equivalências recomendadas.
            </p>
          </div>

          <div className="pt-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Finalidade:
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-55 border border-slate-200 rounded-xl mt-1">
              <button
                type="button"
                onClick={() => setImportType('estoque')}
                className={`py-1.5 rounded-lg text-center font-bold uppercase transition-all cursor-pointer text-[10px] ${
                  importType === 'estoque' ? 'bg-[#1B3A2D] text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Estoque Real
              </button>
              <button
                type="button"
                onClick={() => setImportType('orcamento')}
                className={`py-1.5 rounded-lg text-center font-bold uppercase transition-all cursor-pointer text-[10px] ${
                  importType === 'orcamento' ? 'bg-[#1B3A2D] text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Orçamentário
              </button>
            </div>
          </div>

          {/* Drag container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('scanner-file-picker')?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-[#1B3A2D] bg-emerald-50/10'
                : 'border-slate-200 hover:border-[#1B3A2D] bg-slate-50/20'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <FileUp className="size-8 text-[#1B3A2D]" />
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Arraste ou clique para selecionar</p>
                <p className="text-[10px] text-slate-400 mt-0.5">XLSX, CSV, XML (NF-e) ou PDF de compras</p>
              </div>

              <input
                id="scanner-file-picker"
                type="file"
                accept=".xlsx,.xls,.csv,.xml,.pdf"
                onChange={handleFileInputChange}
                className="sr-only"
              />

              {uploadedFileName && (
                <div className="bg-emerald-100 text-[#1B3A2D] px-3 py-1.5 rounded-full text-[10px] font-black max-w-full truncate border border-emerald-200 mt-1">
                  {uploadedFileName}
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-250/60 rounded-xl space-y-1.5 text-[11px] text-slate-500">
            <span className="font-black uppercase text-slate-800 tracking-wider text-[9px] block">
              💡 Enlace Semântico PestFlow
            </span>
            <p className="leading-relaxed">
              Se o item importado bater com K-Othrine ou Demand, o princípio ativo correspondente é autocompletado.
            </p>
          </div>
        </div>

        {rawTextPreview && (
          <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Eye className="size-3 text-slate-400" /> Prévia dos Dados Brutos
            </span>
            <pre className="p-3.5 bg-[#141410] border border-slate-200 rounded-xl font-mono text-[9px] text-emerald-400 whitespace-pre-wrap max-h-[160px] overflow-y-auto">
              {rawTextPreview}
            </pre>
          </div>
        )}
      </div>

      {/* List to integrate */}
      <div className="lg:col-span-8">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl min-h-[400px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display">
                  Itens Mapeados Semânticos
                </h3>
                <p className="text-slate-400 text-xs">
                  Ajuste os parâmetros antes de finalizar a persistência.
                </p>
              </div>
              {uploadParsedItems.length > 0 && (
                <Button
                  onClick={refineWithAI}
                  disabled={isClassifyingWithAI}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  {isClassifyingWithAI ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  Mapear Princípios com IA
                </Button>
              )}
            </div>

            {uploadParsedItems.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center justify-center gap-4 text-slate-400">
                <FileSpreadsheet className="size-10 text-slate-300" />
                <div>
                  <p className="font-bold text-slate-700">Aguardando importação de arquivos</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                    Use a caixa esquerda para alimentar o sistema e começar a conciliação assistida de insumos.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {uploadParsedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900 text-sm">
                        <input
                          type="checkbox"
                          checked={item.confirmed}
                          onChange={(e) =>
                            setUploadParsedItems((prev) =>
                              prev.map((p) =>
                                p.id === item.id ? { ...p, confirmed: e.target.checked } : p
                              )
                            )
                          }
                          className="size-4 rounded accent-[#1B3A2D] cursor-pointer inline-block"
                        />
                        {item.name}
                      </label>
                      <button
                        onClick={() =>
                          setUploadParsedItems((prev) => prev.filter((p) => p.id !== item.id))
                        }
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-semibold text-slate-500">
                      <div>
                        <span>Ativo</span>
                        <input
                          type="text"
                          value={item.activeIngredient}
                          onChange={(e) =>
                            setUploadParsedItems((prev) =>
                              prev.map((p) =>
                                p.id === item.id ? { ...p, activeIngredient: e.target.value } : p
                              )
                            )
                          }
                          className="w-full h-8 px-2 border border-slate-200 bg-white rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <span>Grupo Químico</span>
                        <input
                          type="text"
                          value={item.chemicalGroup}
                          onChange={(e) =>
                            setUploadParsedItems((prev) =>
                              prev.map((p) =>
                                p.id === item.id ? { ...p, chemicalGroup: e.target.value } : p
                              )
                            )
                          }
                          className="w-full h-8 px-2 border border-slate-200 bg-white rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <span>Qtd</span>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            setUploadParsedItems((prev) =>
                              prev.map((p) =>
                                p.id === item.id
                                  ? { ...p, quantity: parseFloat(e.target.value) || 0 }
                                  : p
                              )
                            )
                          }
                          className="w-full h-8 px-2 border border-slate-200 bg-white rounded-lg text-center font-bold font-mono"
                        />
                      </div>
                      <div>
                        <span>Preço Unitário (R$)</span>
                        <input
                          type="number"
                          value={item.costPerUnit}
                          onChange={(e) =>
                            setUploadParsedItems((prev) =>
                              prev.map((p) =>
                                p.id === item.id
                                  ? { ...p, costPerUnit: parseFloat(e.target.value) || 0 }
                                  : p
                              )
                            )
                          }
                          className="w-full h-8 px-2 border border-slate-200 bg-white rounded-lg font-bold font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {uploadParsedItems.length > 0 && (
            <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Totalizando{' '}
                <b className="text-slate-900 underline">
                  {uploadParsedItems.filter((p) => p.confirmed).length} itens
                </b>{' '}
                prontos para estocagem.
              </span>
              <Button
                onClick={handleConfirmImport}
                className="bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 font-bold uppercase text-xs tracking-wider h-10 px-5 rounded-xl cursor-pointer"
              >
                Efetivar Entrada no Estoque
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
