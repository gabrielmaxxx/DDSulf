import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  File, 
  Image as ImageIcon,
  FileSpreadsheet,
  X,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  url?: string;
}

interface FileUploadProps {
  files?: UploadedFile[];
  onFilesChange?: (files: UploadedFile[]) => void;
  maxFiles?: number;
}

export function FileUpload({ files: initialFiles = [], onFilesChange, maxFiles = 5 }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [isDragActive, setIsDragActive] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedFormats = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'webp'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFiles = (uploadedList: FileList | null) => {
    if (!uploadedList) return;
    
    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < uploadedList.length; i++) {
      const file = uploadedList[i];
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      
      if (!allowedFormats.includes(extension)) {
        toast.error(`Formato .${extension} não suportado! Use PDF, DOC, XLS, PNG, etc.`);
        continue;
      }

      // Format size
      const sizeInMB = file.size / (1024 * 1024);
      const sizeStr = sizeInMB < 0.1 
        ? `${(file.size / 1024).toFixed(1)} KB` 
        : `${sizeInMB.toFixed(2)} MB`;

      // Simular upload URL para imagens
      let simulatedUrl = undefined;
      if (file.type.startsWith('image/')) {
        simulatedUrl = URL.createObjectURL(file);
      }

      newFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type || `application/${extension}`,
        size: sizeStr,
        date: new Date().toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        url: simulatedUrl
      });
    }

    if (newFiles.length === 0) return;

    const updated = [...files, ...newFiles].slice(0, maxFiles);
    setFiles(updated);
    if (onFilesChange) onFilesChange(updated);
    toast.success(`${newFiles.length} arquivo(s) importado(s) com sucesso!`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = (id: string, name: string) => {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    if (onFilesChange) onFilesChange(updated);
    toast.success(`Arquivo "${name}" excluído!`);
  };

  const startRename = (id: string, currentName: string) => {
    setEditingFileId(id);
    setEditingName(currentName);
  };

  const saveRename = (id: string) => {
    if (!editingName.trim()) return;
    const updated = files.map(f => {
      if (f.id === id) {
        const ext = f.name.split('.').pop() || '';
        const baseName = editingName.includes('.') ? editingName : `${editingName}.${ext}`;
        return { ...f, name: baseName };
      }
      return f;
    });
    setFiles(updated);
    if (onFilesChange) onFilesChange(updated);
    setEditingFileId(null);
    toast.success("Arquivo renomeado com sucesso!");
  };

  const downloadFile = (file: UploadedFile) => {
    // Simulando download
    const element = document.createElement("a");
    const testContent = "Simulated download of: " + file.name;
    const fileBlob = new Blob([testContent], {type: 'text/plain'});
    element.href = file.url || URL.createObjectURL(fileBlob);
    element.download = file.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Formatando download de "${file.name}"...`);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="size-6 text-emerald-600 shrink-0" />;
      case 'pdf':
        return <FileText className="size-6 text-rose-600 shrink-0" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
        return <ImageIcon className="size-6 text-blue-600 shrink-0" />;
      default:
        return <File className="size-6 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* DROP AREA */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all duration-300 select-none
          ${isDragActive 
            ? 'border-[#1B3A2D] bg-emerald-50/20 scale-[0.99] shadow-inner' 
            : 'border-slate-200 bg-white hover:border-[#1B3A2D]/60 hover:bg-slate-50/40'}`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
          className="hidden" 
          onChange={handleFileInputChange}
        />
        <div className="size-14 rounded-2xl bg-[#1B3A2D]/5 flex items-center justify-center text-[#1B3A2D] shadow-sm">
          <UploadCloud className="size-7" />
        </div>
        <div className="space-y-1">
          <p className="font-sans font-bold text-sm text-slate-800">
            Arraste arquivos aqui
          </p>
          <p className="text-xs font-semibold text-slate-400">
            ou <span className="text-[#1B3A2D] underline font-bold">clique para selecionar</span>
          </p>
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mt-1 leading-normal leading-relaxed">
          Formatos aceitos: PDF, DOCX, XLSX, CSV, PPTX, JPG, PNG
        </div>
      </div>

      {/* FILE LIST */}
      {files.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left mt-4 border-b border-slate-100 pb-1.5">
            Arquivos Anexados ({files.length})
          </p>
          <div className="grid grid-cols-1 gap-2.5">
            {files.map(file => (
              <div 
                key={file.id} 
                className="bg-white border border-slate-200/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:bg-slate-50/50 hover:shadow-xs text-left"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="size-11 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    {editingFileId === file.id ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="h-8 max-w-md px-2 py-1 text-xs border border-slate-300 rounded-lg focus-visible:border-[#1B3A2D] outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(file.id);
                            if (e.key === 'Escape') setEditingFileId(null);
                          }}
                          autoFocus
                        />
                        <button 
                          onClick={() => saveRename(file.id)}
                          className="size-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center cursor-pointer shrink-0"
                        >
                          <Check className="size-4" />
                        </button>
                        <button 
                          onClick={() => setEditingFileId(null)}
                          className="size-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer shrink-0"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <h5 className="font-sans font-bold text-sm text-slate-800 truncate" title={file.name}>
                        {file.name}
                      </h5>
                    )}
                    <div className="flex items-center gap-2.5 text-[10.5px] font-semibold text-slate-400 font-sans tracking-wide">
                      <span className="uppercase font-mono">{file.type.split('/')[1] || 'DOC'}</span>
                      <span className="size-1 bg-slate-300 rounded-full" />
                      <span>{file.size}</span>
                      <span className="size-1 bg-slate-300 rounded-full" />
                      <span>{file.date}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => setPreviewFile(file)}
                    title="Visualizar"
                    className="size-9 rounded-lg border border-slate-200/60 bg-white text-slate-500 hover:text-black hover:shadow-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Eye className="size-4.5" />
                  </button>
                  <button
                    onClick={() => downloadFile(file)}
                    title="Baixar"
                    className="size-9 rounded-lg border border-slate-200/60 bg-white text-slate-500 hover:text-black hover:shadow-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Download className="size-4.5" />
                  </button>
                  <button
                    onClick={() => startRename(file.id, file.name)}
                    title="Renomear"
                    className="size-9 rounded-lg border border-slate-200/60 bg-white text-slate-500 hover:text-black hover:shadow-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Edit3 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id, file.name)}
                    title="Excluir"
                    className="size-9 rounded-lg border border-red-200 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 text-left border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-sans font-bold text-base text-slate-800 truncate pr-4">
                Visualização: {previewFile.name}
              </h3>
              <button 
                onClick={() => setPreviewFile(null)}
                className="size-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer shrink-0 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            
            <div className="py-8 flex flex-col items-center justify-center">
              {previewFile.url ? (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name} 
                  referrerPolicy="no-referrer"
                  className="max-h-[300px] object-contain rounded-xl border border-slate-150 shadow-sm"
                />
              ) : (
                <div className="size-20 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 mb-4 shadow-sm">
                  {getFileIcon(previewFile.name)}
                </div>
              )}
              
              <div className="text-center mt-4 space-y-1.5">
                <p className="font-sans font-bold text-sm text-slate-800">{previewFile.name}</p>
                <p className="text-xs font-semibold text-slate-400">{previewFile.size} • {previewFile.date}</p>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end mt-4 border-t border-slate-100 pt-4">
              <button
                onClick={() => {
                  downloadFile(previewFile);
                  setPreviewFile(null);
                }}
                className="px-4 py-2 bg-[#1B3A2D] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#1B3A2D]/90 transition-all cursor-pointer h-10"
              >
                Baixar Arquivo
              </button>
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all cursor-pointer h-10"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
