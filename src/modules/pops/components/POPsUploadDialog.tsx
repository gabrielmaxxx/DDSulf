import React from 'react';
import { X, Upload, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface POPsUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isDragging: boolean;
  setIsDragging: (val: boolean) => void;
  uploadedFileName?: string;
  onClearUploadedFile: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleUploadedFiles: (file: File) => void;
  onProceedToCreate: () => void;
}

export function POPsUploadDialog({
  isOpen,
  onOpenChange,
  isDragging,
  setIsDragging,
  uploadedFileName,
  onClearUploadedFile,
  handleDragOver,
  handleDrop,
  handleUploadedFiles,
  onProceedToCreate,
}: POPsUploadDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        size="md"
        showCloseButton={false}
        className="p-6 max-w-md rounded-2xl border border-slate-250 shadow-2xl relative"
        id="upload-modal-container"
      >
        <DialogTitle className="sr-only">Upload de Documentação POP</DialogTitle>
        <DialogDescription className="sr-only">
          Upload e conversão de diretrizes técnicas e manuais sanitários.
        </DialogDescription>

        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg text-slate-450 transition cursor-pointer"
        >
          <X className="size-5" />
        </button>

        <div className="space-y-4 text-left" id="upload-modal-main-view">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Biblioteca Global: Drag & Drop Uploader</h3>
            <p className="text-xs text-slate-400 font-medium">
              Cadastre insumos em lote arrastando arquivos para conversão instantânea.
            </p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('uploader-file-selector-box')?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragging ? 'bg-emerald-50/50 border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="p-3 bg-white border rounded-lg text-emerald-600 shadow-xs">
                <Upload className="size-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Arraste a diretriz operacional aqui</span>
              <span className="text-[10px] text-slate-400 font-medium max-w-[220px] leading-relaxed">
                Formatos aceitos: PDF, DOCX, DOC, XLS, XLSX, CSV, PPT, PPTX, JPG, PNG (Limite: 3MB)
              </span>
            </div>
            <input
              type="file"
              id="uploader-file-selector-box"
              onChange={(e) => {
                if (e.target.files?.[0]) handleUploadedFiles(e.target.files[0]);
              }}
              className="hidden"
            />
          </div>

          {uploadedFileName && (
            <div className="p-3 bg-emerald-50 text-[#1B3A2D] rounded-lg text-[11px] font-sans border border-emerald-200 mt-2 flex items-center justify-between font-bold">
              <span className="truncate">{uploadedFileName}</span>
              <button
                type="button"
                onClick={onClearUploadedFile}
                className="text-[#1b3a2d] font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-400 font-medium">
            <p className="font-bold text-slate-650 flex items-center gap-1.5">
              <Info className="size-3.5" /> Requisito ANVISA:
            </p>
            <span>
              Cada arquivo acoplado deve conter obrigatoriamente as assinaturas do Responsável Químico correspondente no rodapé da folha oficial.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-50"
            >
              Fechar Uploader
            </button>
            <button
              onClick={onProceedToCreate}
              className="px-4 py-2 bg-[#1B3A2D] text-white text-xs font-bold rounded-lg hover:bg-emerald-800"
            >
              Seguir para Cadastro
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
